import { Scene } from 'phaser'
import { EventBus } from '../EventBus'
import { SpriteKeys } from '../options/gameOptions'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    // this.load.image('background', 'assets/bg.png');
    this.load.image(SpriteKeys.Logo, 'assets/logo.png')
    // this.load.image(SpriteKeys.LogoCG, 'assets/cg_logo.png')
  }

  create() {
    this.onInitSDK()
  }

  async onInitSDK() {
    try {
      // Init SDK.
      if (window && window.initSDK) {
        await window
          .initSDK()
          .then(async () => {
            let lang = window.getLang ? window.getLang() : null

            EventBus.emit('set-lang', lang)

            this.scene.start('Preloader')
          })
          .catch((e) => {
            throw e
          })
      } else {
        EventBus.emit('set-lang', window.defaultLang)
        this.scene.start('Preloader')
      }
    } catch (e) {
      console.error('Error init game: ', e)
    }
  }
}
