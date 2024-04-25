import factory from '@adonisjs/lucid/factories'
import PackItemInstallPath from '#models/pack_item_install_path'

export const PackItemInstallPathFactory = factory
  .define(PackItemInstallPath, async ({ faker }) => {
    return {
      name: `${faker.lorem.word({ length: { min: 2, max: 16 } })}/${faker.lorem.word({ length: { min: 2, max: 16 } })}`,
    }
  })
  .build()
