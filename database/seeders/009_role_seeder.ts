import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await Role.updateOrCreateMany('name', [
      { name: 'super' },
      { name: 'extended' },
      { name: 'special' },
      { name: 'default' },
    ])
  }
}
