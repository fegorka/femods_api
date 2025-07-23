import { ModelQueryBuilderContract, LucidModel } from '@adonisjs/lucid/types/model'
import { Request } from '@adonisjs/core/http'
import ControllerService from '#services/controller_service'

export class QueryPipelineService<Model extends LucidModel> {
  private query: ModelQueryBuilderContract<Model>

  constructor(initialQuery: ModelQueryBuilderContract<Model>) {
    this.query = initialQuery
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
