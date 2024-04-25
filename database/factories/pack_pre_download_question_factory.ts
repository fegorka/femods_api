import factory from '@adonisjs/lucid/factories'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import PackRelease from '#models/pack_release'
import { randomInt } from 'node:crypto'

export const PackPreDownloadQuestionFactory = factory
  .define(PackPreDownloadQuestion, async ({ faker }) => {
    const packReleases = await PackRelease.all()
    return {
      name: `${faker.lorem.words({ min: 1, max: 2 })}`,
      description: `${faker.lorem.words({ min: 2, max: 5 })}`,
      packReleaseId: packReleases[randomInt(packReleases.length - 1)].id,
    }
  })
  .build()
