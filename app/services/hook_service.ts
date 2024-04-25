import Pack from '#models/pack'
import PackRelease from '#models/pack_release'
import GameVersion from '#models/game_version'
export default class HookService {
  static async changePackVersionsInfo(packRelease: PackRelease) {
    const pack = await Pack.findBy({ id: packRelease.packId })
    if (pack === null) return
    const packReleases = await PackRelease.findManyBy({ packId: packRelease.packId })
    const gameVersions = await this.getPackReleasesVersions(packReleases)
    const gameVersionSorted = gameVersions.toSorted()
    pack.maxVersion = gameVersionSorted[gameVersionSorted.length - 1]
    pack.minVersion = gameVersionSorted[0]
    await pack.save()
  }

  private static async getPackReleasesVersions(packReleases: PackRelease[]): Promise<string[]> {
    const packReleasesVersions: string[] = []
    for (const packRelease of packReleases) {
      const gameVersion = await GameVersion.findByOrFail({ id: packRelease.gameVersionId })
      packReleasesVersions.push(gameVersion.name)
    }
    return packReleasesVersions
  }
}
