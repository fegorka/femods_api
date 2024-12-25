import type { HttpContext } from '@adonisjs/core/http'

import PackItem from '#models/pack_item'
import PackItemPolicy from '#policies/pack_item_policy'
import Pack from '#models/pack'
import PackRelease from '#models/pack_release'
import User from '#models/user'
import ControllerService from '#services/controller_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
} from '#validators/request'
import {
  preCheckPackItemReleaseIdValidator,
  storePackItemValidator,
  updatePackItemValidator,
} from '#validators/pack_item'
import { indexByPackReleasePackItemValidator } from '#validators/pack_item'

export default class PackItemsController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('index'))
      return await ControllerService.includeRelations(
        this.packItemIndexWithoutHiddenPacksQuery,
        request.input('includes')
      ).paginate(request.input('page'), request.input('limit'))
    return await ControllerService.includeRelations(
      PackItem.query(),
      request.input('includes')
    ).paginate(request.input('page'), request.input('limit'))
  }

  async indexByPackRelease({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByPackReleasePackItemValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))

    const packRelease = await PackRelease.findBy({ id: params.packReleaseId })
    const packReleasePackId =
      packRelease && packRelease.packId !== undefined ? packRelease.packId : null
    const pack = await Pack.findBy({ id: packReleasePackId })
    const userId = auth.user && auth.user.id !== undefined ? auth.user.id : null
    const packUserId = pack && pack.userId !== undefined ? pack.userId : null

    if (userId === packUserId) return PackRelease.findManyBy({ packId: params.packReleaseId })

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('index'))
      return ControllerService.includeRelations(
        this.packItemIndexWithoutHiddenPacksQuery,
        request.input('includes')
      ).andWhere('packReleaseId', params.packReleaseId)
    return await ControllerService.includeRelations(
      PackItem.query().where('packReleaseId', params.packReleaseId),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackItemValidator(request.body().packReleaseId)
    )
    await PackItem.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackItem))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('show', requestedPackItem))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      PackItem.query().where('id', params.id),
      request.input('includes')
    )
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('update', requestedPackItem))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackItemReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackItemValidator(request.body().packReleaseId, requestedPackItem.id)
    )
    await PackItem.updateOrCreate({ id: requestedPackItem.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackItem = await PackItem.findBy({ id: params.id })
    if (requestedPackItem === null || requestedPackItem === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(PackItemPolicy).denies('destroy', requestedPackItem))
      return response.forbidden('Insufficient permissions')
    return await requestedPackItem.delete()
  }

  private packItemIndexWithoutHiddenPacksQuery = PackItem.query().whereHas(
    'packRelease',
    (packReleaseQuery) => {
      packReleaseQuery.whereHas('pack', (packQuery) => {
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
      })
    }
  )
}
