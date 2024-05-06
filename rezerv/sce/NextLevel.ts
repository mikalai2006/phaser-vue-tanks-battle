import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { SpriteButton } from '../objects/spriteButton'
import { TLang } from '@/App.vue'

export class NextLevel extends Scene {
  constructor() {
    super('NextLevel')
  }

  banners: Phaser.GameObjects.DOMElement
  panel: Phaser.GameObjects.Container
  bg: Phaser.GameObjects.Rectangle
  nextButton: Phaser.GameObjects.Sprite
  text: Phaser.GameObjects.Text
  logoTween: Phaser.Tweens.Tween
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  level_complete:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.WebAudioSound

  create() {
    this.level_complete = this.sound.add('level_complete')
    this.events.on('pause', () => {
      this.level_complete.pause()
      this.level_complete.pause()
    })

    // this.cameras.main.setBackgroundColor(0x000000)
    this.bg = this.add
      .rectangle(
        GameOptions.screen.width / 2,
        GameOptions.screen.height / 2,
        GameOptions.screen.width,
        GameOptions.screen.height,
        0x000000,
        0.9
      )
      .setInteractive()

    this.text = this.add
      .text(GameOptions.screen.width / 2, 300, 'Level completed', {
        fontFamily: 'Arial Black',
        fontSize: 100,
        fontStyle: 'bold',
        color: '#ADFF2F',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: {
          width: 500
        }
      })
      .setOrigin(0.5)
      .setDepth(100)

    this.nextButton = new SpriteButton(this, GameOptions.screen.width / 2, 500, 'play')
      .setScale(0.7)
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setFrame(1)
      .setInteractive()
      .setVisible(false)
    this.nextButton.on('pointerup', (pointer) => this.onClickNext(pointer))

    this.panel = this.add.container(0, 0, [this.bg, this.text, this.nextButton]).setVisible(false)
    this.click = this.sound.add('click')
    this.events.on('pause', () => {
      this.click.pause()
      this.click.pause()
    })

    // this.logoTween = this.tweens.add({
    //   targets: this.text,
    //   //   x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
    //   y: { value: 80, duration: 500, ease: 'Sine.easeOut' },
    //   yoyo: true,
    //   repeat: 0,
    //   onUpdate: () => {
    //     // vueCallback({
    //     //     x: Math.floor(this.logo.x),
    //     //     y: Math.floor(this.logo.y)
    //     // });
    //   },
    //   onComplete: () => {
    //     this.logoTween.stop()
    //   }
    // })
    // this.onCreateBanner()

    EventBus.emit('current-scene-ready', this)
  }

  // onCreateBanner() {
  //   var style = {
  //     'background-color': '#222222',
  //     width: '300px',
  //     height: '250px'
  //   }
  //   var banners = document.getElementById('banner')
  //   this.banners = this.add.dom(150, 200, banners, style, 'adv')
  //   this.banners.setVisible(false)
  // }

  show() {
    this.panel.setVisible(true)
    this.nextButton.setVisible(false)
    this.level_complete.play()

    // if (window.onShowBanner) {
    //   window.onShowBanner('banner', 300, 250)
    //   this.banners?.setVisible(true)
    // }
    // this.logoTween = this.tweens.addCounter({
    //   from: 10,
    //   to: 100,
    //   duration: 300,
    //   onUpdate: (tween) => {
    //     this.text.setFontSize(tween.getValue())
    //   },
    //   onComplete: () => {
    //     // setTimeout(() => {
    //     // EventBus.emit('show-fullscreen-adv', () => {
    //     //   console.log('SHOW show-fullscreen-adv')
    //     //   this.nextButton.setVisible(true)
    //     // })
    //     this.showButtonNext()
    //     // this.nextButton.setVisible(true)
    //     // }, 1000)
    //   }
    // })
    // setTimeout(() => {
    this.showButtonNext()
    // }, 2000)
  }

  showButtonNext() {
    this.nextButton.setVisible(true)
  }

  onClickNext(pointer: any) {
    this.click.play()
    const sceneGame = this.game.scene.getScene('Game')

    // this.tweens.addCounter({
    //   from: 100,
    //   to: 0,
    //   duration: 300,
    //   onUpdate: (tween) => {
    //     this.text.setFontSize(tween.getValue())
    //   },
    //   onComplete: () => {
    //     this.panel.setVisible(false)
    //     this.banners.setVisible(false)
    //     if (window.onClearBanner) {
    //       window.onClearBanner('banner')
    //     }
    //     EventBus.emit('show-fullscreen-adv', () => {
    //       console.log('SHOW show-fullscreen-adv')
    //       sceneGame?.scene.resume()
    //       this.scene.get('Game').onNewLevel()
    //     })
    //   }
    // })

    this.panel.setVisible(false)
    // this.banners?.setVisible(false)
    // if (window.onClearBanner) {
    //   window.onClearBanner('banner')
    // }
    EventBus.emit('show-fullscreen-adv', () => {
      // console.log('SHOW show-fullscreen-adv')
      sceneGame?.scene.resume()
      this.scene.get('Game').onNewLevel()
    })
  }

  changeLocale(lang: TLang) {
    this.text.setText(lang.level_completed || '#level_completed')
  }
}
