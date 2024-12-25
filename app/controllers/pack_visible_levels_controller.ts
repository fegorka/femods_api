import type { HttpContext } from '@adonisjs/core/http'

import PackVisibleLevel from '#models/pack_visible_level'
import PackVisibleLevelPolicy from '#policies/pack_visible_level_policy'
import ControllerService from '#services/controller_service'

import {
  storePackVisibleLevelValidator,
  updatePackVisibleLevelValidator,
} from '#validators/pack_visible_level'
import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'

export default class PackVisibleLevelsController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(PackVisibleLevel))
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackVisibleLevelPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackVisibleLevel.query(),
      request.input('includes')
    )
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackVisibleLevel))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackVisibleLevel = await ControllerService.includeRelations(
      PackVisibleLevel.query().where('id', params.id),
      request.input('includes')
    )
    if (requestedPackVisibleLevel === null || requestedPackVisibleLevel === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackVisibleLevelPolicy).denies('show', requestedPackVisibleLevel))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackVisibleLevel.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
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

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
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

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackVisibleLevelPolicy).denies('destroy', requestedPackVisibleLevel))
      return response.forbidden('Insufficient permissions')
    return await requestedPackVisibleLevel.delete()
  }
}
