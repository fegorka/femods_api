import { ModelQueryBuilderContract, LucidModel } from '@adonisjs/lucid/types/model'
import { ExtractModelRelations } from '@adonisjs/lucid/types/relations'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Request } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'

export type NestedResource<M extends LucidModel> = {
  parent: InstanceType<typeof BaseModel>
  parentRelation: ExtractModelRelations<InstanceType<M>>
  parentPrimaryKey: string
  parentId: string | number
}

export interface TransformerConfig<M extends LucidModel> {
  where?: { [key: string]: string }
  nestedResource?: NestedResource<M>
}

export class QueryPipelineService<Model extends LucidModel> {
  private query: ModelQueryBuilderContract<Model>

  constructor(initialQuery: ModelQueryBuilderContract<Model>, config?: TransformerConfig<Model>) {
    this.query = initialQuery

    if (config?.nestedResource) {
      const { parentRelation, parentPrimaryKey, parentId } = config.nestedResource
      this.query = this.query.whereHas(parentRelation, (builder) => {
        builder.where(parentPrimaryKey, parentId)
      })
    }
  }

  transform(
    transformer: (q: ModelQueryBuilderContract<Model>) => ModelQueryBuilderContract<Model>
  ): this {
    this.query = transformer(this.query)
    return this
  }

  getQuery(): ModelQueryBuilderContract<Model> {
    return this.query
  }

  async executeWithCache(
    request: Request,
    ttlSeconds: number,
    executor: (q: ModelQueryBuilderContract<Model>) => Promise<any>
  ): Promise<any> {
    return ControllerService.getOrSetCache(request, ttlSeconds, async () => {
      return executor(this.query)
    })
  }
}
