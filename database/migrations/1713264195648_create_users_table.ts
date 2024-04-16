import { BaseSchema } from '@adonisjs/lucid/schema'
import { createId } from '@paralleldrive/cuid2'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().primary().defaultTo(createId())

      table.string('name').notNullable()
      table.string('public_name').notNullable().unique()
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
