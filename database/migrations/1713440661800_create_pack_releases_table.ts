import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_releases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.bigint('total_download_count').notNullable().defaultTo(0)

      table
        .string('game_version_id')
        .notNullable()
        .references('id')
        .inTable('game_versions')
        .onDelete('RESTRICT')

      table.string('pack_id').notNullable().references('id').inTable('packs').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
