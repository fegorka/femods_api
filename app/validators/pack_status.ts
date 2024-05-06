import vine from '@vinejs/vine'

function storeOrUpdatePackStatusValidation(PackStatusId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (PackStatusId === null)
            return !(await db.from('pack_statuses').where('name', value).first())
          return !(await db
            .from('pack_statuses')
            .where('name', value)
            .andWhereNot('id', PackStatusId)
            .first())
        }),
    })
  )
}

export const updatePackStatusValidator = (PackStatusId: string) =>
  storeOrUpdatePackStatusValidation(PackStatusId)
export const storePackStatusValidator = storeOrUpdatePackStatusValidation()
