import { BaseSeeder } from '@adonisjs/lucid/seeders'
import GameVersion from '#models/game_version'

export default class extends BaseSeeder {
  static environment = ['production', 'development']
  async run() {
    await GameVersion.updateOrCreateMany('name', [
      { name: '1.14.1' },
      { name: '1.14.2' },
      { name: '1.14.3' },
      { name: '1.14.4' },
      { name: '1.15' },
      { name: '1.15.1' },
      { name: '1.15.2' },
      { name: '1.16' },
      { name: '1.16.1' },
      { name: '1.16.2' },
      { name: '1.16.3' },
      { name: '1.16.4' },
      { name: '1.16.5' },
      { name: '1.17' },
      { name: '1.17.1' },
      { name: '1.18.0' },
      { name: '1.18.1' },
      { name: '1.18.2' },
      { name: '1.19' },
      { name: '1.19.1' },
      { name: '1.19.2' },
      { name: '1.19.3' },
      { name: '1.19.4' },
      { name: '1.20' },
      { name: '1.20.1' },
      { name: '1.20.2' },
      { name: '1.20.3' },
      { name: '1.20.4' },
      { name: '1.20.5' },
    ])
  }
}
