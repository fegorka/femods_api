import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import ControllerService from '#services/controller_service'
import { requestParamsCuidValidator } from '#validators/request'
import { BasePolicy } from '@adonisjs/bouncer'

type AnyPolicyShow = new (...args: any[]) => BasePolicy & { show: (...args: any[]) => any }

export default class NestedResourceMiddleware {
  async handle<Parent extends typeof BaseModel>(
    ctx: HttpContext,
    next: NextFn,
    options: {
      parent: Parent
      policy: AnyPolicyShow
      relation: string
    }
  ) {
    const { auth, request, bouncer, params, response } = ctx

    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestParamsCuidValidator)

    const parent = await options.parent.find(params.id)
    if (!parent) return response.notFound()

    if (await bouncer.with(options.policy).denies('show', parent)) {
      console.log(options.policy)
      return response.forbidden('Insufficient permissions')
    }

    ctx.appMeta ||= {}
    ctx.appMeta.transformer = {
      ...(ctx.appMeta.transformer ?? {}),
      nestedResource: {
        parent: parent,
        parentId: params.id,
        parentRelation: options.relation,
        parentPrimaryKey: options.parent.primaryKey,
      },
    }

    return next()
  }
}