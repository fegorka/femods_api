import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ControllerService from '#services/controller_service'
import { updateUserValidator } from '#validators/user'
import { requestParamsCuidValidator } from '#validators/request'

export default class UsersController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(UserPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await User.all()
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
