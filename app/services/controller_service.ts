import type { Authenticators } from '@adonisjs/auth/types'
import type { Request } from '@adonisjs/core/http'
import env from '#start/env'
import { MemoryStoreService } from '#services/memory_store_service'

import { Authenticator } from '@adonisjs/auth'
import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import HelperService from "#services/helper_service";

export default class ControllerService {
  /**
   * @description Used when both guests and authorized users can access to controller
   * @description ⚠️ Requires disabling middleware.auth in routes
   */
  static async authenticateOrSkipForGuest(auth: Authenticator<Authenticators>, request: Request) {
    if (request.header('Authorization') !== undefined) await auth.authenticate()
  }

  /**
   * @arg query Model.query()
   * @arg sort Сolumn & prefix '>' for descending
   * @description Applies sorting to query
   */
  static applySorting(query: ModelQueryBuilderContract<any>, sort: string | undefined) {
    console.log('0')
    console.log({ sort_name: sort })
    if (!sort) return query

    const direction = sort.startsWith('>') ? 'desc' : 'asc'
    const column = sort.replace(/^[><]/, '')

    console.log('1')
    console.log({ column_name: column })

    return query.orderBy(column, direction)
  }

  /**
   * @arg query Model.query()
   * @arg search Search token/s to filter by
   * @arg callback Callback to apply conditions for each token
   * @arg whereWrapper Wrap each token in separate where group
   * @description Applies multiple search tokens to query using provided callback and grouping logic
   */
  static applySearchTokens<Model extends LucidModel>(
    query: ModelQueryBuilderContract<Model>,
    search: string[] | string,
    callback: (
      qb: ModelQueryBuilderContract<Model>,
      tokens: string
    ) => ModelQueryBuilderContract<Model>,
    whereWrapper: boolean = true
  ): ModelQueryBuilderContract<Model> {
    const searchTokens = HelperService.singleValueToArray(search)
    if (searchTokens.length === 0) return query
    if (!whereWrapper) return searchTokens.reduce((acc, token) => callback(acc, token), query)
    return searchTokens.reduce((acc, token) => acc.where((group) => callback(group, token)), query)
  }

  /**
   * @arg includes Model.query()
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

  /**
   * @arg request Request
   * @arg ttlSeconds Cache lifetime in seconds
   * @arg callback Will be executed if cache is missing
   * @description Return cached response or exec callback & caches its result
   */
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
