import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

function storeOrUpdatePackValidation(packId: string | null = null) {
  return vine.compile(
    vine.object({
      publicName: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .regex(/^(?!_)(?!.*__)[a-z0-9_]+(?<!_)(?<!-)$/)
        .unique(async (db, value): Promise<boolean> => {
          if (packId === null) return !(await db.from('packs').where('public_name', value).first())
          return !(await db
            .from('packs')
            .where('public_name', value)
            .andWhereNot('id', packId)
            .first())
        }),
      packVisibleLevelId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_visible_levels').where('id', value).first()
        }),
      packModCoreId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_mod_cores').where('id', value).first()
        }),
      userId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('users').where('id', value).first()
        }),
    })
  )
}

export const indexByTagPackValidator = vine.compile(
  vine.object({
    params: vine.object({
      tagId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('tags').where('id', value).first()
        }),
    }),
  })
)

export const indexByUserPackValidator = vine.compile(
  vine.object({
    params: vine.object({
      userId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('users').where('id', value).first()
        }),
    }),
  })
)

export const updatePackValidator = (packId: string) => storeOrUpdatePackValidation(packId)
export const storePackValidator = storeOrUpdatePackValidation()
