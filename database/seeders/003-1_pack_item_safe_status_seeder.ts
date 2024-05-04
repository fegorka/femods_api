import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackItemSafeStatus from '#models/pack_item_safe_status'

export default class extends BaseSeeder {
  async run() {
    await PackItemSafeStatus.updateOrCreateMany('name', [
      { name: 'safe' },
      { name: 'unknown' },
      { name: 'unsafe' },
    ])
  }
}
