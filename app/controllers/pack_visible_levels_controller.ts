import type { HttpContext } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'
import PackVisibleLevel from '#models/pack_visible_level'
import PackVisibleLevelPolicy from '#policies/pack_visible_level_policy'
import { requestParamsCuidValidator } from '#validators/request'
import {
  storePackVisibleLevelValidator,
  updatePackVisibleLevelValidator,
} from '#validators/pack_visible_level'

export default class PackVisibleLevelsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackVisibleLevelPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackVisibleLevel.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (requestedPackVisibleLevel === null || requestedPackVisibleLevel === undefined)
      return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('show', requestedPackVisibleLevel))
      return response.forbidden('Insufficient permissions')
    return await PackVisibleLevel.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackVisibleLevelPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackVisibleLevelValidator)
    await PackVisibleLevel.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (requestedPackVisibleLevel === null || requestedPackVisibleLevel === undefined)
      return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('update', requestedPackVisibleLevel))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(
      updatePackVisibleLevelValidator(requestedPackVisibleLevel.id)
    )
    await PackVisibleLevel.updateOrCreate({ id: requestedPackVisibleLevel.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (requestedPackVisibleLevel === null || requestedPackVisibleLevel === undefined)
      return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('destroy', requestedPackVisibleLevel))
      return response.forbidden('Insufficient permissions')
    return await requestedPackVisibleLevel.delete()
  }
}
