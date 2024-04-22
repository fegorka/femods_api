import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { PackReleaseFactory } from '#database/factories/pack_release_factory'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    await PackReleaseFactory.createMany(5)
    await PackReleaseFactory.with('packItems', 10).createMany(10)
  }
}
