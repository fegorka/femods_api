import { randomInt } from 'node:crypto'
import factory from '@adonisjs/lucid/factories'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'
import PackVisibleLevel from '#models/pack_visible_level'
import PackModCore from '#models/pack_mod_core'
import { UserFactory } from '#database/factories/user_factory'
import { PackReleaseFactory } from '#database/factories/pack_release_factory'

export const PackFactory = factory
  .define(Pack, async ({}) => {
    const packVisibleLevels = await PackVisibleLevel.all()
    const packModCores = await PackModCore.all()
    return {
      publicName: cuid(), // .word() no unique, uses .cuid()
      totalDownloadCount: BigInt(randomInt(999_999_999_999)),
      packVisibleLevelId: packVisibleLevels[Math.max(randomInt(packVisibleLevels.length - 1), 0)].id,
      packModCoreId: packModCores[Math.max(randomInt(packVisibleLevels.length - 1), 0)].id,
    }
  })
  .state('withoutPublicName', (instance) => (instance.publicName = null))
  .relation('user', () => UserFactory)
  .relation('packReleases', () => PackReleaseFactory)
  .build()
