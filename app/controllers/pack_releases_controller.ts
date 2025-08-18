import type { HttpContext } from '@adonisjs/core/http'
import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import User from '#models/user'
import Pack from '#models/pack'
import ControllerService from '#services/controller_service'
import { TransformerService } from '#services/transformer_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import {
  preCheckPackReleasePackIdValidator,
  storePackReleaseIdeValidator,
  updatePackReleaseIdValidator,
} from '#validators/pack_release'

export default class PackReleasesController {
  async index({ auth, bouncer, request, appMeta }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackRelease))
    await request.validateUsing(requestSortValidator(PackRelease))

    const initial = (await bouncer.with(PackReleasePolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackRelease.query()

    const pipeline = new TransformerService(initial, appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(
      request,
      (q) => q.paginate(request.input('page'), request.input('limit')),
      {
        namespace: 'packReleases',
        tags: ['packRelease:index'],
        ttl: '2m',
        grace: '4m',
      }
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackReleasePolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(storePackReleaseIdeValidator(request.body().packId))
    await PackRelease.create(payload)
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))
    await request.validateUsing(requestIncludeValidator(PackRelease))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const packRelease = await PackRelease.findBy({ id: params.id })
    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('show', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new TransformerService(
      PackRelease.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, (q) => q.first(), {
      namespace: 'packReleases',
      tags: [`packRelease:${params.id}`],
      ttl: '2m',
      grace: '4m',
    })
  }

  async update({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))

    const pipeline = new TransformerService(
      PackRelease.query().where('id', params.id),
      appMeta?.transformer
    )
    const packRelease = await pipeline.query().first()

    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('update', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackReleasePackIdValidator)
    const payload = await request.validateUsing(
      updatePackReleaseIdValidator(request.body().packId, packRelease.id)
    )

    await TransformerService.invalidateCache({ tags: [`packRelease:${params.id}`] })
    await PackRelease.updateOrCreate({ id: packRelease.id }, payload)
  }

  async destroy({ bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator('id'))

    const pipeline = new TransformerService(
      PackRelease.query().where('id', params.id),
      appMeta?.transformer
    )
    const packRelease = await pipeline.query().first()

    if (!packRelease) return response.notFound()
    if (await bouncer.with(PackReleasePolicy).denies('destroy', packRelease)) {
      return response.forbidden('Insufficient permissions')
    }

    await TransformerService.invalidateCache({ tags: [`packRelease:${params.id}`] })
    return packRelease.delete()
  }

  private baseVisibilityQuery = () =>
    PackRelease.query().whereHas('pack', (packQuery) => {
      packQuery
        .whereHas('packStatus', (q) => q.whereIn('name', Pack.allowedPackStatusToIndex))
        .andWhereHas('packVisibleLevel', (q) =>
          q.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
        )
        .andWhereHas('user', (q) =>
          q.whereHas('userStatus', (q2) => q2.whereIn('name', User.allowedUserStatusToIndex))
        )
    })
}
