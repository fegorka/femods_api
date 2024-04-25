import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_pre_download_questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('name', 32).notNullable()
      table.string('description', 80).nullable()

      table
        .string('pack_release_id')
        .notNullable()
        .references('id')
        .inTable('pack_releases')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
