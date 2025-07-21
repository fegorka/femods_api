import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import Role from '#models/role'

export default class RolePolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async show(user: User, role: Role): Promise<AuthorizerResponse> {
    return user.id === role.id || RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async update(user: User, _role: Role): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _role: Role): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
