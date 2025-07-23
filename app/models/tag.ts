import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'
import { sortable } from '#decorators/sortable'

export default class Tag extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @manyToMany(() => Pack)
  declare packs: ManyToMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: Tag) {
    instance.id = cuid()
  }
}
