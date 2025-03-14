import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 24).primary()
      table.string('public_id', 24).notNullable().unique()

      table.string('name').notNullable()
      table.string('public_name', 32).nullable().unique()
      table.string('avatar_url').notNullable()

      table.string('provider')
      table.string('provider_id')

      table.string('email').notNullable()

      table
        .string('user_status_id')
        .notNullable()
        .references('id')
        .inTable('user_statuses')
        .onDelete('RESTRICT')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
