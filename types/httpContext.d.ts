import '@adonisjs/core/http'
import type { TransformerConfig } from '#services/query_pipeline_service'

interface AppMeta {
  transformer?: TransformerConfig
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    appMeta?: AppMeta
  }
}
