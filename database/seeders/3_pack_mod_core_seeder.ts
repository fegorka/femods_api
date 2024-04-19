import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackModCore from '#models/pack_mod_core'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await PackModCore.updateOrCreateMany('name', [
      { name: 'fabric' },
      { name: 'quilt' },
      { name: 'forge' },
      { name: 'neoforge' },
    ])
  }
}
