import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ControllerService from '#services/controller_service'
import { updateUserValidator } from '#validators/user'
import {
  requestPageValidator,
  requestParamsCuidValidator,
  requestSearchValidator,
} from '#validators/request'

export default class UsersController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestSearchValidator)

    if (await bouncer.with(UserPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    if (!request.input('search'))
      return await User.query().paginate(request.input('page'), request.input('limit'))
    return await User.query()
      .andWhereILike('name', `%${request.input('search')}%`)
      .orWhereILike('publicName', `%${request.input('search')}%`)
      .orWhereILike('id', request.input('search'))
      .orWhereILike('publicId', request.input('search'))
      .paginate(request.input('page'), request.input('limit'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('show', requestedUser))
      return response.forbidden('Insufficient permissions')
    return await User.findBy({ id: params.id })
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('update', requestedUser))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateUserValidator(requestedUser.id))
    await User.updateOrCreate({ id: requestedUser.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('destroy', requestedUser))
      return response.forbidden('Insufficient permissions')
    return await requestedUser.delete()
  }
}
