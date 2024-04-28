import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'packs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('public_id', 32).notNullable().unique()

      table.string('name', 32).notNullable()
      table.string('public_name', 32).notNullable().unique()

      table.string('min_version', 11).nullable()
      table.string('max_version', 11).nullable()

      table.bigint('total_download_count').notNullable().defaultTo(0)

      table
        .string('pack_visible_level_id')
        .notNullable()
        .references('id')
        .inTable('pack_visible_levels')
        .onDelete('CASCADE')

      table
        .string('pack_mod_core_id')
        .notNullable()
        .references('id')
        .inTable('pack_mod_cores')
        .onDelete('RESTRICT')

      table
        .string('pack_status_id')
        .notNullable()
        .references('id')
        .inTable('pack_statuses')
        .onDelete('RESTRICT')

      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
