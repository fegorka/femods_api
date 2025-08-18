import type { HttpContext } from '@adonisjs/core/http'
import PackItemSafeStatus from '#models/pack_item_safe_status'
import PackItemSafeStatusPolicy from '#policies/pack_item_safe_status_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'
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

    const pipeline = new TransformerService(PackItemSafeStatus.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'packItemSafeStatuses',
        tags: ['packItemSafeStatus:index'],
        ttl: '12h',
        grace: '24h',
      }
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

    const pipeline = new TransformerService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'packItemSafeStatuses',
      tags: [`packItemSafeStatus:${params.id}`],
      ttl: '12h',
      grace: '24h',
    })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemSafeStatusPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(storePackItemSafeStatusValidator)

    await TransformerService.invalidateCache({ namespace: 'packItemSafeStatuses' })
    await PackItemSafeStatus.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const entity = await pipeline.query().first()
    if (!entity) return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('update', entity)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updatePackItemSafeStatusValidator(entity.id))
    await TransformerService.invalidateCache({ namespace: 'packItemSafeStatuses' })
    await PackItemSafeStatus.updateOrCreate({ id: entity.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItemSafeStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const entity = await pipeline.query().first()
    if (!entity) return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('destroy', entity)) {
      return response.forbidden('Insufficient permissions')
    }

    await TransformerService.invalidateCache({ namespace: 'packItemSafeStatuses' })
    return await entity.delete()
  }
}
