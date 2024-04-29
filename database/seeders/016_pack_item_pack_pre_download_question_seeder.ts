import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PackItem from '#models/pack_item'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import { randomInt } from 'node:crypto'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    const packItems = await PackItem.all()
    const packPreDownloadQuestions = await PackPreDownloadQuestion.all()

    for (const packItem of packItems) {
      if (
        (await PackItem.query()
          .where('id', packItem.id)
          .andHas('packPreDownloadQuestions')
          .first()) !== null
      )
        return
      await packItem
        .related('packPreDownloadQuestions')
        .attach([packPreDownloadQuestions[randomInt(packPreDownloadQuestions.length - 1)].id])
    }
  }
}
