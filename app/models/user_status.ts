import type { HasMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class UserStatus extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @beforeCreate()
  static async assignId(instance: UserStatus) {
    instance.id = cuid()
  }
}
