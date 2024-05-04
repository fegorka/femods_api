import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 24).primary()

      table.string('name', 32).notNullable()
      table.string('meta_name', 24).notNullable().unique()

      table.string('download_url', 2048).notNullable()

      table
        .string('pack_item_safe_status_id')
        .notNullable()
        .references('id')
        .inTable('pack_item_safe_statuses')
        .onDelete('RESTRICT')

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
