import { Scene } from 'phaser'
import { EventBus } from '../EventBus'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    // this.load.image('background', 'assets/bg.png');
    this.load.image('brand', 'assets/brand.png')
    // this.load.image('cg_logo', 'assets/cg_logo.png')
  }

  create() {
    let lang = null
    if (window.getLang) {
      lang = window?.getLang()
    }
    EventBus.emit('set-lang', lang)

    this.scene.start('Preloader')
  }
}
