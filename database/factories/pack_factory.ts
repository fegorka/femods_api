import factory from '@adonisjs/lucid/factories'
import Pack from '#models/pack'
import { UserFactory } from '#database/factories/user_factory'
import PackVisibleLevel from '#models/pack_visible_level'
import { randomInt } from 'node:crypto'
import PackModCore from '#models/pack_mod_core'
import { cuid } from '@adonisjs/core/helpers'
import { PackReleaseFactory } from '#database/factories/pack_release_factory'
import Tag from '#models/tag'
import PackStatus from '#models/pack_status'

export const PackFactory = factory
  .define(Pack, async ({ faker }) => {
    const truncateString = (str: string, maxLength: number) =>
      str.length > maxLength ? str.slice(0, maxLength) : str

    const packVisibleLevels = await PackVisibleLevel.all()
    const packModCores = await PackModCore.all()
    return {
      name: truncateString(faker.lorem.words({ min: 1, max: 3 }), 32),
      publicName: cuid(), // .word() no unique, uses .cuid()

      packVisibleLevelId: packVisibleLevels[randomInt(packVisibleLevels.length - 1)].id,
      packModCoreId: packModCores[randomInt(packVisibleLevels.length - 1)].id,
    }
  })
  .state('withoutPublicName', (instance) => (instance.publicName = null))
  .relation('user', () => UserFactory)
  .relation('packReleases', () => PackReleaseFactory)
  .build()
