import type { HttpContext } from '@adonisjs/core/http'
import { requestParamsCuidValidator } from '#validators/request'
import UserStatus from '#models/user_status'
import UserStatusPolicy from '#policies/user_status_policy'
import { storeUserStatusValidator, updateUserStatusValidator } from '#validators/user_status'
import ControllerService from '#services/controller_service'

export default class UserStatusesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(UserStatusPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await UserStatus.all()
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedUserStatus = await UserStatus.findBy({ id: params.id })
    if (requestedUserStatus === null || requestedUserStatus === undefined)
      return response.notFound()

    if (await bouncer.with(UserStatusPolicy).denies('show', requestedUserStatus))
      return response.forbidden('Insufficient permissions')
    return await UserStatus.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
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

    if (await bouncer.with(UserStatusPolicy).denies('destroy', requestedUserStatus))
      return response.forbidden('Insufficient permissions')
    return await requestedUserStatus.delete()
  }
}
