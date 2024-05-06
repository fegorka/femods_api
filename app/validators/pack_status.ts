import vine from '@vinejs/vine'

function storeOrUpdatePackStatusValidation(packStatusId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packStatusId === null)
            return !(await db.from('pack_statuses').where('name', value).first())
          return !(await db
            .from('pack_statuses')
            .where('name', value)
            .andWhereNot('id', packStatusId)
            .first())
        }),
    })
  )
}

export const updatePackStatusValidator = (packStatusId: string) =>
  storeOrUpdatePackStatusValidation(packStatusId)
export const storePackStatusValidator = storeOrUpdatePackStatusValidation()
