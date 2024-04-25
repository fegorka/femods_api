import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_item_pack_pre_download_question'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('pack_item_id').notNullable().references('id').inTable('pack_items')
      table
        .string('pack_pre_download_question_id')
        .notNullable()
        .references('id')
        .inTable('pack_pre_download_questions')
      table.unique(['pack_item_id', 'pack_pre_download_question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
