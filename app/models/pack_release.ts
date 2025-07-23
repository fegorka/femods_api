import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { ExtendedBaseModel } from '#models/extended_base_model'
import {
  afterCreate,
  afterDelete,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import GameVersion from '#models/game_version'
import Pack from '#models/pack'
import PackItem from '#models/pack_item'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import HookService from '#services/hook_service'
import { sortable } from '#decorators/sortable'

export default class PackRelease extends ExtendedBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  @sortable()
  declare totalDownloadCount: bigint

  @column()
  @sortable()
  declare gameVersionId: string

  @column()
  declare packId: string

  @column.dateTime({ autoCreate: true })
  @sortable()
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  @sortable()
  declare updatedAt: DateTime

  @belongsTo(() => GameVersion)
  declare gameVersion: BelongsTo<typeof GameVersion>

  @belongsTo(() => Pack)
  declare pack: BelongsTo<typeof Pack>

  @hasMany(() => PackItem)
  declare packItems: HasMany<typeof PackItem>

  @hasMany(() => PackPreDownloadQuestion)
  declare preDownloadQuestions: HasMany<typeof PackPreDownloadQuestion>

  @afterCreate()
  static async changePackVersionsInfoOnCreate(packRelease: PackRelease) {
    await HookService.changePackVersionsInfo(packRelease)
  }

  @afterDelete()
  static async changePackVersionsInfoOnDelete(packRelease: PackRelease) {
    await HookService.changePackVersionsInfo(packRelease)
  }

  @beforeCreate()
  static async assignId(instance: PackRelease) {
    instance.id = cuid()
  }
}
