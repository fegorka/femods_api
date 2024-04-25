import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackItemType from '#models/pack_item_type'
import PackRelease from '#models/pack_release'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import PackItemInstallPath from '#models/pack_item_install_path'

export default class PackItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare metaName: string

  @column()
  declare downloadUrl: string

  @column()
  declare safeStatus: string

  @column()
  declare packItemTypeId: string

  @column()
  declare packItemInstallPathId: string

  @column()
  declare packReleaseId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PackItemType)
  declare packItemType: BelongsTo<typeof PackItemType>

  @belongsTo(() => PackItemInstallPath)
  declare packItemInstallPath: BelongsTo<typeof PackItemInstallPath>

  @manyToMany(() => PackPreDownloadQuestion)
  declare packPreDownloadQuestions: ManyToMany<typeof PackPreDownloadQuestion>

  @belongsTo(() => PackRelease)
  declare packRelease: BelongsTo<typeof PackRelease>

  @beforeCreate()
  static async assignId(instance: PackItem) {
    instance.id = cuid()
  }
}
