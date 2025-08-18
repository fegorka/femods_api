import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import ControllerService from '#services/controller_service'
import { requestParamsCuidValidator } from '#validators/request'
import { BasePolicy } from '@adonisjs/bouncer'

type AnyPolicy = new (...args: any[]) => BasePolicy & {
  index: (...args: any[]) => any,
  show: (...args: any[]) => any,
  store: (...args: any[]) => any,
  update: (...args: any[]) => any,
  destroy: (...args: any[]) => any,
}

type NestedResourceOption = {
  parent: typeof BaseModel
  policy: AnyPolicy
  relation: string
  policyMethod?: 'index' | 'show' | 'store' | 'update' | 'destroy'
  paramKey?: string
}

export default class NestedResourceMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: NestedResourceOption | NestedResourceOption[]
  ) {
    const { auth, request, bouncer, params, response } = ctx
    const resources = Array.isArray(options) ? options : [options]
    const nestedResources = []

    for (const resource of resources) {
      const paramKey = resource.paramKey || 'id'
      const parentId = params[paramKey]

      await ControllerService.authenticateOrSkipForGuest(auth, request)
      await request.validateUsing(requestParamsCuidValidator(paramKey))

      const parent = await resource.parent.find(parentId)
      if (!parent) return response.notFound()

      if (await bouncer.with(resource.policy).denies((resource.policyMethod || 'index'), parent)) {
        return response.forbidden('Insufficient permissions')
      }

      nestedResources.push({
        parent,
        parentId,
        parentRelation: resource.relation,
        parentPrimaryKey: resource.parent.primaryKey,
      })
    }

    ctx.appMeta ||= {}
    ctx.appMeta.transformer = {
      ...(ctx.appMeta.transformer ?? {}),
      nestedResources,
    }

    return next()
  }
}
