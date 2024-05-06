import vine from '@vinejs/vine'

function storeOrUpdatePackItemSafeStatusValidation(packItemSafeStatusId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packItemSafeStatusId === null)
            return !(await db.from('pack_item_safe_statuses').where('name', value).first())
          return !(await db
            .from('pack_item_safe_statuses')
            .where('name', value)
            .andWhereNot('id', packItemSafeStatusId)
            .first())
        }),
    })
  )
}

export const updatePackItemSafeStatusValidator = (packItemSafeStatusId: string) =>
  storeOrUpdatePackItemSafeStatusValidation(packItemSafeStatusId)
export const storePackItemSafeStatusValidator = storeOrUpdatePackItemSafeStatusValidation()
