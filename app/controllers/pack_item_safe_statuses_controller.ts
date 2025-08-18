import type { HttpContext } from '@adonisjs/core/http'
import PackItemSafeStatus from '#models/pack_item_safe_status'
import PackItemSafeStatusPolicy from '#policies/pack_item_safe_status_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'
import {
  requestIncludeValidator,
  requestParamsCuidValidator,
  requestPageValidator,
  requestSortValidator,
} from '#validators/request'
import {
  storePackItemSafeStatusValidator,
  updatePackItemSafeStatusValidator,
} from '#validators/pack_item_safe_status'

export default class PackItemSafeStatusesController {
  async index({ bouncer, request, response, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItemSafeStatus))
    await request.validateUsing(requestSortValidator(PackItemSafeStatus))

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('index')) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(PackItemSafeStatus.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(PackItemSafeStatus))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const entity = await PackItemSafeStatus.findBy({ id: params.id })
    if (!entity) return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('show', entity)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemSafeStatusPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(storePackItemSafeStatusValidator)
    await PackItemSafeStatus.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new QueryPipelineService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const entity = await pipeline.query().first()
    if (!entity) return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('update', entity)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updatePackItemSafeStatusValidator(entity.id))
    await PackItemSafeStatus.updateOrCreate({ id: entity.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new QueryPipelineService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const entity = await pipeline.query().first()
    if (!entity) return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('destroy', entity)) {
      return response.forbidden('Insufficient permissions')
    }

    return await entity.delete()
  }
}
