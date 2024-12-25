import type { HttpContext } from '@adonisjs/core/http'

import Tag from '#models/tag'
import TagPolicy from '#policies/tag_policy'
import ControllerService from '#services/controller_service'

import { storeTagValidator, updateTagValidator } from '#validators/tag'
import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'

export default class TagsController {
  async index({ auth, bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(Tag))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(TagPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(Tag.query(), request.input('includes'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(Tag))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(TagPolicy).denies('show', requestedTag))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      Tag.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(TagPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeTagValidator)
    await Tag.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(TagPolicy).denies('update', requestedTag))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateTagValidator(requestedTag.id))
    await Tag.updateOrCreate({ id: requestedTag.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(TagPolicy).denies('destroy', requestedTag))
      return response.forbidden('Insufficient permissions')
    return await requestedTag.delete()
  }
}
