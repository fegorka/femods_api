import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import GameVersion from '#models/game_version'
import Pack from '#models/pack'
import PackItem from '#models/pack_item'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'

export default class PackRelease extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare totalDownloadCount: bigint

  @column()
  declare gameVersionId: string

  @column()
  declare packId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameVersion)
  declare gameVersion: BelongsTo<typeof GameVersion>

  @belongsTo(() => Pack)
  declare pack: BelongsTo<typeof Pack>

  @hasMany(() => PackItem)
  declare packItems: HasMany<typeof PackItem>

  @hasMany(() => PackPreDownloadQuestion)
  declare preDownloadQuestions: HasMany<typeof PackPreDownloadQuestion>

  @beforeCreate()
  static async assignId(instance: PackRelease) {
    instance.id = cuid()
  }
}
