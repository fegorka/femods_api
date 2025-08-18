import type { HttpContext } from '@adonisjs/core/http'
import UserStatus from '#models/user_status'
import UserStatusPolicy from '#policies/user_status_policy'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'
import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import { storeUserStatusValidator, updateUserStatusValidator } from '#validators/user_status'

export default class UserStatusesController {
  async index({ bouncer, request, response, appMeta }: HttpContext) {
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(UserStatus))
    await request.validateUsing(requestSortValidator(UserStatus))

    if (await bouncer.with(UserStatusPolicy).denies('index')) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(UserStatus.query(), appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'userStatuses',
        tags: ['userStatus:index'],
        ttl: '12h',
        grace: '24h',
      }
    )
  }

  async show({ auth, bouncer, request, response, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(UserStatus))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const status = await UserStatus.findBy({ id: params.id })
    if (!status) {
      return response.notFound()
    }
    if (await bouncer.with(UserStatusPolicy).denies('show', status)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(
      UserStatus.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'userStatuses',
      tags: [`userStatus:${params.id}`],
      ttl: '12h',
      grace: '24h',
    })
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(UserStatusPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }
    const payload = await request.validateUsing(storeUserStatusValidator)

    await TransformerService.invalidateCache({ namespace: 'userStatuses' })
    await UserStatus.create(payload)
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      UserStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const status = await pipeline.query().first()
    if (!status) return response.notFound()
    if (await bouncer.with(UserStatusPolicy).denies('update', status)) {
      return response.forbidden('Insufficient permissions')
    }

    const payload = await request.validateUsing(updateUserStatusValidator(status.id))
    await TransformerService.invalidateCache({ namespace: 'userStatuses' })
    await UserStatus.updateOrCreate({ id: status.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    const pipeline = new TransformerService(
      UserStatus.query().where('id', params.id),
      appMeta?.transformer
    )
    const status = await pipeline.query().first()
    if (!status) return response.notFound()
    if (await bouncer.with(UserStatusPolicy).denies('destroy', status)) {
      return response.forbidden('Insufficient permissions')
    }
    await TransformerService.invalidateCache({ namespace: 'userStatuses' })
    return status.delete()
  }
}
