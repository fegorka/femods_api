import type { HttpContext } from '@adonisjs/core/http'

import PackStatus from '#models/pack_status'
import PackStatusPolicy from '#policies/pack_status_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import { storePackStatusValidator, updatePackStatusValidator } from '#validators/pack_status'

export default class PackStatusesController {
  async index({ bouncer, request, response, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackStatus))
    await request.validateUsing(requestSortValidator(PackStatus))

    if (await bouncer.with(PackStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')

    const pipeline = new QueryPipelineService(PackStatus.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackStatus))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (!requestedPackStatus) return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('show', requestedPackStatus))
      return response.forbidden('Insufficient permissions')

    const pipeline = new QueryPipelineService(
      PackStatus.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackStatusPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackStatusValidator)
    await PackStatus.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (!requestedPackStatus) return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('update', requestedPackStatus))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updatePackStatusValidator(requestedPackStatus.id))
    await PackStatus.updateOrCreate({ id: requestedPackStatus.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (!requestedPackStatus) return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('destroy', requestedPackStatus))
      return response.forbidden('Insufficient permissions')

    return requestedPackStatus.delete()
  }
}
