import vine from '@vinejs/vine'

export const updateUserValidator = (userId: string) =>
  vine.compile(
    vine.object({
      publicName: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .regex(/^(?!_)(?!.*__)[a-z0-9_]+(?<!_)(?<!-)$/)
        .unique(async (db, value): Promise<boolean> => {
          return !(await db
            .from('users')
            .where('public_name', value)
            .andWhereNot('id', userId)
            .first())
        })
        .nullable(),
    })
  )
