import vine from '@vinejs/vine'

function storeOrUpdateTagValidation(tagId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .unique(async (db, value): Promise<boolean> => {
          if (tagId === null) return !(await db.from('tags').where('name', value).first())
          return !(await db.from('tags').where('name', value).andWhereNot('id', tagId).first())
        }),
    })
  )
}

export const updateTagValidator = (tagId: string) => storeOrUpdateTagValidation(tagId)
export const storeTagValidator = storeOrUpdateTagValidation()
