import Role from '#models/role'

export default class RoleService {
  static async userRoleCheck(roleName: string, userId: string): Promise<boolean> {
    // неизвестно подходит ли find для поиска в пивот таблице, он будет выполнять,
    // но просто может ВСЕГДА ПУСТОЙ массив возвращать
    // из-за неправильного КОНФИГА ПОИСКА И ПИВОТ ТАБЛИЦЫ

    const userRoles = await Role.findManyBy({ userId: userId })
    return userRoles.some((role) => role.name === roleName)
  }
}
