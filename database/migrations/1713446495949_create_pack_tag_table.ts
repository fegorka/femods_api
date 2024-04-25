import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_tag'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('pack_id').notNullable().references('id').inTable('packs').onDelete('CASCADE')
      table.string('tag_id').notNullable().references('id').inTable('tags').onDelete('RESTRICT')
      table.unique(['pack_id', 'tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
