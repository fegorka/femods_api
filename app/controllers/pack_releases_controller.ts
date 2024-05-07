import type { HttpContext } from '@adonisjs/core/http'
import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import { requestParamsCuidValidator } from '#validators/request'
import {
  indexByPackPackReleaseValidator,
  preCheckPackReleasePackIdValidator,
  storePackReleaseIdeValidator,
  updatePackReleaseIdValidator,
} from '#validators/pack_release'
import ControllerService from '#services/controller_service'
import User from '#models/user'
import Pack from '#models/pack'

export default class PackReleasesController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    if (await bouncer.with(PackReleasePolicy).denies('index'))
      return this.packReleaseIndexWithoutHiddenPacksQuery
    return await PackRelease.all()
  }

  async indexByPack({ auth, bouncer, response, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByPackPackReleaseValidator)

    const pack = await Pack.findBy({ id: params.packId })
    const userId = auth.user && auth.user.id !== undefined ? auth.user.id : null
    const packUserId = pack && pack.userId !== undefined ? pack.userId : null
    if (userId === packUserId) return PackRelease.findManyBy({ packId: params.packId })

    if (await bouncer.with(PackReleasePolicy).denies('index'))
      return this.packReleaseIndexWithoutHiddenPacksQuery.andWhere('packId', params.packId)
    return await PackRelease.findManyBy({ packId: params.packId })
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

  private packReleaseIndexWithoutHiddenPacksQuery = PackRelease.query().whereHas(
    'pack',
    (packQuery) => {
      packQuery
        .whereHas('packStatus', (packStatusQuery) => {
          packStatusQuery.whereIn('name', Pack.allowedPackStatusToIndex)
        })
        .andWhereHas('packVisibleLevel', (packVisibleLevelQuery) => {
          packVisibleLevelQuery.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
        })
        .andWhereHas('user', (userQuery) => {
          userQuery.whereHas('userStatus', (userStatusQuery) => {
            userStatusQuery.whereIn('name', User.allowedUserStatusToIndex)
          })
        })
    }
  )
}
