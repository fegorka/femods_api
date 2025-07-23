import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackRelease from '#models/pack_release'
import PackItem from '#models/pack_item'
import { sortable } from '#decorators/sortable'

export default class PackPreDownloadQuestion extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare packReleaseId: string

  @belongsTo(() => PackRelease)
  declare packRelease: BelongsTo<typeof PackRelease>

  @manyToMany(() => PackItem)
  declare packItems: ManyToMany<typeof PackItem>

  @beforeCreate()
  static async assignId(instance: PackPreDownloadQuestion) {
    instance.id = cuid()
  }
}
