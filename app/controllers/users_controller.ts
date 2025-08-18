import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'

import { updateUserValidator } from '#validators/user'
import {
  requestPageValidator,
  requestParamsCuidValidator,
  requestSearchValidator,
  requestIncludeValidator,
  requestSortValidator,
} from '#validators/request'

export default class UsersController {
  async index({ bouncer, response, request, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestSearchValidator)
    await request.validateUsing(requestIncludeValidator(User))
    await request.validateUsing(requestSortValidator(User))

    if (await bouncer.with(UserPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')

    const search = request.input('search', []) as string | string[] | [] // by validators

    const pipeline = new TransformerService(User.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))
      .transform((q) =>
        search
          ? ControllerService.applySearchTokens(q, search, (subQ, token) =>
              subQ.whereILike('publicName', `%${token}%`).orWhereILike('publicId', search)
            )
          : q
      )

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'users',
        tags: ['user:index'],
        ttl: '2m',
        grace: '4m',
      }
    )
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(User))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const user = await User.findBy({ id: params.id })
    if (!user) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('show', user))
      return response.forbidden('Insufficient permissions')

    const pipeline = new TransformerService(
      User.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'users',
      tags: [`user:${params.id}`],
      ttl: '12h',
      grace: '24h',
    })
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      User.query().where('id', params.id),
      appMeta?.transformer
    )
    const user = await pipeline.query().first()
    if (!user) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('update', user))
      return response.forbidden('Insufficient permissions')

    const payload = await request.validateUsing(updateUserValidator(user.id))
    await TransformerService.invalidateCache({ tags: [`user:${params.id}`] })
    await User.updateOrCreate({ id: user.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      User.query().where('id', params.id),
      appMeta?.transformer
    )
    const user = await pipeline.query().first()
    if (!user) return response.notFound()

    if (await bouncer.with(UserPolicy).denies('destroy', user))
      return response.forbidden('Insufficient permissions')

    await TransformerService.invalidateCache({ tags: [`user:${params.id}`] })
    return user.delete()
  }
}
