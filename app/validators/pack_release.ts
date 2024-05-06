import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

function storeOrUpdatePackReleaseIdValidation(packId: string, packRelease: string | null = null) {
  return vine.compile(
    vine.object({
      gameVersionId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('game_versions').where('id', value).first()
        })
        .unique(async (db, value): Promise<boolean> => {
          if (packRelease === null)
            return !(await db
              .from('pack_releases')
              .where('game_version_id', value)
              .andWhere('pack_id', packId)
              .first())
          return !(await db
            .from('pack_releases')
            .where('game_version_id', value)
            .andWhere('pack_id', packId)
            .andWhereNot('id', packRelease)
            .first())
        }),
      packId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('packs').where('id', value).first()
        }),
    })
  )
}

export const preCheckPackReleasePackIdValidator = vine.compile(
  vine.object({
    packId: vine
      .string()
      .fixedLength(HelperService.cuidLength)
      .regex(HelperService.cuidRegex)
      .exists(async (db, value): Promise<boolean> => {
        return await db.from('packs').where('id', value).first()
      }),
  })
)

export const updatePackReleaseIdValidator = (packId: string, packRelease: string) =>
  storeOrUpdatePackReleaseIdValidation(packId, packRelease)
export const storePackReleaseIdeValidator = (packId: string) =>
  storeOrUpdatePackReleaseIdValidation(packId)
