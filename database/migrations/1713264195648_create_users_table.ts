import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary()
      table.string('public_id').notNullable().unique()

      table.string('name').notNullable()
      table.string('public_name').nullable().unique()
      table.string('avatar_url').notNullable()

      table.string('provider')
      table.string('provider_id')

      table.string('email', 254).notNullable().unique()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
