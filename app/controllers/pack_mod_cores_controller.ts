import type { HttpContext } from '@adonisjs/core/http'
import PackModCore from '#models/pack_mod_core'
import PackModCorePolicy from '#policies/pack_mod_core_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'
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

    const pipeline = new TransformerService(PackModCore.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'packModCores',
        tags: ['packModCore:index'],
        ttl: '12h',
        grace: '24h',
      }
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(PackModCore))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackModCore = await PackModCore.findBy({ id: params.id })
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('show', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(
      PackModCore.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'packModCores',
      tags: [`packModCore:${params.id}`],
      ttl: '12h',
      grace: '24h',
    })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackModCorePolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(storePackModCoreValidator)

    await TransformerService.invalidateCache({ namespace: 'packModCores' })
    await PackModCore.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackModCore.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedPackModCore = await pipeline.query().first()
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('update', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updatepackModCoreValidator(requestedPackModCore.id))

    await TransformerService.invalidateCache({ namespace: 'packModCores' })
    await PackModCore.updateOrCreate({ id: requestedPackModCore.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackModCore.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedPackModCore = await pipeline.query().first()
    if (!requestedPackModCore) return response.notFound()

    if (await bouncer.with(PackModCorePolicy).denies('destroy', requestedPackModCore)) {
      return response.forbidden('Insufficient permissions')
    }

    await TransformerService.invalidateCache({ namespace: 'packModCores' })
    return requestedPackModCore.delete()
  }
}
