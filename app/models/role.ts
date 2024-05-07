import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class Role extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @manyToMany(() => User)
  declare users: ManyToMany<typeof User>

  @beforeCreate()
  static async assignId(instance: Role) {
    instance.id = cuid()
  }
}
