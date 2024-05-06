import vine from '@vinejs/vine'

function storeOrUpdatePackModCoreValidation(packModCoreId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packModCoreId === null)
            return !(await db.from('pack_mod_cores').where('name', value).first())
          return !(await db
            .from('pack_mod_cores')
            .where('name', value)
            .andWhereNot('id', packModCoreId)
            .first())
        }),
    })
  )
}

export const updatepackModCoreValidator = (packModCoreId: string) =>
  storeOrUpdatePackModCoreValidation(packModCoreId)
export const storePackModCoreValidator = storeOrUpdatePackModCoreValidation()
