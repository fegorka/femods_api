import type { HasMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import Pack from '#models/pack'

export default class PackStatus extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => Pack)
  declare packs: HasMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: PackStatus) {
    instance.id = cuid()
  }
}
