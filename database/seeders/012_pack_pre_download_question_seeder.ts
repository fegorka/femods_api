import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { PackPreDownloadQuestionFactory } from '#database/factories/pack_pre_download_question_factory'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    await PackPreDownloadQuestionFactory.createMany(10)
  }
}
