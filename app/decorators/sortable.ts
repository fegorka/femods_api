import { ExtendedBaseModel } from '#models/extended_base_model'

export function sortable() {
  return function (target: any, propertyKey: string) {
    const modelClass = target.constructor as typeof ExtendedBaseModel

    if (!Object.prototype.hasOwnProperty.call(modelClass, 'sortableFields')) {
      const inherited = (modelClass.sortableFields ?? []) as string[]
      modelClass.sortableFields = [...inherited]
    }

    if (!modelClass.sortableFields.includes(propertyKey)) {
      modelClass.sortableFields.push(propertyKey)
    }
  }
}
