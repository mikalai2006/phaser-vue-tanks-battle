import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { langs } from '../lang'
import { GameOptions } from '../options/gameOptions'
import { TextButton } from '../objects/textButton'
import { capitalizeFirstLetter, replaceRegexByArray } from '../utils/utils'
import { IGameData, TLang } from '../types'
import { Button } from '../objects/ui/Button'

export class Control extends Scene {
  constructor() {
    super('Control')
  }

  gameData: IGameData
  lang: TLang

  buttonSetting: Phaser.GameObjects.Container
  bodyContainer: Phaser.GameObjects.Container
  generalContainer: Phaser.GameObjects.Container
  gameOverContainer: Phaser.GameObjects.Container
  gameOverBodyContainer: Phaser.GameObjects.Container
  buttonReturn: Button
  buttonExitFromRound: Button
  textControlTitle: Phaser.GameObjects.Text
  textGameOverTitle: Phaser.GameObjects.Text

  banners: Phaser.GameObjects.DOMElement
  homeButton: Phaser.GameObjects.Container
  homeButtonBg: Phaser.GameObjects.NineSlice
  homeButtonSprite: Phaser.GameObjects.Sprite
  pauseButton: Phaser.GameObjects.Container
  playButton: Phaser.GameObjects.Container
  playButtonText: Phaser.GameObjects.Text
  pauseButtonSprite: Phaser.GameObjects.Sprite
  soundButton: Phaser.GameObjects.Container
  soundButtonBg: Phaser.GameObjects.NineSlice
  soundButtonSprite: Phaser.GameObjects.Sprite
  helpButton: Phaser.GameObjects.Container
  helpButtonBg: Phaser.GameObjects.NineSlice
  helpButtonSprite: Phaser.GameObjects.Sprite
  textPanel: Phaser.GameObjects.Rectangle
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  overlay: Phaser.GameObjects.Rectangle
  btnContainer: Phaser.GameObjects.Container
  btnLangText: Phaser.GameObjects.Text
  btnBg: Phaser.GameObjects.NineSlice

  create() {
    this.click = this.sound.add('click')

    // general container.
    const overlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.9)
      .setInteractive()
    this.textControlTitle = this.add
      .text(0, -450, '#controlTitle', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 70,
        color: GameOptions.ui.accent,
        stroke: '#ffffff',
        // strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0.5)

    this.bodyContainer = this.add.container(0, 200, []).setDepth(1000)
    this.generalContainer = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        overlay,
        this.bodyContainer,
        this.textControlTitle
      ])
      .setVisible(false)
      .setDepth(999999)

    const overlayGameOver = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.9)
      .setInteractive()
    this.textGameOverTitle = this.add
      .text(0, -450, '#gameOverTitle', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 70,
        color: GameOptions.ui.accent,
        stroke: '#ffffff',
        // strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0.5)
    this.gameOverBodyContainer = this.add.container(0, 0, [])
    this.gameOverContainer = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        overlayGameOver,
        this.gameOverBodyContainer,
        this.textGameOverTitle
      ])
      // .setVisible(false)
      .setDepth(999999)

    // button return.
    this.buttonReturn = new Button(
      this,
      0,
      GameOptions.screen.height / 2 - 100,
      200,
      100,
      0x000000,
      '#return',
      {},
      () => {
        this.click.play()
        this.tooglePanel(false)
      }
    )
    this.generalContainer.add(this.buttonReturn)

    // button exit from round.
    this.buttonExitFromRound = new Button(
      this,
      0,
      100,
      400,
      100,
      0x000000,
      '#exitFromRound',
      {},
      () => {
        this.click.play()
        this.exitFromRound()
      }
    )
    this.generalContainer.add(this.buttonExitFromRound)

    // button menu.
    const buttonMenuSprite = this.add
      .sprite(0, 0, 'clipart', 5)
      .setTint(GameOptions.ui.white.replace('#', '0x'))
    const buttonMenuBg = this.add
      .circle(0, 0, 45, 0x000000, 0.2)
      .setInteractive({ useHandCursor: true })
    buttonMenuBg.on('pointerup', (pointer) => {
      this.onOpenMenu(pointer)
    })
    buttonMenuBg
      .on('pointerover', () => {
        buttonMenuSprite.setTint(0xffffff)
      })
      .on('pointerout', () => {
        buttonMenuSprite.setTint(GameOptions.ui.white.replace('#', '0x'))
      })
    this.buttonSetting = this.add
      .container(
        GameOptions.screen.width - GameOptions.marginMarker * 4,
        GameOptions.marginMarker + GameOptions.marginMarker * 3.1,
        [buttonMenuBg, buttonMenuSprite]
      )
      .setDepth(999)

    // button sound.
    const soundButtonBg = this.add
      .circle(0, 0, 45, 0x000000, 0.2)
      .setInteractive({ useHandCursor: true })
    // const soundButtonBg = this.add
    //   .nineslice(0, 0, 'button', 0, 110, 110, 33, 33, 33, 33)
    //   .setTint(GameOptions.ui.buttonBgColor)
    //   .setOrigin(0.5)
    //   .setInteractive({ useHandCursor: true })
    this.soundButtonSprite = this.add
      .sprite(0, 0, 'clipart', 7)
      .setTint(GameOptions.ui.white.replace('#', '0x'))
      .setScale(1)
      .setOrigin(0.5)
    // this.add.existing(this.settingButton)
    this.soundButton = this.add
      .container(this.buttonSetting.x - 100, this.buttonSetting.y, [
        soundButtonBg,
        this.soundButtonSprite
      ])
      .setDepth(100)
    soundButtonBg.on('pointerover', (pointer) => {
      this.soundButtonSprite.setTint(0xffffff)
    })
    soundButtonBg.on('pointerout', (pointer) => {
      this.soundButtonSprite.setTint(GameOptions.ui.white.replace('#', '0x'))
    })
    soundButtonBg.on('pointerup', () => {
      this.click.play()
      this.game.sound.mute = !this.game.sound.mute
      // console.log('tap to toggle mute. sound.mute = ' + this.game.sound.mute)
      this.toggleSoundEffect()
    })

    // events.
    this.events.on('pause', () => {
      this.click.pause()
    })
    this.events.on('resume', () => {
      this.tooglePanel(false)
    })
    // this.toggleSoundEffect()
    // this.onCreateBanner()
    this.tooglePanel(false)
    EventBus.emit('current-scene-ready', this)
  }

  onGameOverPlayer(title: string, description: string, color: string, roundCoin: number) {
    this.gameOverContainer.setVisible(true)
    this.generalContainer.setVisible(false)

    this.gameOverBodyContainer?.removeAll(true)
    this.textGameOverTitle.setText(title)
    this.textGameOverTitle.setColor(color)
    const textBody = this.add
      .text(0, -300, description, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 50,
        color: color,
        stroke: '#ffffff',
        wordWrap: {
          width: 1000
        },
        align: 'center'
      })
      .setOrigin(0.5)

    const textReward = this.add
      .text(
        0,
        -20,
        this.lang ? replaceRegexByArray(this.lang?.roundReward, [roundCoin.toString()]) : '',
        {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 45,
          color: GameOptions.ui.white,
          stroke: '#ffffff',
          wordWrap: {
            width: 600
          },
          align: 'center'
        }
      )
      .setOrigin(0.5)
    const imageCoin = this.add.image(-150, 100, 'clipart', 3).setScale(1.5)
    const textCoin = this.add
      .text(-100, 60, roundCoin.toString(), {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 80,
        color: GameOptions.ui.accent,
        stroke: '#ffffff',
        wordWrap: {
          width: 600
        },
        align: 'left'
      })
      .setOrigin(0)
    const buttonReward = new Button(
      this,
      GameOptions.isAdv ? 300 : 0,
      300,
      350,
      200,
      GameOptions.ui.buttonBgColor,
      this.lang?.getReward,
      {
        fontSize: 40,
        wordWrap: {
          width: 200
        }
      },
      () => {
        this.gameData.coin += roundCoin
        this.game.scene.getScene('Home').stopGame()
        this.tooglePanel(false)
        EventBus.emit('save-data', this.gameData)
      }
    )
    if (GameOptions.isAdv) {
      const buttonGetReward = new Button(
        this,
        -200,
        300,
        500,
        200,
        GameOptions.ui.buttonBgColor,
        this.lang?.getReward2,
        {
          fontSize: 35,
          wordWrap: { width: 400 }
        },
        () => {
          window?.showRewardedAdv(() => {
            this.gameData.coin += roundCoin * 2
            this.tooglePanel(false)
            EventBus.emit('save-data', this.gameData)
            this.game.scene.getScene('Home').stopGame()
          })
        }
      )
      this.gameOverBodyContainer.add(buttonGetReward)
    }

    this.gameOverBodyContainer.add([textBody, textCoin, imageCoin, textReward, buttonReward])
  }

  toggleSoundEffect() {
    // sound
    if (!this.game.sound.mute) {
      // this.soundButtonSprite.setTint(0x000000)
      this.soundButtonSprite.setFrame(6)
      // if (!this.textPause) {
      //   this.createText('Pause')
      // }
    } else {
      // this.soundButtonSprite.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      this.soundButtonSprite.setFrame(7)
      // if (this.textPause) {
      //   this.disablePanel()
      // }
    }
  }

  exitFromRound() {
    this.tooglePanel(false)
    this.game.scene.getScene('Home').stopGame()
  }

  tooglePanel(status: boolean) {
    this.generalContainer?.setVisible(status)
    this.gameOverContainer.setVisible(status)
    // this.textControlTitle?.setVisible(status)
    // this.textPanel?.setVisible(status)
    // this.playButton?.setVisible(status)
  }

  onShowLangList(pointer: any) {
    // // this.tooglePanel(true)
    // this.textPanel?.setVisible(true)
    // this.pauseButton.setDepth(0)
    // this.soundButton.setDepth(0)
    // this.helpButton?.setDepth(0)
    // const sceneGame = this.game.scene.getScene('Game')
    // this.click.play()
    // if (sceneGame && (sceneGame.scene.isActive() || sceneGame.scene.isPaused())) {
    //   sceneGame?.scene.pause()
    // }
    // EventBus.emit('toggle-lang-list')
    EventBus.emit('toggle-lang')
  }

  onHideLangList() {
    this.pauseButton.setDepth(100)
    this.soundButton.setDepth(100)
    this.helpButton.setDepth(100)
    this.tooglePanel(false)
    // this.pauseButton.setVisible
    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    sceneGame?.scene.resume()
  }

  onOpenMenu(pointer: Phaser.Input.Pointer) {
    this.click.play()
    this.tooglePanel(true)
    this.gameOverContainer.setVisible(false)
  }

  onSetGameData(data: IGameData) {
    this.gameData = JSON.parse(JSON.stringify(data))
    this.btnLangText?.setText(capitalizeFirstLetter(langs[this.gameData.lang.toString()].codeName))
  }

  setLocale(lang: TLang) {
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    if (!this.lang) return

    this.textControlTitle.setText(this.lang.controlTitle || '#controlTitle')
    this.buttonExitFromRound.setText(this.lang.exitFromRound || '#exitFromRound')
    this.buttonReturn.setText(this.lang.return || '#return')
    this.textGameOverTitle.setText(this.lang.gameOverTitle || '#gameOverTitle')
    // this.playButtonText.setText(this.lang.btn_continue || '#btn_continue')
    // this.btnLangText.setText(capitalizeFirstLetter(langs[this.gameData.lang.toString()].codeName))
  }

  onCreateBanner() {
    var style = {
      'background-color': '#11111115',
      width: '300px',
      height: '250px'
    }
    var banners = document.getElementById('banner')
    this.banners = this.add.dom(150, 170, banners, style, '')
    this.banners.setVisible(false)
  }
}
