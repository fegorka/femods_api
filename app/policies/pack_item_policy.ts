import User from '#models/user'
import PackItem from '#models/pack_item'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import Pack from '#models/pack'
import PackRelease from '#models/pack_release'
import PackVisibleLevel from '#models/pack_visible_level'
import PackStatus from '#models/pack_status'
import UserStatus from '#models/user_status'

export default class PackItemPolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['default'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedPackItem: PackItem): Promise<AuthorizerResponse> {
    const pack = await this.getPackByPackItemId(requestedPackItem.packReleaseId)
    const packStatus = await PackStatus.findByOrFail({ id: pack.packStatusId })
    const packVisibleLevel = await PackVisibleLevel.findByOrFail({
      id: pack.packVisibleLevelId,
    })
    const packUser = await User.findByOrFail({ id: pack.userId })
    const packUserStatus = await UserStatus.findByOrFail({ id: packUser.userStatusId })
    const userId = user && user.id !== undefined ? user.id : null
    return !(
      userId !== pack.userId &&
      (!User.allowedUserStatusToShow.includes(packUserStatus.name) ||
        !Pack.allowedPackStatusToShow.includes(packStatus.name) ||
        !Pack.allowedPackVisibleLevelToShow.includes(packVisibleLevel.name)) &&
      !(await RoleService.userHaveRoleCheck(['extended', 'super'], user))
    )
  }

  async update(user: User, requestedPackItem: PackItem): Promise<AuthorizerResponse> {
    const pack = await this.getPackByPackItemId(requestedPackItem.packReleaseId)
    return user.id === pack.userId
  }

  async destroy(user: User, requestedPackItem: PackItem): Promise<AuthorizerResponse> {
    const pack = await this.getPackByPackItemId(requestedPackItem.packReleaseId)
    return user.id === pack.userId || RoleService.userHaveRoleCheck(['super'], user)
  }

  private async getPackByPackItemId(packItemId: string) {
    const packRelease = await PackRelease.findByOrFail({ id: packItemId })
    return await Pack.findByOrFail({ id: packRelease.packId })
  }
}
