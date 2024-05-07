import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackItem from '#models/pack_item'

export default class PackItemType extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => PackItem)
  declare packItems: HasMany<typeof PackItem>

  @beforeCreate()
  static async assignId(instance: PackItemType) {
    instance.id = cuid()
  }
}
