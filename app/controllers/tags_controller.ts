import type { HttpContext } from '@adonisjs/core/http'

import Tag from '#models/tag'
import TagPolicy from '#policies/tag_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'

import { storeTagValidator, updateTagValidator } from '#validators/tag'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'

export default class TagsController {
  async index({ auth, bouncer, request, response, appMeta }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(Tag))
    await request.validateUsing(requestSortValidator(Tag))

    if (await bouncer.with(TagPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')

    const pipeline = new TransformerService(Tag.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(Tag))

    const requestedTag = await Tag.findBy({ id: params.id })
    if (!requestedTag) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('show', requestedTag))
      return response.forbidden('Insufficient permissions')

    const pipeline = new TransformerService(
      Tag.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(TagPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeTagValidator)
    await Tag.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      Tag.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedTag = await pipeline.query().first()
    if (!requestedTag) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('update', requestedTag))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateTagValidator(requestedTag.id))
    await Tag.updateOrCreate({ id: requestedTag.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      Tag.query().where('id', params.id),
      appMeta?.transformer
    )
    const requestedTag = await pipeline.query().first()
    if (!requestedTag) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('destroy', requestedTag))
      return response.forbidden('Insufficient permissions')

    return requestedTag.delete()
  }
}
