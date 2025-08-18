import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import RolePolicy from '#policies/role_policy'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'
import {
  requestIncludeValidator,
  requestParamsCuidValidator,
  requestPageValidator,
  requestSortValidator,
} from '#validators/request'
import { storeRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {
  async index({ bouncer, response, request, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(Role))
    await request.validateUsing(requestSortValidator(Role))

    console.log(await bouncer.with(RolePolicy).allows('index'))

    if (await bouncer.with(RolePolicy).denies('index')) {
      return response.forbidden('Insufficient permissions')
    }

    const includes = request.input('includes')
    const sort = request.input('sort')

    const pipeline = new QueryPipelineService(Role.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, includes))
      .transform((q) => ControllerService.applySorting(q, sort))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async show({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(Role))

    const role = await Role.findBy({ id: params.id })
    if (!role) return response.notFound()
    if (await bouncer.with(RolePolicy).denies('show', role)) {
      return response.forbidden('Insufficient permissions')
    }

    const includes = request.input('includes')
    const pipeline = new QueryPipelineService(
      Role.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, includes))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(RolePolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }
    const payload = await request.validateUsing(storeRoleValidator)
    await Role.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new QueryPipelineService(
      Role.query().where('id', params.id),
      appMeta?.transformer
    )
    const role = await pipeline.query().first()
    if (!role) return response.notFound()
    if (await bouncer.with(RolePolicy).denies('update', role)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updateRoleValidator(role.id))
    await Role.updateOrCreate({ id: role.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new QueryPipelineService(
      Role.query().where('id', params.id),
      appMeta?.transformer
    )
    const role = await pipeline.query().first()
    if (!role) return response.notFound()
    if (await bouncer.with(RolePolicy).denies('destroy', role)) {
      return response.forbidden('Insufficient permissions')
    }

    return role.delete()
  }
}
