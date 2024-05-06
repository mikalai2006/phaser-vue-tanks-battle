import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { TLang } from '@/App.vue'

const helpSprite = ['help_general', 'help_move', 'help_floor', 'help_rotate_zoom', 'help_bomb']

export class Help extends Scene {
  constructor() {
    super('Help')
  }

  lang: TLang
  messageBox: Phaser.GameObjects.Container
  messageBoxTitle: Phaser.GameObjects.Text
  messageBoxText: Phaser.GameObjects.Text
  messageBoxButtonPrev: Phaser.GameObjects.Image
  messageBoxButtonNext: Phaser.GameObjects.Image
  messageOkText: Phaser.GameObjects.Text
  messageBoxButtonOk: Phaser.GameObjects.Container
  messageBoxButtonOkBg: Phaser.GameObjects.NineSlice
  bomb: Phaser.GameObjects.Particles.ParticleEmitter
  helpAnimation: Phaser.Animations.Animation
  helpAnimationSprite: Phaser.GameObjects.Sprite
  activeHelp: number

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  addbonus: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.click = this.sound.add('click')

    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.8)
      .setInteractive()
    const messageBoxBg = this.add
      .nineslice(0, 0, 'panel', 0, 800, 1000, 33, 33, 33, 33)
      .setTint(GameOptions.ui.panelBgColor)
    this.messageBoxTitle = this.add
      .text(0, -80, 'Message Title', {
        fontFamily: 'Arial',
        fontSize: 40,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 700
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)
    this.messageBoxText = this.add
      .text(0, -10, 'Message asda sasd asd asd asd asd asd asd sdsd sdf sdf ', {
        fontFamily: 'Arial',
        fontSize: 30,
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 500
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)

    this.messageBoxButtonNext = this.add
      .image(-150, 380, 'next')
      .setOrigin(0.5)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        this.onRunHelp(this.activeHelp + 1)
      })
      .on('pointerover', () => {
        this.messageBoxButtonNext.setTint(0xffffff)
      })
      .on('pointerout', () => {
        this.messageBoxButtonNext.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      })
    this.messageBoxButtonPrev = this.add
      .image(-300, 380, 'next')
      .setRotation(Math.PI)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        this.onRunHelp(this.activeHelp - 1)
      })
      .on('pointerover', () => {
        this.messageBoxButtonPrev.setTint(0xffffff)
      })
      .on('pointerout', () => {
        this.messageBoxButtonPrev.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      })

    this.messageBoxButtonOkBg = this.add
      .nineslice(0, 0, 'panel', 0, 300, 150, 33, 33, 33, 33)
      .setOrigin(0.5)
      .setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        this.onStopHelp()
      })
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
        strokeThickness: 1,
        align: 'right'
      })
      .setOrigin(0.5)
    this.messageBoxButtonOk = this.add.container(150, 380, [
      this.messageBoxButtonOkBg,
      this.messageOkText
    ])

    this.messageBox = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        messageOverlay,
        messageBoxBg,
        this.messageBoxText,
        this.messageBoxTitle,
        this.messageBoxButtonOk,
        this.messageBoxButtonNext,
        this.messageBoxButtonPrev
      ])
      .setDepth(88000)
      .setVisible(false)

    EventBus.emit('current-scene-ready', this)
  }

  onStartHelp() {
    this.onRunHelp(0)

    this.onToogle(true)
  }

  onStopHelp() {
    this.scene.resume('Game')
    this.onToogle(false)
    this.helpAnimationSprite?.destroy()
    this.anims.get('run')?.destroy()
  }

  onRunHelp(index: number) {
    this.messageBoxButtonNext.setVisible(true)
    this.messageBoxButtonPrev.setVisible(true)
    this.activeHelp = index
    if (this.activeHelp <= 0) {
      this.activeHelp = 0
      this.messageBoxButtonPrev.setVisible(false)
    } else if (this.activeHelp >= helpSprite.length - 1) {
      this.activeHelp = helpSprite.length - 1
      this.messageBoxButtonNext.setVisible(false)
    }
    this.helpAnimationSprite?.destroy()
    this.anims.get('run')?.destroy()

    this.messageBoxTitle.setText(this.lang?.help[helpSprite[index]].title)
    this.messageBoxText.setText(this.lang?.help[helpSprite[index]].text)

    this.anims.create({
      key: 'run',
      frames: helpSprite[index],
      frameRate: 10,
      repeat: -1
    })
    this.helpAnimationSprite = this.add
      .sprite(GameOptions.screen.width / 2, 250, helpSprite[index])
      .setScale(1)
      .setDepth(999999)
      .play('run')
  }

  onToogle(status) {
    this.messageBox.setVisible(status)
    const sceneGame = this.game.scene.getScene('Game')
    if (!status) {
      sceneGame.scene.resume()
    }
  }

  changeLocale(lang: TLang) {
    this.lang = lang
    this.messageOkText.setText(lang.close || '#close')
  }
}
