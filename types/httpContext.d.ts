import '@adonisjs/core/http'
import type { TransformerConfig } from '#services/transformer_service'

interface AppMeta {
  transformer?: TransformerConfig
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    appMeta?: AppMeta
  }
}
