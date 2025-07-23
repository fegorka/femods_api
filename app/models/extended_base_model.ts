import { BaseModel } from '@adonisjs/lucid/orm'

export class ExtendedBaseModel extends BaseModel {
  static sortableFields: string[] = []

  static getSortableFields(): string[] {
    return this.sortableFields || []
  }

  static getColumnNames(): string[] {
    return Object.keys(this.$columnsDefinitions)
  }
}
