import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    await UserFactory.createMany(5)
    await UserFactory.with('packs', 5).createMany(5)

    await UserFactory.apply('withoutPublicName').createMany(5)
    await UserFactory.apply('withoutPublicName').with('packs', 5).createMany(5)
  }
}
