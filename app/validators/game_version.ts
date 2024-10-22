import vine from '@vinejs/vine'
import HelperService from '#services/helper_service'

const semVerRegex: RegExp = /^(?!0?\.0?\.0?$)(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){1,2}$/

function parseVersionToTrimVersionOrSkip(value: unknown) {
  if (typeof value !== 'string') return value
  return HelperService.trimVersion(value)
}

function storeOrUpdateGameVersionValidation(gameVersionId: string | null = null) {
  return vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .toLowerCase()
        .minLength(3)
        .maxLength(11)
        .regex(semVerRegex)
        .parse(parseVersionToTrimVersionOrSkip)
        .unique(async (db, value): Promise<boolean> => {
          if (gameVersionId === null)
            return !(await db.from('game_versions').where('name', value).first())
          return !(await db
            .from('game_versions')
            .where('name', value)
            .andWhereNot('id', gameVersionId)
            .first())
        }),
    })
  )
}

export const updateGameVersionValidator = (gameVersionId: string) =>
  storeOrUpdateGameVersionValidation(gameVersionId)
export const storeGameVersionValidator = storeOrUpdateGameVersionValidation()
