import type { HttpContext } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'
import Pack from '#models/pack'
import PackPolicy from '#policies/pack_policy'
import { requestParamsCuidValidator } from '#validators/request'
import { storePackValidator, updatePackValidator } from '#validators/pack'

export default class PacksController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const allowedStatuses: string[] = ['default']
    const allowedVisibleLevels: string[] = ['default']

    if (await bouncer.with(PackPolicy).denies('index'))
      return Pack.query()
        .whereHas('packStatus', (query) => {
          query.whereIn('name', allowedStatuses)
        })
        .andWhereHas('packVisibleLevel', (query) => {
          query.whereIn('name', allowedVisibleLevels)
        })
    return await Pack.all()
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storePackValidator)
    await Pack.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPack = await Pack.findBy({ id: params.id })
    if (requestedPack === null || requestedPack === undefined) return response.notFound()

    if (await bouncer.with(PackPolicy).denies('show', requestedPack))
      return response.forbidden('Insufficient permissions')
    return await Pack.findBy({ id: params.id })
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPack = await Pack.findBy({ id: params.id })
    if (requestedPack === null || requestedPack === undefined) return response.notFound()

    if (await bouncer.with(PackPolicy).denies('update', requestedPack))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updatePackValidator(requestedPack.id))
    await Pack.updateOrCreate({ id: requestedPack.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPack = await Pack.findBy({ id: params.id })
    if (requestedPack === null || requestedPack === undefined) return response.notFound()

    if (await bouncer.with(PackPolicy).denies('destroy', requestedPack))
      return response.forbidden('Insufficient permissions')
    return await requestedPack.delete()
  }
}
