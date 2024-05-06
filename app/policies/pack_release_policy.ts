import User from '#models/user'
import PackRelease from '#models/pack_release'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import Pack from '#models/pack'
import PackStatus from '#models/pack_status'
import PackVisibleLevel from '#models/pack_visible_level'

export default class PackReleasePolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['default'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedPackRelease: PackRelease): Promise<AuthorizerResponse> {
    const allowedPackStatuses: string[] = ['default']
    const allowedPackVisibleLevels: string[] = ['public']
    const pack = await Pack.findByOrFail({ id: requestedPackRelease.packId })
    const packStatus = await PackStatus.findByOrFail({ id: pack.packStatusId })
    const packVisibleLevel = await PackVisibleLevel.findByOrFail({
      id: pack.packVisibleLevelId,
    })
    const userId = user && user.id !== undefined ? user.id : null
    return !(
      userId !== pack.userId &&
      (!allowedPackStatuses.includes(packStatus.name) ||
        !allowedPackVisibleLevels.includes(packVisibleLevel.name)) &&
      !(await RoleService.userHaveRoleCheck(['extended', 'super'], user))
    )
  }

  async update(user: User, requestedPackRelease: PackRelease): Promise<AuthorizerResponse> {
    const pack = await Pack.findByOrFail({ id: requestedPackRelease.packId })
    return user.id === pack.userId
  }

  async destroy(user: User, requestedPackRelease: PackRelease): Promise<AuthorizerResponse> {
    const pack = await Pack.findByOrFail({ id: requestedPackRelease.packId })
    return user.id === pack.userId || RoleService.userHaveRoleCheck(['super'], user)
  }
}
