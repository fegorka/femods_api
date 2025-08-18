import type { ModelQueryBuilderContract, LucidModel } from '@adonisjs/lucid/types/model'
import type { ExtractModelRelations } from '@adonisjs/lucid/types/relations'
import cache from '@adonisjs/cache/services/main'
import env from '#start/env'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Request } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'

export type NestedResourceItem<M extends LucidModel> = {
  parent: InstanceType<typeof BaseModel>
  parentRelation: ExtractModelRelations<InstanceType<M>>
  parentPrimaryKey: string
  parentId: string | number
}

export interface TransformerConfig<M extends LucidModel> {
  where?: { [key: string]: string }
  nestedResources?: NestedResourceItem<M>[]
}

export class TransformerService<Model extends LucidModel> {
  constructor(initialQuery: ModelQueryBuilderContract<Model>, config?: TransformerConfig<Model>) {
    this.q = initialQuery
    if (config?.nestedResources)
      this.q = this.applyParentRecursively(this.q, config.nestedResources)
  }

  query(): ModelQueryBuilderContract<Model> {
    return this.q
  }

  transform(
    transformer: (q: ModelQueryBuilderContract<Model>) => ModelQueryBuilderContract<Model>
  ): this {
    this.q = transformer(this.q)
    return this
  }

  static async invalidateCache(options: { namespace?: string; tags?: string[] }) {
    if (options.tags && options.tags.length > 0) return cache.deleteByTag({ tags: options.tags })
    if (options.namespace) return cache.namespace(options.namespace).clear()
  }

  async executeWithCache<T>(
    request: Request,
    executor: (q: ModelQueryBuilderContract<Model>) => Promise<T>,
    options?: {
      ttl?: string
      grace?: string
      timeout?: string
      hardTimeout?: string
      namespace?: string
      tags?: string[]
    }
  ): Promise<T> {
    if (env.get('RESPONSE_CACHE_DISABLE', false)) return executor(this.q)
    const key = ControllerService.generateCacheKey(request)
    const store = options?.namespace ? cache.namespace(options.namespace) : cache
    return store.getOrSet({
      key,
      ttl: options?.ttl ?? '2m',
      grace: options?.grace ?? '3m',
      timeout: options?.timeout ?? '200ms',
      hardTimeout: options?.hardTimeout,
      tags: options?.tags,
      factory: async () => {
        const result = await executor(this.q)
        return typeof (result as any)?.toJSON === 'function' ? (result as any).toJSON() : result
      },
    })
  }

  private q: ModelQueryBuilderContract<Model>

  private applyParentRecursively(
    query: ModelQueryBuilderContract<LucidModel>,
    parents: NestedResourceItem<Model>[],
    index: number = 0
  ): ModelQueryBuilderContract<any> {
    const parent = parents[index]

    return query.whereHas(parent.parentRelation as any, (nested) => {
      nested.where(parent.parentPrimaryKey, parent.parentId)

      if (index + 1 < parents.length) {
        this.applyParentRecursively(nested, parents, index + 1)
      }
    })
  }
}
