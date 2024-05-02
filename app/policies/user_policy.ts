import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import UserStatus from '#models/user_status'

export default class UserPolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedUser: User): Promise<AuthorizerResponse> {
    const allowedStatuses: string[] = ['default']
    const requestedUserStatus = await UserStatus.findByOrFail({ id: requestedUser.userStatusId })
    const userId = user && user.id !== undefined ? user.id : null
    return !(
      userId !== requestedUser.id &&
      !allowedStatuses.includes(requestedUserStatus.name) &&
      !(await RoleService.userHaveRoleCheck(['extended', 'super'], user))
    )
  }

  async update(user: User, requestedUser: User): Promise<AuthorizerResponse> {
    return user.id === requestedUser.id
  }

  async destroy(user: User, requestedUser: User): Promise<AuthorizerResponse> {
    return user.id === requestedUser.id || (await RoleService.userHaveRoleCheck(['super'], user))
  }
}
