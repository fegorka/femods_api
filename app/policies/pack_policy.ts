import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import PackStatus from '#models/pack_status'
import Pack from '#models/pack'
import PackVisibleLevel from '#models/pack_visible_level'
import UserStatus from '#models/user_status'
import env from '#start/env'

export default class PackPolicy extends BasePolicy {
  @allowGuest()
  async index(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['default'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedPack: Pack): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true

    const requestedPackStatus = await PackStatus.findByOrFail({ id: requestedPack.packStatusId })
    const requestedPackVisibleLevel = await PackVisibleLevel.findByOrFail({
      id: requestedPack.packVisibleLevelId,
    })
    const packUser = await User.findByOrFail({ id: requestedPack.userId })
    const packUserStatus = await UserStatus.findByOrFail({ id: packUser.userStatusId })
    const userId = user && user.id !== undefined ? user.id : null
    return !(
      userId !== requestedPack.userId &&
      (!User.allowedUserStatusToShow.includes(packUserStatus.name) ||
        !Pack.allowedPackStatusToShow.includes(requestedPackStatus.name) ||
        !Pack.allowedPackVisibleLevelToShow.includes(requestedPackVisibleLevel.name)) &&
      !(await RoleService.userHaveRoleCheck(['extended', 'super'], user))
    )
  }

  async update(user: User, requestedPack: Pack): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return user.id === requestedPack.userId
  }

  async destroy(user: User, requestedPack: Pack): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return user.id === requestedPack.userId || RoleService.userHaveRoleCheck(['super'], user)
  }

  private isDisableOnDevelop =
    env.get('POLICY_DISABLE_ON_DEVELOPMENT', false) && env.get('NODE_ENV') === 'development'
}
