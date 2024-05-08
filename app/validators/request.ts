import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

export const requestParamsCuidValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().fixedLength(HelperService.cuidLength).regex(HelperService.cuidRegex),
    }),
  })
)

export const requestPageValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1),
    limit: vine.number().positive().min(1),
  })
)

export const requestSearchValidator = vine.compile(
  vine.object({
    search: vine.string().trim().toLowerCase().minLength(2).maxLength(64).optional(),
  })
)
