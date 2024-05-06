import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { TextButton } from '../objects/textButton'
import { TLang } from '@/App.vue'

export class GameOver extends Scene {
  constructor() {
    super('GameOver')
  }

  banners: Phaser.GameObjects.DOMElement
  bg: Phaser.GameObjects.Rectangle
  panel: Phaser.GameObjects.Container
  panelWrapper: Phaser.GameObjects.Container
  continueButton: Phaser.GameObjects.Container
  nextButton: Phaser.GameObjects.Text
  newButton: Phaser.GameObjects.Text
  titleText: Phaser.GameObjects.Text
  logoTween: Phaser.Tweens.Tween
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  game_over: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.game_over = this.sound.add('game_over')
    this.events.on('pause', () => {
      this.game_over.pause()
      this.game_over.pause()
    })

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

    this.titleText = this.add
      .text(GameOptions.screen.width / 2, 250, 'Game Over', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 0,
        color: GameOptions.ui.dangerText,
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(100)

    // this.nextButton = new SpriteButton(this, GameOptions.screen.width / 2, 500, 'play')
    //   .setScale(0.7)
    //   .setOrigin(0.5, 0)
    //   .setDepth(100)
    //   .setFrame(1)
    //   .setInteractive()
    const btnNew = this.add
      .nineslice(0, 300, 'panel', 0, 500, 250, 33, 33, 33, 33)
      .setTint(GameOptions.ui.buttonBgColor)
      .setAlpha(1)
    const btnNewBgInteractive = this.add
      .nineslice(0, 300, 'panel', 0, 500, 250, 33, 33, 33, 33)
      .setTint(0x7e22ce)
      .setAlpha(0.8)
      // .setDepth(1000)
      .setInteractive({ useHandCursor: true })
    this.newButton = new TextButton(this, 0, 350, 'New game', {
      fontFamily: 'Arial',
      fontSize: 40,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 450, useAdvancedWrap: true }
    })
      .setOrigin(0.5)
      .setDepth(100)
    btnNewBgInteractive.on('pointerover', () => {
      btnNew.setSize(btnNew.width + 5, btnNew.height + 5)
      this.newButton.setFontSize(
        Number(this.newButton.style.fontSize.toString().replace('px', '')) + 2
      )
      // this.newButton.setTint(GameOptions.ui.activeTextNumber)
    })
    btnNewBgInteractive.on('pointerout', () => {
      btnNew.setSize(btnNew.width - 5, btnNew.height - 5)
      this.newButton.setFontSize(
        Number(this.newButton.style.fontSize.toString().replace('px', '')) - 2
      )
      this.newButton.setTint(0xffffff)
    })
    btnNewBgInteractive.on('pointerup', (pointer) => this.onClickNew(pointer))

    const btnBg = this.add
      .nineslice(0, 0, 'panel', 0, 500, 300, 33, 33, 33, 33)
      .setTint(GameOptions.ui.buttonBgColor)
      .setAlpha(1)
    const btnBgInteractive = this.add
      .nineslice(0, 0, 'panel', 0, 500, 300, 33, 33, 33, 33)
      .setTint(0x7e22ce)
      .setAlpha(0.8)
      // .setDepth(10000)
      .setInteractive({ useHandCursor: true })
    const advImg = this.add.image(0, -70, 'adv').setScale(0.4)
    const newImg = this.add.image(0, 270, 'repeat').setScale(0.4)
    this.nextButton = new TextButton(this, 0, 50, 'Continue by view adv', {
      fontFamily: 'Arial',
      fontSize: 40,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 350, useAdvancedWrap: true }
    })
      .setOrigin(0.5)
      .setDepth(100)
    this.continueButton = this.add
      .container(GameOptions.screen.width / 2, 500, [
        btnBg,
        btnBgInteractive,
        this.nextButton,
        btnNew,
        advImg,
        btnNewBgInteractive,
        this.newButton,
        newImg
      ])
      .setDepth(1000)
      .setVisible(false)
    // const shadowFX = btnBg.postFX.addShadow(-5, 5, 0.006, 2, 0x111111, 10, 0.8)
    btnBgInteractive.on('pointerover', () => {
      btnBg.setSize(btnBg.width + 5, btnBg.height + 5)
      this.nextButton.setFontSize(
        Number(this.nextButton.style.fontSize.toString().replace('px', '')) + 2
      )
      // this.nextButton.setTint(GameOptions.ui.activeTextNumber)
    })
    btnBgInteractive.on('pointerout', () => {
      btnBg.setSize(btnBg.width - 5, btnBg.height - 5)
      this.nextButton.setFontSize(
        Number(this.nextButton.style.fontSize.toString().replace('px', '')) - 2
      )
      this.nextButton.setTint(0xffffff)
    })
    btnBgInteractive.on('pointerup', (pointer) => this.onClickContinue(pointer))

    this.panel = this.add.container(0, 0, [this.bg, this.titleText])
    this.click = this.sound.add('click')
    this.events.on('pause', () => {
      this.click.pause()
      // this.click.pause()
    })

    // this.panelWrapper= this.add
    // .container(GameOptions.screen.width / 2, 500, [
    //   btnBg,
    //   this.nextButton,
    //   btnBgInteractive,
    //   btnNew,
    //   this.newButton,
    //   btnNewBgInteractive
    // ])
    // .setDepth(1000)

    this.onCreateBanner()
    this.hide()

    EventBus.emit('current-scene-ready', this)
  }

  onClickNew(pointer: any) {
    this.click.play()

    // this.tweens.addCounter({
    //   from: 100,
    //   to: 0,
    //   duration: 300,
    //   onUpdate: (tween) => {
    //     this.titleText.setFontSize(tween.getValue())
    //   },
    //   onComplete: () => {
    //     // this.panel.setVisible(false)
    //     // this.continueButton.setVisible(false)
    //     // this.newButton.setVisible(false)
    //     this.hide()
    //   }
    // })
    this.hide()
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame?.scene.resume()
    this.scene.get('Game').onNewGame()
  }

  onContinue(status: boolean) {
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame?.scene.resume()
    this.scene.get('Game').onContinueGame()
    // this.panel.setVisible(false)
    // this.continueButton.setVisible(false)
    // this.newButton.setVisible(false)
    this.hide()
  }

  onClickContinue(pointer: any) {
    this.click.play()

    if (window.showRewardedAdv) {
      EventBus.emit('show-reward-adv', (status) => {
        // console.log('SHOW show-reward-adv: Continue')
        this.onContinue(status)
      })
    } else {
      this.onContinue(true)
    }
    // this.tweens.addCounter({
    //   from: 100,
    //   to: 0,
    //   duration: 300,
    //   onUpdate: (tween) => {
    //     this.titleText.setFontSize(tween.getValue())
    //   },
    //   onComplete: () => {
    //     this.panel.setVisible(false)
    //     this.continueButton.setVisible(false)
    //     this.newButton.setVisible(false)
    //   }
    // })
  }

  onCreateBanner() {
    var style = {
      'background-color': '#11111115',
      width: '320px',
      height: '100px'
    }
    var banners = document.getElementById('banner_gameover')
    this.banners = this.add.dom(160, 150, banners, style, '')
    this.banners.setVisible(false)
  }

  show() {
    this.bg.setVisible(true)
    this.panel.setVisible(true)
    this.continueButton.setVisible(true)
    this.newButton.setVisible(true)
    this.game_over.play()

    if (window.onShowBanner) {
      window.onShowBanner('banner_gameover', 320, 100)
    }
    this.banners.setVisible(true)

    this.logoTween = this.tweens.addCounter({
      from: 10,
      to: 100,
      duration: 300,
      onUpdate: (tween) => {
        this.titleText.setFontSize(tween.getValue())
      }
    })
  }

  hide() {
    this.bg.setVisible(false)
    this.panel.setVisible(false)
    this.continueButton.setVisible(false)
    this.newButton.setVisible(false)

    if (window.onClearBanner) {
      window.onClearBanner('banner_gameover')
    }
    this.banners.setVisible(false)
  }

  changeLocale(lang: TLang) {
    this.titleText.setText(lang.gameover_title || '#gameover_title')
    this.newButton.setText(lang.gameover_btn_new_game || '#gameover_btn_new_game')
    this.nextButton.setText(lang.gameover_btn_continue_by_adv || '#gameover_btn_continue_by_adv')
  }
}
