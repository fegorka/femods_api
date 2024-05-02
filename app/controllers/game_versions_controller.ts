import type { HttpContext } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'
import GameVersionPolicy from '#policies/game_version_policy'
import GameVersion from '#models/game_version'
import { requestParamsCuidValidator } from '#validators/request'
import { storeGameVersionValidator, updateGameVersionValidator } from '#validators/game_version'

export default class GameVersionsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(GameVersionPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await GameVersion.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedGameVersion = await GameVersion.findBy({ id: params.id })
    if (requestedGameVersion === null || requestedGameVersion === undefined)
      return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('show', requestedGameVersion))
      return response.forbidden('Insufficient permissions')
    return await GameVersion.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(GameVersionPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeGameVersionValidator)
    await GameVersion.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUser = await GameVersion.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('update', requestedUser))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateGameVersionValidator)
    await GameVersion.updateOrCreate({ id: requestedUser.id }, payload)
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
