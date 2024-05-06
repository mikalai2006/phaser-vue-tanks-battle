import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'

export class Lang extends Scene {
  constructor() {
    super('Lang')
  }

  overlay: Phaser.GameObjects.Rectangle
  btnContainer: Phaser.GameObjects.Container
  btnSprite: Phaser.GameObjects.Sprite
  btnBg: Phaser.GameObjects.NineSlice
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.overlay = this.add
      .rectangle(
        GameOptions.screen.width / 2,
        GameOptions.screen.height / 2,
        GameOptions.screen.width,
        GameOptions.screen.height,
        0x000000,
        0.9
      )
      .setVisible(false)
      .setDepth(99999)
      .setInteractive()
    this.btnBg = this.add
      .nineslice(0, 0, 'button', 0, 100, 90, 33, 33, 33, 33)
      .setTint(0x777777)
      .setAlpha(0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.btnSprite = this.add.sprite(0, 0, 'lang').setScale(0.2).setOrigin(0.5)
    this.btnBg.on('pointerup', (pointer) => this.onShowLangList(pointer))

    this.btnContainer = this.add.container(810, 65, [this.btnBg, this.btnSprite]).setInteractive()
    this.click = this.sound.add('click')
    this.events.on('pause', () => {
      this.click.pause()
      this.click.pause()
    })

    EventBus.emit('current-scene-ready', this)
  }

  onShowLangList(pointer: any) {
    this.overlay.setVisible(true)
    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    if (sceneGame && (sceneGame.scene.isActive() || sceneGame.scene.isPaused())) {
      sceneGame?.scene.pause()
    }
    EventBus.emit('toggle-lang-list')

    // this.tweens.addCounter({
    //   from: 100,
    //   to: 0,
    //   duration: 300,
    //   onUpdate: (tween) => {
    //     this.text.setFontSize(tween.getValue())
    //   },
    //   onComplete: () => {
    //     this.panel.setVisible(false)
    //   }
    // })
    // sceneGame?.scene.resume()
    // this.scene.get('Game').onNewLevel()
  }

  onHideLangList() {
    this.overlay.setVisible(false)
    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    sceneGame?.scene.resume()
  }

  changeLocale(lang) {
    // console.log('Lang scene: ', lang)
  }
}
