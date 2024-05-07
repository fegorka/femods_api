import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'

export default class PackVisibleLevel extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => Pack)
  declare packs: HasMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: PackVisibleLevel) {
    instance.id = cuid()
  }
}
