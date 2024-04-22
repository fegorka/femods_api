import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { PackFactory } from '#database/factories/pack_factory'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    await PackFactory.with('user').createMany(5)
    await PackFactory.with('user').with('packReleases', 5).createMany(5)
    await PackFactory.with('user')
      .with('packReleases', 5, (packRelease) => packRelease.with('packItems', 10))
      .createMany(10)
  }
}
