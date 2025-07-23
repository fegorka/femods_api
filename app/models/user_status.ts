import type { HasMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import { sortable } from '#decorators/sortable'

export default class UserStatus extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @beforeCreate()
  static async assignId(instance: UserStatus) {
    instance.id = cuid()
  }
}
