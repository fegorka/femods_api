import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'

export default class Tag extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @manyToMany(() => Pack)
  declare packs: ManyToMany<typeof Pack>

  @beforeCreate()
  static async assignId(instance: Tag) {
    instance.id = cuid()
  }
}
