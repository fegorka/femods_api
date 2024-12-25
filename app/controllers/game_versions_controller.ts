import type { HttpContext } from '@adonisjs/core/http'

import GameVersion from '#models/game_version'
import GameVersionPolicy from '#policies/game_version_policy'
import ControllerService from '#services/controller_service'

import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'
import { storeGameVersionValidator, updateGameVersionValidator } from '#validators/game_version'

export default class GameVersionsController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(GameVersion))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(GameVersionPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(GameVersion.query(), request.input('includes'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(GameVersion))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedGameVersion = await GameVersion.findBy({ id: params.id })
    if (requestedGameVersion === null || requestedGameVersion === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(GameVersionPolicy).denies('show', requestedGameVersion))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      GameVersion.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(GameVersionPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeGameVersionValidator)
    await GameVersion.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedGameVersion = await GameVersion.findBy({ id: params.id })
    if (requestedGameVersion === null || requestedGameVersion === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(GameVersionPolicy).denies('update', requestedGameVersion))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateGameVersionValidator(requestedGameVersion.id))
    await GameVersion.updateOrCreate({ id: requestedGameVersion.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedGameVersion = await GameVersion.findBy({ id: params.id })
    if (requestedGameVersion === null || requestedGameVersion === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(GameVersionPolicy).denies('destroy', requestedGameVersion))
      return response.forbidden('Insufficient permissions')
    return await requestedGameVersion.delete()
  }
}
