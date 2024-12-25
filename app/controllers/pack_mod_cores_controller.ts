import type { HttpContext } from '@adonisjs/core/http'

import PackModCore from '#models/pack_mod_core'
import PackModCorePolicy from '#policies/pack_mod_core_policy'
import ControllerService from '#services/controller_service'

import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'
import { storePackModCoreValidator, updatepackModCoreValidator } from '#validators/pack_mod_core'

export default class PackModCoresController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(PackModCore))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackModCorePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(PackModCore.query(), request.input('includes'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackModCore))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (requestedPackModCore === null || requestedPackModCore === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackModCorePolicy).denies('show', requestedPackModCore))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackModCore.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackModCorePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackModCoreValidator)
    await PackModCore.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (requestedPackModCore === null || requestedPackModCore === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackModCorePolicy).denies('update', requestedPackModCore))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updatepackModCoreValidator(requestedPackModCore.id))
    await PackModCore.updateOrCreate({ id: requestedPackModCore.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (requestedPackModCore === null || requestedPackModCore === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackModCorePolicy).denies('destroy', requestedPackModCore))
      return response.forbidden('Insufficient permissions')
    return await requestedPackModCore.delete()
  }
}
