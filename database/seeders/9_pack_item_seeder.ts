import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { PackItemFactory } from '#database/factories/pack_item_factory'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    await PackItemFactory.createMany(10)
  }
}
