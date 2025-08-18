import type { HttpContext } from '@adonisjs/core/http'
import GameVersion from '#models/game_version'
import GameVersionPolicy from '#policies/game_version_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'
import { storeGameVersionValidator, updateGameVersionValidator } from '#validators/game_version'
import {
  requestIncludeValidator,
  requestParamsCuidValidator,
  requestPageValidator,
  requestSortValidator,
} from '#validators/request'

export default class GameVersionsController {
  async index({ bouncer, response, request, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(GameVersion))
    await request.validateUsing(requestSortValidator(GameVersion))

    if (await bouncer.with(GameVersionPolicy).denies('index')) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(GameVersion.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(GameVersion))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const gameVersion = await GameVersion.findBy({ id: params.id })
    if (!gameVersion) return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('show', gameVersion)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(
      GameVersion.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(GameVersionPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }
    const payload = await request.validateUsing(storeGameVersionValidator)
    await GameVersion.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      GameVersion.query().where('id', params.id),
      appMeta?.transformer
    )
    const gameVersion = await pipeline.query().first()
    if (!gameVersion) return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('update', gameVersion)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updateGameVersionValidator(gameVersion.id))
    await GameVersion.updateOrCreate({ id: gameVersion.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      GameVersion.query().where('id', params.id),
      appMeta?.transformer
    )
    const gameVersion = await pipeline.query().first()
    if (!gameVersion) return response.notFound()

    if (await bouncer.with(GameVersionPolicy).denies('destroy', gameVersion)) {
      return response.forbidden('Insufficient permissions')
    }

    return gameVersion.delete()
  }
}
