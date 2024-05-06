import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

export const requestParamsCuidValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().fixedLength(HelperService.cuidLength).regex(HelperService.cuidRegex),
    }),
  })
)
