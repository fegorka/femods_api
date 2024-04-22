import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackRelease from '#models/pack_release'

export default class GameVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => PackRelease)
  declare packReleases: HasMany<typeof PackRelease>

  @beforeCreate()
  static async assignId(instance: GameVersion) {
    instance.id = cuid()
  }
}
