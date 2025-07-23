import type { HasMany } from '@adonisjs/lucid/types/relations'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackRelease from '#models/pack_release'
import { sortable } from '#decorators/sortable'

export default class GameVersion extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @hasMany(() => PackRelease)
  declare packReleases: HasMany<typeof PackRelease>

  @beforeCreate()
  static async assignId(instance: GameVersion) {
    instance.id = cuid()
  }
}
