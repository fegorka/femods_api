import factory from '@adonisjs/lucid/factories'
import PackRelease from '#models/pack_release'
import GameVersion from '#models/game_version'
import { randomInt } from 'node:crypto'
import Pack from '#models/pack'
import { PackItemFactory } from '#database/factories/pack_item_factory'

export const PackReleaseFactory = factory
  .define(PackRelease, async () => {
    const gameVersions = await GameVersion.all()
    const packs = await Pack.all()
    return {
      gameVersionId: gameVersions[randomInt(gameVersions.length - 1)].id,
      packId: packs[randomInt(packs.length - 1)].id,
    }
  })
  .relation('packItems', () => PackItemFactory)
  .build()
