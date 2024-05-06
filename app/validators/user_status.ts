import vine from '@vinejs/vine'

function storeOrUpdateUserStatusValidation(userStatusId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (userStatusId === null)
            return !(await db.from('user_statuses').where('name', value).first())
          return !(await db
            .from('user_statuses')
            .where('name', value)
            .andWhereNot('id', userStatusId)
            .first())
        }),
    })
  )
}

export const updateUserStatusValidator = (userStatusId: string) =>
  storeOrUpdateUserStatusValidation(userStatusId)
export const storeUserStatusValidator = storeOrUpdateUserStatusValidation()
