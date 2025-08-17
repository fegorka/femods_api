import type { HttpContext } from '@adonisjs/core/http'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import PackPreDownloadQuestionPolicy from '#policies/pack_pre_download_question_policy'
import PackRelease from '#models/pack_release'
import ControllerService from '#services/controller_service'
import { QueryPipelineService } from '#services/query_pipeline_service'

import {
  requestIncludeValidator,
  requestPageValidator,
  requestParamsCuidValidator,
  requestSortValidator,
} from '#validators/request'
import {
  indexByPackReleasePackPreDownloadQuestionValidator,
  preCheckPackPreDownloadQuestionReleaseIdValidator,
  storePackPreDownloadQuestionValidator,
  updatePackPreDownloadQuestionValidator,
} from '#validators/pack_pre_download_question'
import Pack from '#models/pack'
import User from '#models/user'

export default class PackPreDownloadQuestionsController {
  async index({ auth, bouncer, request, appMeta }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)
    await request.validateUsing(requestPageValidator)
    await request.validateUsing(requestIncludeValidator(PackPreDownloadQuestion))
    await request.validateUsing(requestSortValidator(PackPreDownloadQuestion))

    const initial = (await bouncer.with(PackPreDownloadQuestionPolicy).denies('index'))
      ? this.baseVisibilityQuery()
      : PackPreDownloadQuestion.query()

    const pipeline = new QueryPipelineService(initial, appMeta?.transformer)
      .transform((q) => ControllerService.includeRelations(q, request.input('includes')))
      .transform((q) => ControllerService.applySorting(q, request.input('sort')))

    return pipeline.executeWithCache(request, 120, (q) =>
      q.paginate(request.input('page'), request.input('limit'))
    )
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('store')) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackPreDownloadQuestionReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackPreDownloadQuestionValidator(request.body().packReleaseId)
    )
    await PackPreDownloadQuestion.create(payload)
  }

  async show({ auth, bouncer, response, request, params, appMeta }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)
    await request.validateUsing(requestIncludeValidator(PackPreDownloadQuestion))
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const question = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (!question) return response.notFound()
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('show', question)) {
      return response.forbidden('Insufficient permissions')
    }

    const pipeline = new QueryPipelineService(
      PackPreDownloadQuestion.query().where('id', params.id),
      appMeta?.transformer
    ).transform((q) => ControllerService.includeRelations(q, request.input('includes')))

    return pipeline.executeWithCache(request, 120, (q) => q.first())
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const question = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (!question) return response.notFound()
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('update', question)) {
      return response.forbidden('Insufficient permissions')
    }

    await request.validateUsing(preCheckPackPreDownloadQuestionReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackPreDownloadQuestionValidator(
        request.body().packReleaseId,
        question.id
      )
    )
    await PackPreDownloadQuestion.updateOrCreate({ id: question.id }, payload)
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const question = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (!question) return response.notFound()
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('destroy', question)) {
      return response.forbidden('Insufficient permissions')
    }

    return question.delete()
  }

  private baseVisibilityQuery = () =>
  PackPreDownloadQuestion.query().whereHas('packRelease', (packReleaseQuery) => {
    packReleaseQuery.whereHas('pack', (packQuery) => {
      packQuery
        .whereHas('packStatus', (q) => q.whereIn('name', Pack.allowedPackStatusToIndex))
        .andWhereHas('packVisibleLevel', (q) => q.whereIn('name', Pack.allowedPackVisibleLevelToIndex))
        .andWhereHas('user', (q) => q.whereHas('userStatus', (q2) => q2.whereIn('name', User.allowedUserStatusToIndex)))
    })
  })
}
