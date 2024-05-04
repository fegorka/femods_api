import factory from '@adonisjs/lucid/factories'
import PackItem from '#models/pack_item'
import { randomInt } from 'node:crypto'
import PackItemInstallPath from '#models/pack_item_install_path'
import PackItemType from '#models/pack_item_type'
import PackRelease from '#models/pack_release'
import { PackPreDownloadQuestionFactory } from '#database/factories/pack_pre_download_question_factory'

export const PackItemFactory = factory
  .define(PackItem, async ({ faker }) => {
    const name = faker.lorem.word({ length: { min: 2, max: 39 } })
    const packItemInstallPaths = await PackItemInstallPath.all()
    const packItemTypes = await PackItemType.all()
    const packReleases = await PackRelease.all()
    return {
      name: name,

      downloadUrl:
        `${faker.internet.url({ appendSlash: false })}/${faker.lorem.words(20)}/file/${faker.helpers.arrayElement(['.jar', '.zip', '.txt'])}`.replace(
          /\s+/g,
          ''
        ),

      packItemInstallPathId: packItemInstallPaths[randomInt(packItemInstallPaths.length - 1)].id,
      packItemTypeId: packItemTypes[randomInt(packItemTypes.length - 1)].id,
      packReleaseId: packReleases[randomInt(packReleases.length - 1)].id,
    }
  })
  .relation('packPreDownloadQuestions', () => PackPreDownloadQuestionFactory)
  .build()
