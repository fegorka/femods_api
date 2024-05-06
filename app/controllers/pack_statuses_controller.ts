import type { HttpContext } from '@adonisjs/core/http'
import PackStatus from '#models/pack_status'
import ControllerService from '#services/controller_service'
import { requestParamsCuidValidator } from '#validators/request'
import PackStatusPolicy from '#policies/pack_status_policy'
import { storePackStatusValidator, updatePackStatusValidator } from '#validators/pack_status'

export default class PackStatusesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackStatus.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('show', requestedPackStatus))
      return response.forbidden('Insufficient permissions')
    return await PackStatus.findBy({ id: params.id })
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
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('update', requestedPackStatus))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updatePackStatusValidator(requestedPackStatus.id))
    await PackStatus.updateOrCreate({ id: requestedPackStatus.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackStatus = await PackStatus.findBy({ id: params.id })
    if (requestedPackStatus === null || requestedPackStatus === undefined)
      return response.notFound()

    if (await bouncer.with(PackStatusPolicy).denies('destroy', requestedPackStatus))
      return response.forbidden('Insufficient permissions')
    return await requestedPackStatus.delete()
  }
}
