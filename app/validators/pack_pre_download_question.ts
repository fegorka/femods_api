import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

function storeOrUpdatePackPreDownloadQuestionValidation(
  packReleaseId: string,
  packPreDownloadQuestionId: string | null = null
) {
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
          if (packPreDownloadQuestionId === null)
            return !(await db
              .from('pack_pre_download_questions')
              .where('name', value)
              .andWhere('pack_release_id', packReleaseId)
              .first())
          return !(await db
            .from('pack_pre_download_questions')
            .where('name', value)
            .andWhere('pack_release_id', packReleaseId)
            .andWhereNot('id', packPreDownloadQuestionId)
            .first())
        }),
      description: vine.string().trim().toLowerCase().minLength(2).maxLength(80).nullable(),
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

export const indexByPackReleasePackPreDownloadQuestionValidator = vine.compile(
  vine.object({
    params: vine.object({
      packReleaseId: vine
        .string()
        .fixedLength(HelperService.cuidLength)
        .regex(HelperService.cuidRegex)
        .exists(async (db, value): Promise<boolean> => {
          return await db.from('pack_releases').where('id', value).first()
        }),
    }),
  })
)

export const preCheckPackPreDownloadQuestionReleaseIdValidator = vine.compile(
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
export const updatePackPreDownloadQuestionValidator = (
  packReleaseId: string,
  packPreDownloadQuestionId: string
) => storeOrUpdatePackPreDownloadQuestionValidation(packReleaseId, packPreDownloadQuestionId)
export const storePackPreDownloadQuestionValidator = (packReleaseId: string) =>
  storeOrUpdatePackPreDownloadQuestionValidation(packReleaseId)
