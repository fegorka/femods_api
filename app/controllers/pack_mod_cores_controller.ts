import type { HttpContext } from '@adonisjs/core/http'
import PackModCore from '#models/pack_mod_core'
import PackModCorePolicy from '#policies/pack_mod_core_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'
import { storePackModCoreValidator, updatepackModCoreValidator } from '#validators/pack_mod_core'
import {
  requestIncludeValidator,
  requestParamsCuidValidator,
  requestPageValidator,
  requestSortValidator,
} from '#validators/request'

export default class PackModCoresController {
  async index({ bouncer, request, response, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackModCore))
    await request.validateUsing(requestSortValidator(PackModCore))

    if (await bouncer.with(PackModCorePolicy).denies('index')) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(PackModCore.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackModCore))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('show', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(
      PackModCore.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackModCorePolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(storePackModCoreValidator)
    await PackModCore.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('update', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updatepackModCoreValidator(requestedPackModCore.id))

    await PackModCore.updateOrCreate({ id: requestedPackModCore.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('destroy', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    return requestedPackModCore.delete()
  }
}
