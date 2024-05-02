import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackVisibleLevel from '#models/pack_visible_level'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await PackVisibleLevel.updateOrCreateMany('name', [
      { name: 'public' },
      { name: 'link' },
      { name: 'private' },
    ])
  }
}
