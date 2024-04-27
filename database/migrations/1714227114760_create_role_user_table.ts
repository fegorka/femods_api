import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('role_id').notNullable().references('id').inTable('roles').onDelete('RESTRICT')
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.unique(['role_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
