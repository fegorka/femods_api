import vine from '@vinejs/vine'

function storeOrUpdatePackVisibleLevelValidation(packVisibleLevelId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (packVisibleLevelId === null)
            return !(await db.from('pack_visible_levels').where('name', value).first())
          return !(await db
            .from('pack_visible_levels')
            .where('name', value)
            .andWhereNot('id', packVisibleLevelId)
            .first())
        }),
    })
  )
}

export const updatePackVisibleLevelValidator = (packVisibleLevelId: string) =>
  storeOrUpdatePackVisibleLevelValidation(packVisibleLevelId)
export const storePackVisibleLevelValidator = storeOrUpdatePackVisibleLevelValidation()
