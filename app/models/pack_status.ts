import type { HasMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import Pack from '#models/pack'
import { sortable } from '#decorators/sortable'

export default class PackStatus extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => Pack)
  declare packs: HasMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: PackStatus) {
    instance.id = cuid()
  }
}
