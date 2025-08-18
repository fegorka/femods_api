import type { HttpContext } from '@adonisjs/core/http'

import PackItemType from '#models/pack_item_type'
import PackItemTypePolicy from '#policies/pack_item_type_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'

import {
  requestIncludeValidator,
  requestParamsCuidValidator,
  requestPageValidator,
  requestSortValidator,
} from '#validators/request'

import { storePackItemTypeValidator, updatePackItemTypeValidator } from '#validators/pack_item_type'

export default class PackItemTypesController {
  async index({ bouncer, response, request, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItemType))
    await request.validateUsing(requestSortValidator(PackItemType))

    if (await bouncer.with(PackItemTypePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')

    const pipeline = new TransformerService(PackItemType.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(PackItemType))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackItemType = await PackItemType.findBy({ id: params.id })
    if (!requestedPackItemType) return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('show', requestedPackItemType))
      return response.forbidden('Insufficient permissions')

    const pipeline = new TransformerService(
      PackItemType.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemTypePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackItemTypeValidator)
    await PackItemType.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItemType.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedPackItemType = await pipeline.query().first()
    if (!requestedPackItemType) return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('update', requestedPackItemType))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(
      updatePackItemTypeValidator(requestedPackItemType.id)
    )
    await PackItemType.updateOrCreate({ id: requestedPackItemType.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItemType.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedPackItemType = await pipeline.query().first()
    if (!requestedPackItemType) return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('destroy', requestedPackItemType))
      return response.forbidden('Insufficient permissions')

    return await requestedPackItemType.delete()
  }
}
