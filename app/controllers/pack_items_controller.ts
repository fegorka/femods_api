import type { HttpContext } from '@adonisjs/core/http'

import PackItem from '#models/pack_item'
import Pack from '#models/pack'
import User from '#models/user'
import PackRelease from '#models/pack_release'
import PackItemPolicy from '#policies/pack_item_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import {
  indexByPackReleasePackItemValidator,
  preCheckPackItemReleaseIdValidator,
  storePackItemValidator,
  updatePackItemValidator,
} from '#validators/pack_item'

export default class PackItemsController {
  private baseVisibilityQuery = () =>
    PackItem.query().whereHas('packRelease', (packReleaseQuery) => {
      packReleaseQuery.whereHas('pack', (packQuery) => {
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
    })

  public async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))
    await request.validateUsing(requestSortValidator(PackItem))

    const initial = (await bouncer.with(PackItemPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackItem.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  public async indexByPackRelease({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(indexByPackReleasePackItemValidator)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))
    await request.validateUsing(requestSortValidator(PackItem))

    const packRelease = await PackRelease.findBy({ id: params.packReleaseId })
    const pack = packRelease?.packId ? await Pack.findBy({ id: packRelease.packId }) : null

    if (auth.user?.id === pack?.userId) {
      return PackItem.query()
        .where('packReleaseId', params.packReleaseId)
        .paginate(request.input('page'), request.input('limit'))
    }

    const initial = (await bouncer.with(PackItemPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackItem.query()

    const pipeline = new QueryPipelineService(initial)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))
      .transform((q) => q.where('packReleaseId', params.packReleaseId))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  public async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackItemValidator(request.body().packReleaseId)
    )
    await PackItem.create(payload)
  }

  public async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const item = await PackItem.findBy({ id: params.id })
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('show', item)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(
      PackItem.query().where('id', params.id)
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  public async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const item = await PackItem.findBy({ id: params.id })
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('update', item)) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackItemValidator(request.body().packReleaseId, item.id)
    )
    await PackItem.updateOrCreate({ id: item.id }, payload)
  }

  public async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const item = await PackItem.findBy({ id: params.id })
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('destroy', item)) {
      return response.forbidden('Insufficient permissions')
    }

    return item.delete()
  }
}
