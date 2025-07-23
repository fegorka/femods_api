import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import env from '#start/env'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    if (
      env.get('AUTH_VERIFY_DISABLE_ON_DEVELOPMENT', false) &&
      env.get('NODE_ENV') === 'development'
    )
      return await next()
    await ctx.auth.authenticateUsing(options.guards)
    return next()
  }
}
