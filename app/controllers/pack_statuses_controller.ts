import type { HttpContext } from '@adonisjs/core/http'

import PackStatus from '#models/pack_status'
import PackStatusPolicy from '#policies/pack_status_policy'
import ControllerService from '#services/controller_service'

import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'
import { storePackStatusValidator, updatePackStatusValidator } from '#validators/pack_status'

export default class PackStatusesController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(PackStatus))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(PackStatus.query(), request.input('includes'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackStatus))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackStatusPolicy).denies('show', requestedPackStatus))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackStatus.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackStatusPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackStatusValidator)
    await PackStatus.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackStatusPolicy).denies('update', requestedPackStatus))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updatePackStatusValidator(requestedPackStatus.id))
    await PackStatus.updateOrCreate({ id: requestedPackStatus.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackStatusPolicy).denies('destroy', requestedPackStatus))
      return response.forbidden('Insufficient permissions')
    return await requestedPackStatus.delete()
  }
}
