import type { HttpContext } from '@adonisjs/core/http'

import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import User from '#models/user'
import Pack from '#models/pack'
import ControllerService from '#services/controller_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
} from '#validators/request'
import {
  indexByPackPackReleaseValidator,
  preCheckPackReleasePackIdValidator,
  storePackReleaseIdeValidator,
  updatePackReleaseIdValidator,
} from '#validators/pack_release'

export default class PackReleasesController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackReleasePolicy).denies('index'))
      return ControllerService.includeRelations(
        this.packReleaseIndexWithoutHiddenPacksQuery,
        request.input('includes')
      ).paginate(request.input('page'), request.input('limit'))
    return await ControllerService.includeRelations(
      PackRelease.query(),
      request.input('includes')
    ).paginate(request.input('page'), request.input('limit'))
  }

  async indexByPack({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByPackPackReleaseValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))

    const pack = await Pack.findBy({ id: params.packId })
    const userId = auth.user && auth.user.id !== undefined ? auth.user.id : null
    const packUserId = pack && pack.userId !== undefined ? pack.userId : null

    if (userId === packUserId)
      return await ControllerService.includeRelations(
        PackRelease.query().where('packId', params.packId),
        request.input('includes')
      )

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackReleasePolicy).denies('index'))
      return await ControllerService.includeRelations(
        this.packReleaseIndexWithoutHiddenPacksQuery,
        request.input('includes')
      ).andWhere('packId', params.packId)

    return await ControllerService.includeRelations(
      PackRelease.query().where('packId', params.packId),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackReleasePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(storePackReleaseIdeValidator(request.body().packId))
    await PackRelease.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackRelease = await PackRelease.findBy({ id: params.id })
    if (requestedPackRelease === null || requestedPackRelease === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackReleasePolicy).denies('show', requestedPackRelease))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackRelease.query().where('id', params.id),
      request.input('includes')
    )
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackRelease = await PackRelease.findBy({ id: params.id })
    if (requestedPackRelease === null || requestedPackRelease === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
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

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
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
