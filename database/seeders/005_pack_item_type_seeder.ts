import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackItemType from '#models/pack_item_type'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await PackItemType.updateOrCreateMany('name', [
      { name: 'mod' },
      { name: 'resourcepack' },
      { name: 'shaderpack' },
      { name: 'modconfig' },
      { name: 'gamesettings' },
    ])
  }
}
