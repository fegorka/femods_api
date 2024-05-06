import vine from '@vinejs/vine'

function storeOrUpdatePackItemTypeValidation(packItemTypeId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packItemTypeId === null)
            return !(await db.from('pack_item_types').where('name', value).first())
          return !(await db
            .from('pack_item_types')
            .where('name', value)
            .andWhereNot('id', packItemTypeId)
            .first())
        }),
    })
  )
}

export const updatePackItemTypeValidator = (packItemTypeId: string) =>
  storeOrUpdatePackItemTypeValidation(packItemTypeId)
export const storePackItemTypeValidator = storeOrUpdatePackItemTypeValidation()
