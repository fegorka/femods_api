import redis from '@adonisjs/redis/services/main'

export class MemoryStoreService {
  static async has(...keys: string[]) {
    return redis.exists(keys)
  }

  static async get(key: string) {
    const value = await redis.get(key)
    return value && JSON.parse(value)
  }

  static async set(key: string, value: any, unsetAfterSec?: number) {
    if (!unsetAfterSec) return redis.set(key, JSON.stringify(value))
    return redis.set(key, JSON.stringify(value), 'EX', unsetAfterSec)
  }

  static async unset(...keys: string[]) {
    return redis.del(keys)
  }

  static async flush() {
    return redis.flushdb()
  }
}

//const memoryStore = new MemoryStoreService()
//export default memoryStore
