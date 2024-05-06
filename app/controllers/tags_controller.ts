import type { HttpContext } from '@adonisjs/core/http'
import { requestParamsCuidValidator } from '#validators/request'
import TagPolicy from '#policies/tag_policy'
import Tag from '#models/tag'
import { storeTagValidator, updateTagValidator } from '#validators/tag'
import ControllerService from '#services/controller_service'

export default class TagsController {
  async index({ auth, bouncer, response, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    if (await bouncer.with(TagPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await Tag.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('show', requestedTag))
      return response.forbidden('Insufficient permissions')
    return await Tag.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(TagPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeTagValidator)
    await Tag.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('update', requestedTag))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateTagValidator(requestedTag.id))
    await Tag.updateOrCreate({ id: requestedTag.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedTag = await Tag.findBy({ id: params.id })
    if (requestedTag === null || requestedTag === undefined) return response.notFound()

    if (await bouncer.with(TagPolicy).denies('destroy', requestedTag))
      return response.forbidden('Insufficient permissions')
    return await requestedTag.delete()
  }
}
