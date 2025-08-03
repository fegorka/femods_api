import type { BaseModel } from '@adonisjs/lucid/orm'
import '#validation_macros/is_cuid_macro'

import vine from '@vinejs/vine'
import { ModelService } from '#services/model_service'
import { ExtendedBaseModel } from '#models/extended_base_model'

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
    search: vine
      .array(vine.string().trim().toLowerCase().minLength(1).maxLength(64))
      .compact()
      .notEmpty()
      .maxLength(8)
      .optional(),
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

function requestSortValidatorLogic(model: typeof ExtendedBaseModel) {
  const allowedFields = ModelService.getSortableFields(model)

  const sortItemRule = vine
    .string()
    .minLength(1)
    .maxLength(64)
    .in(allowedFields.map((field) => [`>${field}`, `<${field}`]).flat())

  const schema = vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.sort), {
      sort: vine.array(sortItemRule).compact().maxLength(allowedFields.length).optional(),
    }),
    vine.group.else({
      sort: sortItemRule.optional(),
    }),
  ])

  return vine.compile(vine.object({}).merge(schema))
}

export const requestSortValidator = (model: typeof ExtendedBaseModel) =>
  requestSortValidatorLogic(model)
