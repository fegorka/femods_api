import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { isCuid } from '@adonisjs/core/helpers'

export async function cuidValidate(value: unknown, _: undefined, field: FieldContext) {
  if (typeof value !== 'string') {
    return
  }

  if (!isCuid(value)) {
    field.report('The {{ field }} field must be a valid CUID', 'isCuid', field)
  }
}

export const isCuidRule = vine.createRule(cuidValidate)
