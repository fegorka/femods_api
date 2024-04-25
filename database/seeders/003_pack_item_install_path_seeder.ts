import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackItemInstallPath from '#models/pack_item_install_path'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await PackItemInstallPath.updateOrCreateMany('name', [
      { name: 'mods' },
      { name: 'resourcepacks' },
      { name: 'shaderpacks' },
      { name: 'config' },
    ])
  }
}
