import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackStatus from '#models/pack_status'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await PackStatus.updateOrCreateMany('name', [
      { name: 'frozen' },
      { name: 'hidden' },
      { name: 'default' },
    ])
  }
}
