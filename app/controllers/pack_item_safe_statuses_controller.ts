import type { HttpContext } from '@adonisjs/core/http'
import { requestParamsCuidValidator } from '#validators/request'
import PackItemSafeStatus from '#models/pack_item_safe_status'
import PackItemSafeStatusPolicy from '#policies/pack_item_safe_status_policy'
import ControllerService from '#services/controller_service'
import {
  storePackItemSafeStatusValidator,
  updatePackItemSafeStatusValidator,
} from '#validators/pack_item_safe_status'

export default class PackItemSafeStatusesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackItemSafeStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackItemSafeStatus.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackItemSafeStatus = await PackItemSafeStatus.findBy({ id: params.id })
    if (requestedPackItemSafeStatus === null || requestedPackItemSafeStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('show', requestedPackItemSafeStatus))
      return response.forbidden('Insufficient permissions')
    return await PackItemSafeStatus.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemSafeStatusPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackItemSafeStatusValidator)
    await PackItemSafeStatus.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItemSafeStatus = await PackItemSafeStatus.findBy({ id: params.id })
    if (requestedPackItemSafeStatus === null || requestedPackItemSafeStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('update', requestedPackItemSafeStatus))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(
      updatePackItemSafeStatusValidator(requestedPackItemSafeStatus.id)
    )
    await PackItemSafeStatus.updateOrCreate({ id: requestedPackItemSafeStatus.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItemSafeStatus = await PackItemSafeStatus.findBy({ id: params.id })
    if (requestedPackItemSafeStatus === null || requestedPackItemSafeStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackItemSafeStatusPolicy).denies('destroy', requestedPackItemSafeStatus))
      return response.forbidden('Insufficient permissions')
    return await requestedPackItemSafeStatus.delete()
  }
}
