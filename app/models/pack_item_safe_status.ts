import type { HasMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import PackItem from '#models/pack_item'
import { sortable } from '#decorators/sortable'

export default class PackItemSafeStatus extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => PackItem)
  declare packItems: HasMany<typeof PackItem>

  @beforeCreate()
  static async assignId(instance: PackItemSafeStatus) {
    instance.id = cuid()
  }
}
