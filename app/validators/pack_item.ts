import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

function storeOrUpdatePackItemValidation(packReleaseId: string) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(2)
        .maxLength(32)
        .regex(/^(?!_)(?!.*__)[a-zA-Z0-9_ ]+(?<!_)(?<!-)$/)
        .unique(async (db, value): Promise<boolean> => {
          return !(await db
            .from('pack_items')
            .where('name', value)
            .andWhere('pack_release_id', packReleaseId)
            .first())
        }),
      // metaName work with error on unique, will be changed on database change
      metaName: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .unique(async (db, value): Promise<boolean> => {
          return !(await db.from('pack_items').where('meta_name', value).first())
        }),
      downloadUrl: vine
        .string()
        .activeUrl()
        .regex(/^(https:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/.*\.(jar|zip)$/),
      safeStatus: vine.enum(['safe', 'unknown', 'unsafe']),
      packItemTypeId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_item_types').where('id', value).first()
        }),
      packItemInstallPathId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_item_install_paths').where('id', value).first()
        }),
      packReleaseId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_releases').where('id', value).first()
        }),
    })
  )
}

export const preCheckPackItemReleaseIdValidator = vine.compile(
  vine.object({
    packReleaseId: vine
      .string()
      .fixedLength(HelperService.cuidLength)
      .regex(HelperService.cuidRegex)
      .exists(async (db, value): Promise<boolean> => {
        return await db.from('pack_releases').where('id', value).first()
      }),
  })
)
export const updatePackItemValidator = (packReleaseId: string) =>
  storeOrUpdatePackItemValidation(packReleaseId)
export const storePackItemValidator = (packReleaseId: string) =>
  storeOrUpdatePackItemValidation(packReleaseId)
