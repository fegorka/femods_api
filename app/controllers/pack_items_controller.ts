import type { HttpContext } from '@adonisjs/core/http'
import PackItemPolicy from '#policies/pack_item_policy'
import PackItem from '#models/pack_item'
import { requestParamsCuidValidator } from '#validators/request'
import ControllerService from '#services/controller_service'
import {
  preCheckPackItemReleaseIdValidator,
  storePackItemValidator,
  updatePackItemValidator,
} from '#validators/pack_item'

export default class PackItemsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackItemPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackItem.all()
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackItemValidator(request.body().packReleaseId)
    )
    await PackItem.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    if (await bouncer.with(PackItemPolicy).denies('show', requestedPackItem))
      return response.forbidden('Insufficient permissions')
    return await PackItem.findBy({ id: params.id })
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    if (await bouncer.with(PackItemPolicy).denies('update', requestedPackItem))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackItemValidator(request.body().packReleaseId)
    )
    await PackItem.updateOrCreate({ id: requestedPackItem.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    if (await bouncer.with(PackItemPolicy).denies('destroy', requestedPackItem))
      return response.forbidden('Insufficient permissions')
    return await requestedPackItem.delete()
  }
}
