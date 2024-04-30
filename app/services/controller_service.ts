import { Authenticator } from '@adonisjs/auth'
import type { Authenticators } from '@adonisjs/auth/types'
import type { Request } from '@adonisjs/core/http'
export default class ControllerService {
  /**
   * @description Used when both guests and authorized users can access to controller
   * @description ⚠️ Requires disabling middleware.auth in routes
   */
  static async authenticateOrSkipForGuest(auth: Authenticator<Authenticators>, request: Request) {
    if (request.header('Authorization') !== undefined) await auth.authenticate()
  }
}
