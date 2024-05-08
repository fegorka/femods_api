import type { HttpContext } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'
import Pack from '#models/pack'
import PackPolicy from '#policies/pack_policy'
import {
  requestPageValidator,
  requestParamsCuidValidator,
  requestSearchValidator,
} from '#validators/request'
import {
  indexByTagPackValidator,
  indexByUserPackValidator,
  storePackValidator,
  updatePackValidator,
} from '#validators/pack'
import User from '#models/user'

export default class PacksController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestSearchValidator)

    if (request.input('search')) {
      if (await bouncer.with(PackPolicy).denies('index'))
        return this.packIndexWithoutHiddenPacksQuery
          .andWhereILike('name', `%${request.input('search')}%`)
          .orWhereILike('publicName', `%${request.input('search')}%`)
          .orWhereHas('user', (userQuery) => {
            userQuery.whereILike('name', `%${request.input('search')}%`)
          })
          .paginate(request.input('page'), request.input('limit'))
      return await Pack.query()
        .andWhereILike('name', `%${request.input('search')}%`)
        .orWhereILike('publicName', `%${request.input('search')}%`)
        .orWhereHas('user', (userQuery) => {
          userQuery.whereILike('name', `%${request.input('search')}%`)
        })
        .paginate(request.input('page'), request.input('limit'))
    }

    if (await bouncer.with(PackPolicy).denies('index'))
      return this.packIndexWithoutHiddenPacksQuery.paginate(
        request.input('page'),
        request.input('limit')
      )
    return await Pack.query().paginate(request.input('page'), request.input('limit'))
  }

  async indexByTag({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByTagPackValidator)
    await request.validateUsing(requestPageValidator)

    if (await bouncer.with(PackPolicy).denies('index'))
      return this.packIndexWithoutHiddenPacksQuery.andWhereHas('tags', (tagsQuery) => {
        tagsQuery.where('tag_id', params.tagId).paginate(request.body().page, 30)
      })
    return Pack.query().whereHas('tags', (tagsQuery) => {
      tagsQuery.where('tag_id', params.tagId).paginate(request.body().page, 30)
    })
  }

  async indexByUser({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByUserPackValidator)
    await request.validateUsing(requestPageValidator)

    const userId = auth.user && auth.user.id !== undefined ? auth.user.id : null
    if (userId === params.userId) return Pack.findManyBy({ userId: params.userId })

    if (await bouncer.with(PackPolicy).denies('index'))
      return this.packIndexWithoutHiddenPacksQuery
        .andWhere('userId', params.userId)
        .paginate(request.body().page, 30)
    return await Pack.query().where('userId', params.userId).paginate(request.body().page, 30)
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

  private packIndexWithoutHiddenPacksQuery = Pack.query()
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
