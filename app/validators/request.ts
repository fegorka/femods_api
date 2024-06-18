import type { BaseModel } from '@adonisjs/lucid/orm'

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

function requestIncludeValidatorLogic(model: typeof BaseModel) {
  const allowedRelations: string[] = [...model.$relationsDefinitions.values()].map(
    (relation) => relation.relationName
  )
  const shema = vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.include), {
      include: vine
        .array(vine.string().trim().minLength(2).maxLength(64).in(allowedRelations).optional())
        .compact(),
    }),
    vine.group.else({
      include: vine.string().trim().minLength(2).maxLength(64).in(allowedRelations).optional(),
    }),
  ])
  return vine.compile(vine.object({}).merge(shema))
}

export const requestIncludeValidator = (model: BaseModel) => requestIncludeValidatorLogic(model)
