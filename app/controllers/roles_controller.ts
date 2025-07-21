import type { HttpContext } from '@adonisjs/core/http'

import Role from '#models/role'
import RolePolicy from '#policies/role_policy'
import ControllerService from '#services/controller_service'
import { requestIncludeValidator, requestParamsCuidValidator } from '#validators/request'

import { storeRoleValidator, updateRoleValidator } from '#validators/role'
import { ResponseCacheService } from '#services/response_cache_service'

export default class RolesController {
  async index({ bouncer, response, request }: HttpContext) {
    await request.validateUsing(requestIncludeValidator(Role))

    if (await bouncer.with(RolePolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await ResponseCacheService.getOrSet(
      request,
      120,
      async () => await ControllerService.includeRelations(Role.query(), request.input('includes'))
    )
  }

  async show({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(Role))

    const requestedRole = await Role.findBy({ id: params.id })
    if (requestedRole === null || requestedRole === undefined) return response.notFound()

    if (await bouncer.with(RolePolicy).denies('show', requestedRole))
      return response.forbidden('Insufficient permissions')
    return await ResponseCacheService.getOrSet(
      request,
      120,
      async () =>
        await ControllerService.includeRelations(
          Role.query().where('id', params.id),
          request.input('includes')
        )
    )
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
