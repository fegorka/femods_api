import type { HttpContext } from '@adonisjs/core/http'
import PackPreDownloadQuestionPolicy from '#policies/pack_pre_download_question_policy'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import { requestParamsCuidValidator } from '#validators/request'
import ControllerService from '#services/controller_service'
import {
  preCheckPackPreDownloadQuestionReleaseIdValidator,
  storePackPreDownloadQuestionValidator,
  updatePackPreDownloadQuestionValidator,
} from '#validators/pack_pre_download_question'

export default class PackPreDownloadQuestionsController {
  async index({ bouncer, response }: HttpContext) {
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('index'))
      return response.forbidden('Insufficient permissions')
    return await PackPreDownloadQuestion.all()
  }

  async store({ bouncer, response, request }: HttpContext) {
    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('store'))
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackPreDownloadQuestionReleaseIdValidator)
    const payload = await request.validateUsing(
      storePackPreDownloadQuestionValidator(request.body().packReleaseId)
    )
    await PackPreDownloadQuestion.create(payload)
  }

  async show({ auth, bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    await ControllerService.authenticateOrSkipForGuest(auth, request)

    const requestedPackPreDownloadQuestion = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (requestedPackPreDownloadQuestion === null || requestedPackPreDownloadQuestion === undefined)
      return response.notFound()

    if (
      await bouncer
        .with(PackPreDownloadQuestionPolicy)
        .denies('show', requestedPackPreDownloadQuestion)
    )
      return response.forbidden('Insufficient permissions')
    return await PackPreDownloadQuestion.findBy({ id: params.id })
  }

  async update({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackPreDownloadQuestion = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (requestedPackPreDownloadQuestion === null || requestedPackPreDownloadQuestion === undefined)
      return response.notFound()

    if (
      await bouncer
        .with(PackPreDownloadQuestionPolicy)
        .denies('update', requestedPackPreDownloadQuestion)
    )
      return response.forbidden('Insufficient permissions')

    await request.validateUsing(preCheckPackPreDownloadQuestionReleaseIdValidator)
    const payload = await request.validateUsing(
      updatePackPreDownloadQuestionValidator(
        request.body().packReleaseId,
        requestedPackPreDownloadQuestion.id
      )
    )
    await PackPreDownloadQuestion.updateOrCreate(
      { id: requestedPackPreDownloadQuestion.id },
      payload
    )
  }

  async destroy({ bouncer, response, request, params }: HttpContext) {
    await request.validateUsing(requestParamsCuidValidator)

    const requestedPackPreDownloadQuestion = await PackPreDownloadQuestion.findBy({ id: params.id })
    if (requestedPackPreDownloadQuestion === null || requestedPackPreDownloadQuestion === undefined)
      return response.notFound()

    if (
      await bouncer
        .with(PackPreDownloadQuestionPolicy)
        .denies('destroy', requestedPackPreDownloadQuestion)
    )
      return response.forbidden('Insufficient permissions')
    return await requestedPackPreDownloadQuestion.delete()
  }
}
