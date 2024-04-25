import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pack_item_install_paths'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('name', 128)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
