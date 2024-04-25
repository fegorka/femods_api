import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('name', 32).notNullable()
      table.string('meta_name', 64).notNullable()

      table.string('download_url', 2048).notNullable()
      table.enum('safe_status', ['safe', 'unknown', 'unsafe']).notNullable().defaultTo('unknown')

      table
        .string('pack_item_type_id')
        .notNullable()
        .references('id')
        .inTable('pack_item_types')
        .onDelete('RESTRICT')

      table
        .string('pack_item_install_path_id')
        .notNullable()
        .references('id')
        .inTable('pack_item_install_paths')
        .onDelete('RESTRICT')

      table
        .string('pack_release_id')
        .notNullable()
        .references('id')
        .inTable('pack_releases')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
