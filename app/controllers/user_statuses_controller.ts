import type { HttpContext } from '@adonisjs/core/http'

import UserStatus from '#models/user_status'
import UserStatusPolicy from '#policies/user_status_policy'
import ControllerService from '#services/controller_service'

import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'
import { storeUserStatusValidator, updateUserStatusValidator } from '#validators/user_status'

export default class UserStatusesController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(UserStatus))

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(UserStatus.query(), request.input('includes'))
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(UserStatus))

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedUserStatus = await UserStatus.findBy({ id: params.id })
    if (requestedUserStatus === null || requestedUserStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserStatusPolicy).denies('show', requestedUserStatus))
      return response.forbidden('Insufficient permissions')
    return await ControllerService.includeRelations(
      UserStatus.query().where('id', params.id),
      request.input('includes')
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserStatusPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeUserStatusValidator)
    await UserStatus.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUserStatus = await UserStatus.findBy({ id: params.id })
    if (requestedUserStatus === null || requestedUserStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserStatusPolicy).denies('update', requestedUserStatus))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateUserStatusValidator(requestedUserStatus.id))
    await UserStatus.updateOrCreate({ id: requestedUserStatus.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedUserStatus = await UserStatus.findBy({ id: params.id })
    if (requestedUserStatus === null || requestedUserStatus === undefined)
      return response.notFound()

    // unfair warning, adonis resolves ts-ignore here
    // @ts-ignore: Argument of type 'string' is not assignable to parameter of type 'never'
    if (await bouncer.with(UserStatusPolicy).denies('destroy', requestedUserStatus))
      return response.forbidden('Insufficient permissions')
    return await requestedUserStatus.delete()
  }
}
