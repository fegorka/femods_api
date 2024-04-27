import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Pack from '#models/pack'
import Tag from '#models/tag'
import { randomInt } from 'node:crypto'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    const packs = await Pack.all()
    const tags = await Tag.all()

    for (const pack of packs) {
      if ((await Pack.query().where('id', pack.id).andHas('tags').first()) !== null) return
      await pack.related('tags').attach([tags[randomInt(tags.length - 1)].id])
    }
    // ⚠️ using another loop causes an "error: aborted" (work with database connections pool)
    // in some package (maybe knex) contained in lucid
  }
}
