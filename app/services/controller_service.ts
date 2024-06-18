import type { Authenticators } from '@adonisjs/auth/types'
import type { Request } from '@adonisjs/core/http'

import { Authenticator } from '@adonisjs/auth'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class ControllerService {
  /**
   * @description Used when both guests and authorized users can access to controller
   * @description ⚠️ Requires disabling middleware.auth in routes
   */
  static async authenticateOrSkipForGuest(auth: Authenticator<Authenticators>, request: Request) {
    if (request.header('Authorization') !== undefined) await auth.authenticate()
  }

  /**
   * @arg includes Model relation names
   * @arg queryToModify Model.query()
   * @description Used to add data of related models to query
   */
  static includeRelations(
    queryToModify: ModelQueryBuilderContract<any>,
    includes?: string[] | string
  ) {
    if (!includes) return queryToModify

    const relationsToInclude: string[] = Array.isArray(includes) ? includes : [includes]
    let query = queryToModify

    for (const relation of relationsToInclude) {
      console.log('relation = ' + relation)
      query = query.preload(relation)
    }

    return query
  }
}
