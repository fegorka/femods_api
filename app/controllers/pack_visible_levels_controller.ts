import type { HttpContext } from '@adonisjs/core/http'

import PackVisibleLevel from '#models/pack_visible_level'
import PackVisibleLevelPolicy from '#policies/pack_visible_level_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'

import {
  storePackVisibleLevelValidator,
  updatePackVisibleLevelValidator,
} from '#validators/pack_visible_level'
import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'

export default class PackVisibleLevelsController {
  async index({ bouncer, request, response }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackVisibleLevel))
    await request.validateUsing(requestSortValidator(PackVisibleLevel))

    if (await bouncer.with(PackVisibleLevelPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')

    const pipeline = new QueryPipelineService(PackVisibleLevel.query())
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, request, response, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackVisibleLevel))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const packVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (!packVisibleLevel) return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('show', packVisibleLevel))
      return response.forbidden('Insufficient permissions')

    const pipeline = new QueryPipelineService(
      PackVisibleLevel.query().where('id', params.id)
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackVisibleLevelPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackVisibleLevelValidator)
    await PackVisibleLevel.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const packVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (!packVisibleLevel) return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('update', packVisibleLevel))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(
      updatePackVisibleLevelValidator(packVisibleLevel.id)
    )
    await PackVisibleLevel.updateOrCreate({ id: packVisibleLevel.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const packVisibleLevel = await PackVisibleLevel.findBy({ id: params.id })
    if (!packVisibleLevel) return response.notFound()

    if (await bouncer.with(PackVisibleLevelPolicy).denies('destroy', packVisibleLevel))
      return response.forbidden('Insufficient permissions')

    return packVisibleLevel.delete()
  }
}
