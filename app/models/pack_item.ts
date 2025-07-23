import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { ExtendedBaseModel } from '#models/extended_base_model'
import { beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackItemType from '#models/pack_item_type'
import PackRelease from '#models/pack_release'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import PackItemSafeStatus from '#models/pack_item_safe_status'
import { sortable } from '#decorators/sortable'

export default class PackItem extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare name: string

  @column()
  declare metaName: string

  @column()
  @sortable()
  declare downloadUrl: string

  @column()
  declare installPathModifier: string | null

  @column()
  declare packItemSafeStatusId: string

  @column()
  declare packItemTypeId: string

  @column()
  declare packReleaseId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PackItemType)
  declare packItemType: BelongsTo<typeof PackItemType>

  @belongsTo(() => PackRelease)
  declare packRelease: BelongsTo<typeof PackRelease>

  @belongsTo(() => PackItemSafeStatus)
  declare packItemSafeStatus: BelongsTo<typeof PackItemSafeStatus>

  @manyToMany(() => PackPreDownloadQuestion)
  declare packPreDownloadQuestions: ManyToMany<typeof PackPreDownloadQuestion>

  @beforeCreate()
  static async assignPackItemSafeStatus(packItem: PackItem) {
    const defaultStatus = await PackItemSafeStatus.findByOrFail({ name: 'unknown' })
    packItem.packItemSafeStatusId = defaultStatus.id
  }

  @beforeCreate()
  static async assignId(instance: PackItem) {
    instance.id = cuid()
  }

  @beforeCreate()
  static async assignMetaName(instance: PackItem) {
    instance.metaName = cuid()
  }
}
