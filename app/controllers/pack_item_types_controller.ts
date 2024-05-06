import type { HttpContext } from '@adonisjs/core/http'
import PackItemType from '#models/pack_item_type'
import PackItemTypePolicy from '#policies/pack_item_type_policy'
import { requestParamsCuidValidator } from '#validators/request'
import ControllerService from '#services/controller_service'
import { storePackItemTypeValidator, updatePackItemTypeValidator } from '#validators/pack_item_type'

export default class PackItemTypesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackItemTypePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackItemType.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackItemType = await PackItemType.findBy({ id: params.id })
    if (requestedPackItemType === null || requestedPackItemType === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('show', requestedPackItemType))
      return response.forbidden('Insufficient permissions')
    return await PackItemType.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemTypePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackItemTypeValidator)
    await PackItemType.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItemType = await PackItemType.findBy({ id: params.id })
    if (requestedPackItemType === null || requestedPackItemType === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('update', requestedPackItemType))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(
      updatePackItemTypeValidator(requestedPackItemType.id)
    )
    await PackItemType.updateOrCreate({ id: requestedPackItemType.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItemType = await PackItemType.findBy({ id: params.id })
    if (requestedPackItemType === null || requestedPackItemType === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemTypePolicy).denies('destroy', requestedPackItemType))
      return response.forbidden('Insufficient permissions')
    return await requestedPackItemType.delete()
  }
}
