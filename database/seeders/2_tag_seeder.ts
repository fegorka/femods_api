import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tag from '#models/tag'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await Tag.updateOrCreateMany('name', [
      { name: 'clientside' },
      { name: 'serverside' },
      { name: 'tweaks' },
      { name: 'industrial' },
      { name: 'steampunk' },
      { name: 'magic' },
      { name: 'worldgeneration' },
      { name: 'building' },
      { name: 'adventures' },
      { name: 'newdimensions' },
    ])
  }
}
