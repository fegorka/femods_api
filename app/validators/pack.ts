import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

function storeOrUpdatePackValidation() {
  return vine.compile(
    vine.object({
      name: vine.string().trim().minLength(2).maxLength(32),
      publicName: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .regex(/^(?!_)(?!.*__)[a-z0-9_]+(?<!_)(?<!-)$/)
        .unique(async (db, value): Promise<boolean> => {
          return !(await db.from('packs').where('public_name', value).first())
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

export const updatePackValidator = storeOrUpdatePackValidation()
export const storePackValidator = storeOrUpdatePackValidation()
