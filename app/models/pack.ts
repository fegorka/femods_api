import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import PackVisibleLevel from '#models/pack_visible_level'
import PackModCore from '#models/pack_mod_core'
import User from '#models/user'
import PackRelease from '#models/pack_release'
import Tag from '#models/tag'
import PackStatus from '#models/pack_status'

export default class Pack extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare publicId: string

  @column()
  declare name: string

  @column()
  declare publicName: string | null

  @column()
  declare minVersion: string | null

  @column()
  declare maxVersion: string | null

  @column()
  declare totalDownloadCount: bigint

  @column()
  declare packVisibleLevelId: string

  @column()
  declare packModCoreId: string

  @column()
  declare packStatusId: string

  @column()
  declare userId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PackVisibleLevel)
  declare packVisibleLevel: BelongsTo<typeof PackVisibleLevel>

  @belongsTo(() => PackModCore)
  declare packModCore: BelongsTo<typeof PackModCore>

  @belongsTo(() => PackStatus)
  declare packStatus: BelongsTo<typeof PackStatus>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => PackRelease)
  declare packReleases: HasMany<typeof PackRelease>

  @manyToMany(() => Tag)
  declare tags: ManyToMany<typeof Tag>

  @beforeCreate()
  static async assignStatus(pack: Pack) {
    const defaultStatus = await PackStatus.findByOrFail({ name: 'default' })
    pack.packStatusId = defaultStatus.id
  }

  @beforeCreate()
  static async assignId(instance: Pack) {
    instance.id = cuid()
  }

  @beforeCreate()
  static async assignPublicId(instance: Pack) {
    instance.publicId = cuid()
  }
}
