import type { BaseModel } from '@adonisjs/lucid/orm'
import '#validation_macros/is_cuid_macro'

import vine from '@vinejs/vine'

export const requestParamsCuidValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().cuid(),
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
    vine.group.if((data) => vine.helpers.isArray(data.includes), {
      includes: vine
        .array(vine.string().trim().minLength(2).maxLength(64).in(allowedRelations).optional())
        .compact(),
    }),
    vine.group.else({
      includes: vine.string().trim().minLength(2).maxLength(64).in(allowedRelations).optional(),
    }),
  ])
  return vine.compile(vine.object({}).merge(shema))
}

export const requestIncludeValidator = (model: typeof BaseModel) =>
  requestIncludeValidatorLogic(model)
