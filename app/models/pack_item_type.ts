import type { HasMany } from '@adonisjs/lucid/types/relations'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackItem from '#models/pack_item'
import { sortable } from '#decorators/sortable'

export default class PackItemType extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => PackItem)
  declare packItems: HasMany<typeof PackItem>

  @beforeCreate()
  static async assignId(instance: PackItemType) {
    instance.id = cuid()
  }
}
