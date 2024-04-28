import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserStatus from '#models/user_status'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await UserStatus.updateOrCreateMany('name', [
      { name: 'frozen' },
      { name: 'hidden' },
      { name: 'default' },
    ])
  }
}
