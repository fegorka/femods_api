import type { HttpContext } from '@adonisjs/core/http'
import PackPreDownloadQuestionPolicy from '#policies/pack_pre_download_question_policy'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import { requestPageValidator, requestParamsCuidValidator } from '#validators/request'
import ControllerService from '#services/controller_service'
import {
  indexByPackReleasePackPreDownloadQuestionValidator,
  preCheckPackPreDownloadQuestionReleaseIdValidator,
  storePackPreDownloadQuestionValidator,
  updatePackPreDownloadQuestionValidator,
} from '#validators/pack_pre_download_question'
import Pack from '#models/pack'
import User from '#models/user'
import PackRelease from '#models/pack_release'

export default class PackPreDownloadQuestionsController {
  async index({ auth, bouncer, request }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(requestPageValidator)

    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('index'))
      return this.packPreDownloadQuestionIndexWithoutHiddenPacksQuery.paginate(
        request.input('page'),
        request.input('limit')
      )
    return await PackPreDownloadQuestion.query().paginate(
      request.input('page'),
      request.input('limit')
    )
  }

  async indexByPackRelease({ auth, bouncer, request, params }: HttpContext) {
    await ControllerService.authenticateOrSkipForGuest(auth, request)

    await request.validateUsing(indexByPackReleasePackPreDownloadQuestionValidator)

    const packRelease = await PackRelease.findBy({ id: params.packReleaseId })
    const packReleasePackId =
      packRelease && packRelease.packId !== undefined ? packRelease.packId : null
    const pack = await Pack.findBy({ id: packReleasePackId })
    const userId = auth.user && auth.user.id !== undefined ? auth.user.id : null
    const packUserId = pack && pack.userId !== undefined ? pack.userId : null

    if (userId === packUserId) return PackRelease.findManyBy({ packId: params.packReleaseId })

    if (await bouncer.with(PackPreDownloadQuestionPolicy).denies('index'))
      return this.packPreDownloadQuestionIndexWithoutHiddenPacksQuery.andWhere(
        'packReleaseId',
        params.packReleaseId
      )
    return await PackRelease.findManyBy({ packReleaseId: params.packReleaseId })
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

  private packPreDownloadQuestionIndexWithoutHiddenPacksQuery =
    PackPreDownloadQuestion.query().whereHas('packRelease', (packReleaseQuery) => {
      packReleaseQuery.whereHas('pack', (packQuery) => {
        packQuery
          .whereHas('packStatus', (packStatusQuery) => {
            packStatusQuery.whereIn('name', Pack.allowedPackStatusToIndex)
          })
          .andWhereHas('packVisibleLevel', (packVisibleLevelQuery) => {
            packVisibleLevelQuery.whereIn('name', Pack.allowedPackVisibleLevelToIndex)
          })
          .andWhereHas('user', (userQuery) => {
            userQuery.whereHas('userStatus', (userStatusQuery) => {
              userStatusQuery.whereIn('name', User.allowedUserStatusToIndex)
            })
          })
      })
    })
}
