import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { TLang } from '@/App.vue'

export class Message extends Scene {
  constructor() {
    super('Message')
  }

  lang: TLang
  messageBox: Phaser.GameObjects.Container
  messageBoxText: Phaser.GameObjects.Text
  messageCancelText: Phaser.GameObjects.Text
  messageOkText: Phaser.GameObjects.Text
  messageNextText: Phaser.GameObjects.Text
  messageBoxButtonNext: Phaser.GameObjects.Container
  messageBoxButtonOk: Phaser.GameObjects.Container
  messageBoxButtonOkBg: Phaser.GameObjects.NineSlice
  messageBoxButtonCancel: Phaser.GameObjects.Container
  bomb: Phaser.GameObjects.Particles.ParticleEmitter

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  addbonus: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.click = this.sound.add('click')
    this.addbonus = this.sound.add('addbonus', { loop: false })

    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.8)
      .setInteractive()
    const messageBoxBg = this.add
      .nineslice(0, 0, 'panel', 0, 800, 700, 33, 33, 33, 33)
      .setTint(GameOptions.ui.panelBgColor)
    this.messageBoxText = this.add
      .text(0, -200, 'Message asda sasd asd asd asd asd asd asd sdsd sdf sdf ', {
        fontFamily: 'Arial',
        fontSize: 40,
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 500
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)

    this.messageBoxButtonOkBg = this.add
      .nineslice(0, 0, 'panel', 0, 300, 150, 33, 33, 33, 33)
      .setOrigin(0.5)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.messageBoxButtonOkBg.setTint(0xffffff)
      })
      .on('pointerout', () => {
        this.messageBoxButtonOkBg.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      })
    this.messageOkText = this.add
      .text(0, 0, 'Ok', {
        fontFamily: 'Arial',
        fontSize: 50,
        color: GameOptions.ui.panelBgColor,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'right'
      })
      .setOrigin(0.5)
    this.messageBoxButtonOk = this.add.container(170, 200, [
      this.messageBoxButtonOkBg,
      this.messageOkText
    ])

    // button next.
    const messageBoxButtonNext = this.add
      .nineslice(0, 0, 'panel', 0, 300, 150, 33, 33, 33, 33)
      .setOrigin(0.5)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setInteractive({ useHandCursor: true })
    this.messageNextText = this.add
      .text(0, 0, 'Ok', {
        fontFamily: 'Arial',
        fontSize: 50,
        color: GameOptions.ui.panelBgColor,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'right'
      })
      .setOrigin(0.5)
    this.messageBoxButtonNext = this.add.container(0, 200, [
      messageBoxButtonNext,
      this.messageNextText
    ])
    messageBoxButtonNext
      .on('pointerup', () => {
        this.click.play()
        this.messageBox.setVisible(false)
        const sceneGame = this.game.scene.getScene('Game')
        sceneGame?.scene.resume()
      })
      .on('pointerover', () => {
        messageBoxButtonNext.setTint(0xffffff)
      })
      .on('pointerout', () => {
        messageBoxButtonNext.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      })

    const messageCancelBg = this.add
      .nineslice(0, 0, 'panel', 0, 300, 150, 33, 33, 33, 33)
      .setOrigin(0.5)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setInteractive({ useHandCursor: true })
    this.messageCancelText = this.add
      .text(0, 0, 'Cancel', {
        fontFamily: 'Arial',
        fontSize: 50,
        color: GameOptions.ui.panelBgColor,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'right'
      })
      .setOrigin(0.5)
    this.messageBoxButtonCancel = this.add.container(-170, 200, [
      messageCancelBg,
      this.messageCancelText
    ])
    messageCancelBg
      .on('pointerup', () => {
        this.click.play()
        this.messageBox.setVisible(false)
        const sceneGame = this.game.scene.getScene('Game')
        sceneGame?.scene.resume()
      })
      .on('pointerover', () => {
        messageCancelBg.setTint(0xffffff)
      })
      .on('pointerout', () => {
        messageCancelBg.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      })

    // create bomb.
    this.bomb = this.add
      .particles(0, -300, 'flares', {
        frame: 'white',
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404], // 0x0070ff, 0x0006ff, 0x7c00ff, 0xffb300
        colorEase: 'quad.out',
        lifespan: 2400,
        angle: { min: -100, max: -80 },
        scale: { start: 0.7, end: 0, ease: 'sine.out' },
        speed: { min: 100, max: 200 },
        advance: 2000,
        blendMode: 'ADD'
      })
      .setDepth(99999)
      .setVisible(false)

    this.messageBox = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        messageOverlay,
        messageBoxBg,
        this.messageBoxText,
        this.messageBoxButtonOk,
        this.messageBoxButtonCancel,
        this.messageBoxButtonNext,
        this.bomb
      ])
      .setDepth(88000)
      .setVisible(false)

    EventBus.emit('current-scene-ready', this)
  }

  showMessageAddBonusBomb(text: string) {
    this.addbonus.play()
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.scene?.pause()
    this.messageBox.setVisible(true)
    this.messageBoxText.setText(text)
    this.messageBoxButtonCancel.setVisible(false)
    this.messageBoxButtonOk.setVisible(false)
    this.messageBoxButtonNext.setVisible(true)
    this.bomb.setVisible(true)
    this.messageBoxButtonNext.once('pointerup', () => {
      this.click.play()
      this.messageBox.setVisible(false)
      sceneGame.scene?.resume()
    })
  }

  showMessageCreateBomb() {
    this.click.play()
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.scene?.pause()
    this.messageBox.setVisible(true)
    // this.messageBoxText.setText('Create bomb by view adv?')
    this.messageBoxButtonNext.setVisible(false)
    this.messageBoxButtonCancel.setVisible(true)
    this.messageBoxButtonOk.setVisible(true)
    this.bomb.setVisible(false)
    this.messageBoxText.setText(this.lang.create_bomb_help || '#create_bomb_help')
    this.messageBoxButtonOkBg.once('pointerup', () => {
      this.click.play()
      this.messageBox.setVisible(false)
      // sceneGame?.scene.resume()
      this.onCreateBombByAdv()
    })
  }

  onCreateBombByAdv() {
    const sceneGame = this.game.scene.getScene('Game')
    if (window.showRewardedAdv) {
      EventBus.emit('show-reward-adv', () => {
        // console.log('SHOW show-reward-adv')
        sceneGame.scene.resume()
        this.scene.get('Game').onCreateBomb(true)
      })
    } else {
      sceneGame.scene.resume()
      this.scene.get('Game').onCreateBomb(true)
    }
  }

  changeLocale(lang: TLang) {
    this.lang = lang
    this.messageOkText.setText(lang.ok || '#ok')
    this.messageCancelText.setText(lang.cancel || '#cancel')
    this.messageBoxText.setText(lang.create_bomb_help || '#create_bomb_help')
    this.messageNextText.setText(lang.next || '#next')
  }
}
