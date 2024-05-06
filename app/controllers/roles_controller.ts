import type { HttpContext } from '@adonisjs/core/http'
import RolePolicy from '#policies/role_policy'
import { requestParamsCuidValidator } from '#validators/request'
import Role from '#models/role'
import { storeRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(RolePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await Role.all()
  }

  async show({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedRole = await Role.findBy({ id: params.id })
    if (requestedRole === null || requestedRole === undefined) return response.notFound()

    if (await bouncer.with(RolePolicy).denies('show', requestedRole))
      return response.forbidden('Insufficient permissions')
    return await Role.findBy({ id: params.id })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(RolePolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(storeRoleValidator)
    await Role.create(payload)
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedRole = await Role.findBy({ id: params.id })
    if (requestedRole === null || requestedRole === undefined) return response.notFound()

    if (await bouncer.with(RolePolicy).denies('update', requestedRole))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateRoleValidator(requestedRole.id))
    await Role.updateOrCreate({ id: requestedRole.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedRole = await Role.findBy({ id: params.id })
    if (requestedRole === null || requestedRole === undefined) return response.notFound()

    if (await bouncer.with(RolePolicy).denies('destroy', requestedRole))
      return response.forbidden('Insufficient permissions')
    return await requestedRole.delete()
  }
}
