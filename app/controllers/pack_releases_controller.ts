import type { HttpContext } from '@adonisjs/core/http'
import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import { requestParamsCuidValidator } from '#validators/request'
import {
  preCheckPackReleasePackIdValidator,
  storePackReleaseIdeValidator,
  updatePackReleaseIdValidator,
} from '#validators/pack_release'
import ControllerService from '#services/controller_service'

export default class PackReleasesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackReleasePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackRelease.all()
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackReleasePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(storePackReleaseIdeValidator(request.body().packId))
    await PackRelease.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackRelease = await PackRelease.findBy({ id: params.id })
    if (requestedPackRelease === null || requestedPackRelease === undefined)
      return response.notFound()

    if (await bouncer.with(PackReleasePolicy).denies('show', requestedPackRelease))
      return response.forbidden('Insufficient permissions')
    return await PackRelease.findBy({ id: params.id })
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackRelease = await PackRelease.findBy({ id: params.id })
    if (requestedPackRelease === null || requestedPackRelease === undefined)
      return response.notFound()

    if (await bouncer.with(PackReleasePolicy).denies('update', requestedPackRelease))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(
      updatePackReleaseIdValidator(request.body().packId, requestedPackRelease.id)
    )
    await PackRelease.updateOrCreate({ id: requestedPackRelease.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackRelease = await PackRelease.findBy({ id: params.id })
    if (requestedPackRelease === null || requestedPackRelease === undefined)
      return response.notFound()

    if (await bouncer.with(PackReleasePolicy).denies('destroy', requestedPackRelease))
      return response.forbidden('Insufficient permissions')
    return await requestedPackRelease.delete()
  }
}
