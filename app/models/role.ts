import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import { sortable } from '#decorators/sortable'

export default class Role extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @manyToMany(() => User)
  declare users: ManyToMany<typeof User>

  @beforeCreate()
  static async assignId(instance: Role) {
    instance.id = cuid()
  }
}
