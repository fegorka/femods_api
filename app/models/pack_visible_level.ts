import type { HasMany } from '@adonisjs/lucid/types/relations'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'
import { sortable } from '#decorators/sortable'

export default class PackVisibleLevel extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => Pack)
  declare packs: HasMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: PackVisibleLevel) {
    instance.id = cuid()
  }
}
