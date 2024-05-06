import vine from '@vinejs/vine'

function storeOrUpdateRoleValidation(roleId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (roleId === null) return !(await db.from('roles').where('name', value).first())
          return !(await db.from('roles').where('name', value).andWhereNot('id', roleId).first())
        }),
    })
  )
}

export const updateRoleValidator = (roleId: string) => storeOrUpdateRoleValidation(roleId)
export const storeRoleValidator = storeOrUpdateRoleValidation()
