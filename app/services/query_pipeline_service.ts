import type { ModelQueryBuilderContract, LucidModel } from '@adonisjs/lucid/types/model'
import { ExtractModelRelations } from '@adonisjs/lucid/types/relations'
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

export class QueryPipelineService<Model extends LucidModel> {
  private q: ModelQueryBuilderContract<Model>

  constructor(initialQuery: ModelQueryBuilderContract<Model>, config?: TransformerConfig<Model>) {
    this.q = initialQuery

    if (config?.nestedResources)
      this.q = this.applyParentRecursively(this.q, config.nestedResources)
  }

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

  transform(
    transformer: (q: ModelQueryBuilderContract<Model>) => ModelQueryBuilderContract<Model>
  ): this {
    this.q = transformer(this.q)
    return this
  }

  query(): ModelQueryBuilderContract<Model> {
    return this.q
  }

  async executeWithCache(
    request: Request,
    ttlSeconds: number,
    executor: (q: ModelQueryBuilderContract<Model>) => Promise<any>
  ): Promise<any> {
    return ControllerService.getOrSetCache(request, ttlSeconds, async () => {
      return executor(this.q)
    })
  }
}
