import type { Request } from '@adonisjs/http-server'
import { MemoryStoreService } from '#services/memory_store_service'
import env from '#start/env'

export class ResponseCacheService {
  private static generateKey(request: Request): string {
    const baseUrl = request.url().split('?')[0]
    const qs = request.qs()
    const sortedQs = Object.keys(qs)
      .sort()
      .map((k) => `${k}=${qs[k]}`)
      .join('&')
    const url = sortedQs ? `${baseUrl}?${sortedQs}` : baseUrl

    return `${request.method()}:${url}`
  }

  static async getOrSet<T>(
    request: Request,
    ttlSeconds: number,
    callback: () => Promise<T>
  ): Promise<T> {
    if (env.get('REQUEST_CACHE_DISABLE', false)) return await callback()

    const key = this.generateKey(request)

    if (await MemoryStoreService.has(key)) {
      const cached = await MemoryStoreService.get(key)
      return cached as T
    }

    const result = await callback()

    await MemoryStoreService.set(key, result, ttlSeconds)
    return result
  }
}
