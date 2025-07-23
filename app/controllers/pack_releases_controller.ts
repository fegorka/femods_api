import type { HttpContext } from '@adonisjs/core/http'
import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import User from '#models/user'
import Pack from '#models/pack'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import {
  indexByPackPackReleaseValidator,
  preCheckPackReleasePackIdValidator,
  storePackReleaseIdeValidator,
  updatePackReleaseIdValidator,
} from '#validators/pack_release'

export default class PackReleasesController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))
    await request.validateUsing(requestSortValidator(PackRelease))

    const initial = (await bouncer.with(PackReleasePolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackRelease.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async indexByPack({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(indexByPackPackReleaseValidator)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))
    await request.validateUsing(requestSortValidator(PackRelease))

    const pack = await Pack.findBy({ id: params.packId })
    const userId = auth.user?.id ?? null
    const packUserId = pack?.userId ?? null

    if (userId === packUserId) {
      const pipeline = new QueryPipelineService(
        PackRelease.query().where('packId', params.packId)
      )
        .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
        .transform((q) => ControllerService.applySorting(q, request.input('sort')))

      return pipeline.executeWithCache(request, 120, (q) =>
        q.paginate(request.input('page'), request.input('limit'))
      )
    }

    const initial = (await bouncer.with(PackReleasePolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackRelease.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))
      .transform((q) => q.where('packId', params.packId))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackReleasePolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(
      storePackReleaseIdeValidator(request.body().packId)
    )
    await PackRelease.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const packRelease = await PackRelease.findBy({ id: params.id })
    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('show', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(
      PackRelease.query().where('id', params.id)
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const packRelease = await PackRelease.findBy({ id: params.id })
    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('update', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(
      updatePackReleaseIdValidator(request.body().packId, packRelease.id)
    )
    await PackRelease.updateOrCreate({ id: packRelease.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const packRelease = await PackRelease.findBy({ id: params.id })
    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('destroy', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    return packRelease.delete()
  }

  private baseVisibilityQuery = () =>
  PackRelease.query().whereHas('pack', (packQuery) => {
    packQuery
      .whereHas('packStatus', (q) =>
        q.whereIn('name', Pack.allowedPackStatusToIndex)
      )
      .andWhereHas('packVisibleLevel', (q) =>
        q.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
      )
      .andWhereHas('user', (q) =>
        q.whereHas('userStatus', (q2) =>
          q2.whereIn('name', User.allowedUserStatusToIndex)
        )
      )
  })
}
