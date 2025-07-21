import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import PackItemType from '#models/pack_item_type'

export default class PackItemTypePolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  @allowGuest()
  async show(_user: User, _packItemType: PackItemType): Promise<AuthorizerResponse> {
    return true
  }

  async update(user: User, _packItemType: PackItemType): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _packItemType: PackItemType): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
