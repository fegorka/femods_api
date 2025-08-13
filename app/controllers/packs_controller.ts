import type { HttpContext } from '@adonisjs/core/http'
import Pack from '#models/pack'
import User from '#models/user'
import PackPolicy from '#policies/pack_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'
import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSearchValidator,
  requestSortValidator,
} from '#validators/request'
import {
  indexByTagPackValidator,
  indexByUserPackValidator,
  storePackValidator,
  updatePackValidator,
} from '#validators/pack'

export default class PacksController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestSearchValidator)
    await request.validateUsing(requestIncludeValidator(Pack))
    await request.validateUsing(requestSortValidator(Pack))

    const search = request.input('search', []) as string | string[] | [] // by validators

    const initial = (await bouncer.with(PackPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : Pack.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))
      .transform((q) =>
        search
          ? ControllerService.applySearchTokens(q, search, (subQ, token) =>
              subQ
                .whereILike('publicName', `%${token}%`)
                .orWhereHas('user', (userQ) => userQ.whereILike('publicName', `%${token}%`))
                .orWhereHas('packModCore', (packModeCoreQ) =>
                  packModeCoreQ.whereILike('name', `%${token}%`)
                )
                .orWhereHas('packReleases', (packReleasesQ) =>
                  packReleasesQ.whereHas('gameVersion', (gameVerisonQ) =>
                    gameVerisonQ.whereILike('name', `%${token}%`)
                  )
                )
            )
          : q
      )

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async indexByTag({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(indexByTagPackValidator)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(Pack))

    const initial = (await bouncer.with(PackPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : Pack.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => q.whereHas('tags', (tq) => tq.where('tag_id', params.tagId)))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async indexByUser({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(indexByUserPackValidator)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(Pack))

    if (auth.user?.id === params.userId) {
      return Pack.findManyBy({ userId: params.userId })
    }

    const includes = request.input('includes')
    const initial = (await bouncer.with(PackPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : Pack.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, includes))
      .transform((q) => q.where('userId', params.userId))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }
    const payload = await request.validateUsing(storePackValidator)
    await Pack.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(Pack))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const pack = await Pack.findBy({ id: params.id })
    if (!pack) return response.notFound()
    if (await bouncer.with(PackPolicy).denies('show', pack)) {
      return response.forbidden('Insufficient permissions')
    }

    const includes = request.input('includes')
    const pipeline = new QueryPipelineService(Pack.query().where('id', params.id)).transform((q) =>
      ControllerService.includeRelations(q, includes)
    )

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    const pack = await Pack.findBy({ id: params.id })
    if (!pack) return response.notFound()
    if (await bouncer.with(PackPolicy).denies('update', pack)) {
      return response.forbidden('Insufficient permissions')
    }
    const payload = await request.validateUsing(updatePackValidator(pack.id))
    await Pack.updateOrCreate({ id: pack.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    const pack = await Pack.findBy({ id: params.id })
    if (!pack) return response.notFound()
    if (await bouncer.with(PackPolicy).denies('destroy', pack)) {
      return response.forbidden('Insufficient permissions')
    }
    return pack.delete()
  }

  private baseVisibilityQuery = () =>
    Pack.query()
      .whereHas('packStatus', (q) => q.whereIn('name', Pack.allowedPackStatusToIndex))
      .andWhereHas('packVisibleLevel', (q) =>
        q.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
      )
      .andWhereHas('user', (q) =>
        q.whereHas('userStatus', (q2) => q2.whereIn('name', User.allowedUserStatusToIndex))
      )
}
