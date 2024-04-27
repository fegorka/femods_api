import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_statuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('name', 32).notNullable().unique()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
