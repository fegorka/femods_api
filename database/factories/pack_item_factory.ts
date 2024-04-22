import factory from '@adonisjs/lucid/factories'
import PackItem from '#models/pack_item'
import { cuid } from '@adonisjs/core/helpers'
import { randomInt } from 'node:crypto'
import PackItemType from '#models/pack_item_type'
import PackRelease from '#models/pack_release'

export const PackItemFactory = factory
  .define(PackItem, async ({ faker }) => {
    const name = faker.lorem.word({ length: { min: 2, max: 39 } })
    const packItemTypes = await PackItemType.all()
    const packReleases = await PackRelease.all()
    return {
      name: name,
      metaName: `${name}+${cuid()}`,

      downloadUrl:
        `${faker.internet.url({ appendSlash: false })}/${faker.lorem.words(20)}/file/${faker.helpers.arrayElement(['.jar', '.zip', '.txt'])}`.replace(
          /\s+/g,
          ''
        ),

      safeStatus: faker.helpers.arrayElement(['safe', 'unknown', 'unsafe']),

      packItemTypeId: packItemTypes[randomInt(packItemTypes.length)].id,
      packReleaseId: packReleases[randomInt(packReleases.length)].id,
    }
  })
  .build()
