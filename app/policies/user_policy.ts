import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import UserStatus from '#models/user_status'
import User from '#models/user'

export default class UserPolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(user: User | null, requestedUser: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
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
    if (this.isDisableOnDevelop) return true
    return user.id === requestedUser.id
  }

  async destroy(user: User, requestedUser: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return user.id === requestedUser.id || (await RoleService.userHaveRoleCheck(['super'], user))
  }

  private isDisableOnDevelop =
    env.get('POLICY_DISABLE_ON_DEVELOPMENT', false) && env.get('NODE_ENV') === 'development'
}
