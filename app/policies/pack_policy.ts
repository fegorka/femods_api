import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import PackStatus from '#models/pack_status'
import Pack from '#models/pack'
import PackVisibleLevel from '#models/pack_visible_level'

export default class PackPolicy extends BasePolicy {
  @allowGuest()
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['default'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedPack: Pack): Promise<AuthorizerResponse> {
    const allowedPackStatuses: string[] = ['default']
    const allowedPackVisibleLevels: string[] = ['public']
    const requestedPackStatus = await PackStatus.findByOrFail({ id: requestedPack.packStatusId })
    const requestedPackVisibleLevel = await PackVisibleLevel.findByOrFail({
      id: requestedPack.packVisibleLevelId,
    })
    const userId = user && user.id !== undefined ? user.id : null
    return !(
      userId !== requestedPack.userId &&
      (!allowedPackStatuses.includes(requestedPackStatus.name) ||
        !allowedPackVisibleLevels.includes(requestedPackVisibleLevel.name)) &&
      !(await RoleService.userHaveRoleCheck(['extended', 'super'], user))
    )
  }

  async update(user: User, requestedPack: Pack): Promise<AuthorizerResponse> {
    return user.id === requestedPack.userId
  }

  async destroy(user: User, requestedPack: Pack): Promise<AuthorizerResponse> {
    return user.id === requestedPack.userId || RoleService.userHaveRoleCheck(['super'], user)
  }
}
