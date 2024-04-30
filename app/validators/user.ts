import vine from '@vinejs/vine'
import { BooleanLiteral } from '@swc/core'

export const updateUserValidator = vine.compile(
  vine.object({
    publicName: vine
      .string()
      .trim()
      .toLowerCase()
      .minLength(2)
      .maxLength(32)
      .regex(/^(?!_)(?!.*__)[a-z0-9_]+(?<!_)(?<!-)$/)
      .unique(async (db, value): Promise<boolean> => {
        return !(await db.from('users').where('public_name', value).first())
      }),
  })
)

export const requestParamsIdExistUserValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine
        .string()
        .fixedLength(24)
        .regex(/[0-9a-km-zA-HJ-NP-Z]+$/)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('users').where('id', value).first()
        }),
    }),
  })
)
