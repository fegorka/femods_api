import { ExtendedBaseModel } from '#models/extended_base_model'

export class ModelService {
  static getSortableFields(model: typeof ExtendedBaseModel): string[] {
    if (model.sortableFields.length > 0) {
      return model.sortableFields
    }

    const columns = Object.keys(model.$columnsDefinitions)
    return columns.filter((col) => !col.includes('.'))
  }
}
