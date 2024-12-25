import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ControllerService from '#services/controller_service'

import { updateUserValidator } from '#validators/user'
import {
  requestPageValidator,
  requestParamsCuidValidator,
  requestSearchValidator,
  requestIncludeValidator,
} from '#validators/request'

export default class UsersController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestSearchValidator)
    await request.validateUsing(requestIncludeValidator(User))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    if (!request.input('search')) {
      return await ControllerService.includeRelations(
        User.query(),
        request.input('includes')
      ).paginate(request.input('page'), request.input('limit'))
    }
    return await ControllerService.includeRelations(User.query(), request.input('includes'))
      .andWhereILike('name', `%${request.input('search')}%`)
      .orWhereILike('publicName', `%${request.input('search')}%`)
      .orWhereILike('id', request.input('search'))
      .orWhereILike('publicId', request.input('search'))
      .paginate(request.input('page'), request.input('limit'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(User))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserPolicy).denies('show', requestedUser))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      User.query().where('id', params.id),
      request.input('includes')
    )
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserPolicy).denies('update', requestedUser))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateUserValidator(requestedUser.id))
    await User.updateOrCreate({ id: requestedUser.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUser = await User.findBy({ id: params.id })
    if (requestedUser === null || requestedUser === undefined) return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserPolicy).denies('destroy', requestedUser))
      return response.forbidden('Insufficient permissions')
    return await requestedUser.delete()
  }
}
