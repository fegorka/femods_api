import { FactoryBuilderQueryContract } from '@adonisjs/lucid/types/factory'

interface PredefinedDataFields {
  [key: string]: string[]
}
export default class SeederService {
  static async mergePredefinedData(
    factory: FactoryBuilderQueryContract<any, any>,
    predefinedDataFields: PredefinedDataFields
  ): Promise<void> {
    Object.entries(predefinedDataFields).map(([field, data]) => {
      data.map((value) => {
        factory.merge({ [field]: value }).create()
      })
    })
  }
}

// Helps fill fields using factories + merge
// Coded for fill with prod names packVisibleLevel & etc, but it dosent have factories,
// so it was replaced by createMany({ key: value }), but may be useful where factories are not empty, idk

//    await SeederService.mergePredefinedData(PackModCoreFactory, {
//      name: ['fabric', 'quilt', 'forge', 'neoforge'],
//    })

//export const PackModCoreFactory = factory
//  .define(PackModCore, async () => {
//    return {
//      // empty
//    }
//  })
//  .build()
