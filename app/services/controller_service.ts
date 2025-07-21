import type { Authenticators } from '@adonisjs/auth/types'
import type { Request } from '@adonisjs/core/http'
import env from '#start/env'
import { MemoryStoreService } from '#services/memory_store_service'

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

  static async getOrSetCache<T>(
    request: Request,
    ttlSeconds: number,
    callback: () => Promise<T>
  ): Promise<T> {
    if (env.get('RESPONSE_CACHE_DISABLE', false)) return await callback()

    const key = this.generateCacheKey(request)

    if (await MemoryStoreService.has(key)) {
      const cached = await MemoryStoreService.get(key)
      return cached as T
    }

    const result = await callback()

    await MemoryStoreService.set(key, result, ttlSeconds)
    return result
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

    for (const relation of relationsToInclude) query = query.preload(relation)
    return query
  }

  private static generateCacheKey(request: Request): string {
    const baseUrl = request.url().split('?')[0]
    const qs = request.qs()
    const sortedQs = Object.keys(qs)
      .sort()
      .map((k) => `${k}=${qs[k]}`)
      .join('&')
    const url = sortedQs ? `${baseUrl}?${sortedQs}` : baseUrl

    return `${request.method()}:${url}`
  }
}
