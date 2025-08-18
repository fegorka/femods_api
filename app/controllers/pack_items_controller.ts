import type { HttpContext } from '@adonisjs/core/http'

import PackItem from '#models/pack_item'
import Pack from '#models/pack'
import User from '#models/user'
import PackItemPolicy from '#policies/pack_item_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import {
  preCheckPackItemReleaseIdValidator,
  storePackItemValidator,
  updatePackItemValidator,
} from '#validators/pack_item'

export default class PackItemsController {
  async index({ auth, bouncer, request, appMeta }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))
    await request.validateUsing(requestSortValidator(PackItem))

    const initial = (await bouncer.with(PackItemPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackItem.query()

    const pipeline = new TransformerService(initial, appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'packItems',
        tags: ['packItem:index'],
        ttl: '2m',
        grace: '4m',
      }
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackItemPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackItemValidator(request.body().packReleaseId)
    )
    await PackItem.create(payload)
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(PackItem))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const item = await PackItem.findBy({ id: params.id })
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('show', item)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(
      PackItem.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'packItems',
      tags: [`packItem:${params.id}`],
      ttl: '2m',
      grace: '4m',
    })
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItem.query().where('id', params.id),
      appMeta?.transformer
    )
    const item = await pipeline.query().first()
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('update', item)) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackItemValidator(request.body().packReleaseId, item.id)
    )

    await TransformerService.invalidateCache({ tags: [`packItem:${params.id}`] })
    await PackItem.updateOrCreate({ id: item.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      PackItem.query().where('id', params.id),
      appMeta?.transformer
    )
    const item = await pipeline.query().first()
    if (!item) return response.notFound()
    if (await bouncer.with(PackItemPolicy).denies('destroy', item)) {
      return response.forbidden('Insufficient permissions')
    }

    await TransformerService.invalidateCache({ tags: [`packItem:${params.id}`] })
    return item.delete()
  }

  private baseVisibilityQuery = () =>
    PackItem.query().whereHas('packRelease', (packReleaseQuery) => {
      packReleaseQuery.whereHas('pack', (packQuery) => {
        packQuery
          .whereHas('packStatus', (q) => q.whereIn('name', Pack.allowedPackStatusToIndex))
          .andWhereHas('packVisibleLevel', (q) =>
            q.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
          )
          .andWhereHas('user', (q) =>
            q.whereHas('userStatus', (q2) => q2.whereIn('name', User.allowedUserStatusToIndex))
          )
      })
    })
}
