import vine from '@vinejs/vine'

function storeOrUpdatePackItemSafeStatusValidation(packSafeStatusId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packSafeStatusId === null)
            return !(await db.from('pack_item_safe_statuses').where('name', value).first())
          return !(await db
            .from('pack_item_safe_statuses')
            .where('name', value)
            .andWhereNot('id', packSafeStatusId)
            .first())
        }),
    })
  )
}

export const updatePackItemSafeStatusValidator = (packSafeStatusId: string) =>
  storeOrUpdatePackItemSafeStatusValidation(packSafeStatusId)
export const storePackItemSafeStatusValidator = storeOrUpdatePackItemSafeStatusValidation()
