import type { HttpContext } from '@adonisjs/core/http'

import GameVersion from '#models/game_version'
import GameVersionPolicy from '#policies/game_version_policy'
import ControllerService from '#services/controller_service'

import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'
import { storeGameVersionValidator, updateGameVersionValidator } from '#validators/game_version'
import { ResponseCacheService } from '#services/response_cache_service'

export default class GameVersionsController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(GameVersion))
    if (await bouncer.with(GameVersionPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ResponseCacheService.getOrSet(
      request,
      120,
      async () =>
        await ControllerService.includeRelations(GameVersion.query(), request.input('includes'))
    )
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(GameVersion))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedGameVersion = await GameVersion.findBy({ id: params.id })
    if (requestedGameVersion === null || requestedGameVersion === undefined)
      return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('show', requestedGameVersion))
      return response.forbidden('Insufficient permissions')
    return await ResponseCacheService.getOrSet(
      request,
      120,
      async () =>
        await ControllerService.includeRelations(
          GameVersion.query().where('id', params.id),
          request.input('includes')
        )
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
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

    if (await bouncer.with(GameVersionPolicy).denies('destroy', requestedGameVersion))
      return response.forbidden('Insufficient permissions')
    return await requestedGameVersion.delete()
  }
}
