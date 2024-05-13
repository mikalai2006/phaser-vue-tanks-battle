import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { langs } from '../lang'
import { GameOptions } from '../options/gameOptions'
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
  buttonExitFromRound: Phaser.GameObjects.Container
  textControlTitle: Phaser.GameObjects.Text
  textGameOverTitle: Phaser.GameObjects.Text

  banners: Phaser.GameObjects.DOMElement
  buttonSound: Phaser.GameObjects.Container
  soundButtonBg: Phaser.GameObjects.NineSlice
  soundButtonSprite: Phaser.GameObjects.Sprite
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  overlay: Phaser.GameObjects.Rectangle
  btnLangText: Phaser.GameObjects.Text

  isOpenHelp: boolean

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    this.click = this.sound.add('click')

    // general container.
    this.overlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.95)
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
        this.overlay,
        this.bodyContainer,
        this.textControlTitle
      ])
      .setVisible(false)
      .setDepth(999999)

    const overlayGameOver = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.9)
      .setInteractive()
    this.textGameOverTitle = this.add
      .text(
        -GameOptions.screen.width / 2 + 50,
        -GameOptions.screen.height / 2 + 30,
        '#gameOverTitle',
        {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 50,
          color: GameOptions.ui.accent,
          stroke: '#ffffff',
          // strokeThickness: 0,
          align: 'center'
        }
      )
      .setOrigin(0)
    this.gameOverBodyContainer = this.add.container(0, 0, [])
    this.gameOverContainer = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        overlayGameOver,
        this.gameOverBodyContainer,
        this.textGameOverTitle
      ])
      // .setVisible(false)
      .setDepth(999999)

    // button exit from round.
    const buttonExitSprite = this.add
      .sprite(0, 0, 'clipart', 8)
      .setTint(GameOptions.ui.white.replace('#', '0x'))
    const buttonExitBg = this.add
      .circle(0, 0, 45, 0x000000, 0.2)
      .setInteractive({ useHandCursor: true })
    buttonExitBg.on('pointerup', (pointer) => {
      this.click.play()
      this.exitFromRound()
    })
    this.buttonExitFromRound = this.add
      .container(
        GameOptions.screen.width - GameOptions.marginMarker * 4,
        GameOptions.marginMarker + GameOptions.marginMarker * 3.1,
        [buttonExitBg, buttonExitSprite]
      )
      .setDepth(999)
    // = new Button(
    //   this,
    //   -GameOptions.screen.width / 2 + 300,
    //   GameOptions.screen.height / 2 - 100,
    //   500,
    //   150,
    //   0x000000,
    //   '#exitFromRound',
    //   {
    //     fontSize: 40
    //   },
    //   () => {
    //     this.click.play()
    //     this.exitFromRound()
    //   }
    // )
    // this.generalContainer.add(this.buttonExitFromRound)

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
    this.buttonSound = this.add
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

    this.onSync(gameData, lang)
  }

  onGameOverPlayer(title: string, description: string, color: string, roundCoin: number) {
    this.gameOverContainer.setVisible(true)
    this.overlay.setAlpha(0.2)
    this.generalContainer.setVisible(false)

    this.gameOverBodyContainer?.removeAll(true)
    this.textGameOverTitle.setText(title)
    this.textGameOverTitle.setColor(color)
    const bg = this.add
      .rectangle(
        -GameOptions.screen.width / 2,
        -GameOptions.screen.height / 2,
        GameOptions.screen.width,
        500,
        GameOptions.ui.panelBgColor,
        0.7
      )
      .setOrigin(0)
    const textBody = this.add
      .text(-GameOptions.screen.width / 2 + 50, -GameOptions.screen.height / 2 + 90, description, {
        fontFamily: 'Arial',
        // fontStyle: 'bold',
        fontSize: 40,
        color: GameOptions.ui.white,
        stroke: '#ffffff',
        wordWrap: {
          width: GameOptions.screen.width
        },
        align: 'left'
      })
      .setOrigin(0)

    const textReward = this.add
      .text(
        -GameOptions.screen.width / 2 + 50,
        -GameOptions.screen.height / 2 + 280,
        this.lang ? replaceRegexByArray(this.lang?.roundReward, [roundCoin.toString()]) : '',
        {
          fontFamily: 'Arial',
          // fontStyle: 'bold',
          fontSize: 40,
          color: GameOptions.ui.white,
          stroke: '#ffffff',
          wordWrap: {
            width: 1400
          },
          align: 'left'
        }
      )
      .setOrigin(0)
    const imageCoin = this.add
      .image(-GameOptions.screen.width / 2 + 100, -150, 'clipart', 3)
      .setScale(1.5)
    const textCoin = this.add
      .text(-GameOptions.screen.width / 2 + 150, -190, roundCoin.toString(), {
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
      GameOptions.screen.width / 2 - 200,
      -150,
      350,
      200,
      GameOptions.ui.accentNumber,
      this.lang?.getReward,
      {
        fontSize: 40,
        wordWrap: {
          width: 200
        }
      },
      () => {
        this.gameData.coin += roundCoin
        this.gameData.tanks[this.gameData.activeTankIndex].cb += 1
        this.game.scene.getScene('Home').stopGame()
        this.tooglePanel(false)
        EventBus.emit('save-data', this.gameData)
      }
    )

    this.gameOverBodyContainer.add([bg, textBody, textCoin, imageCoin, textReward, buttonReward])

    if (GameOptions.isAdv) {
      const buttonGetReward = new Button(
        this,
        340,
        -150,
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
            this.gameData.tanks[this.gameData.activeTankIndex].cb += 1
            this.game.scene.getScene('Home').stopGame()
            this.tooglePanel(false)
            EventBus.emit('save-data', this.gameData)
          })
        }
      )

      const imageAd = this.add
        .image(buttonGetReward.x - 210, buttonGetReward.y - 80, 'clipart', 4)
        .setTint(GameOptions.ui.accentNumber)
      this.gameOverBodyContainer.add([buttonGetReward, imageAd])
    }
  }

  createSettings() {
    this.overlay.setAlpha(0.9)
    this.bodyContainer?.removeAll(true)
    // settings.
    const options = []

    for (const settingKey in this.gameData.settings) {
      var toggleSwitch = this.add
        .rexToggleSwitch(0, 0, 100, 100, GameOptions.ui.accentNumber, {
          trackRadius: 0.1,
          thumbRadius: 0.1,
          thumbColor: GameOptions.ui.buttonBgColor,
          falseValueTrackColor: GameOptions.ui.panelBgColorLight,
          value: this.gameData.settings[settingKey]
        })
        .on('valuechange', (value) => {
          this.gameData.settings[settingKey] = value
          EventBus.emit('save-data', this.gameData)
        })
      const text = this.add
        .text(65, 0, this.lang.settings[settingKey], {
          fontFamily: 'Arial',
          fontSize: 25,
          color: GameOptions.ui.white,
          stroke: '#ffffff',
          // strokeThickness: 0,
          wordWrap: { width: 1000 },
          align: 'left'
        })
        .setOrigin(0, 0.5)
      const container = this.add.container(0, 0, [text, toggleSwitch])
      options.push(container)
    }

    const gridOptions = Phaser.Actions.GridAlign(options, {
      width: 1,
      height: 10,
      cellWidth: 600,
      cellHeight: 80,
      x: -200,
      y: -350
    })
    const containerGridOptions = this.add.container(-300, -200, gridOptions)

    const bg = this.add
      .rectangle(
        -600,
        -GameOptions.screen.height / 2 - 200,
        1200,
        GameOptions.screen.height,
        GameOptions.ui.panelBgColor,
        0.8
      )
      .setOrigin(0)

    this.bodyContainer.add([bg, containerGridOptions, this.createButtonReturn()])
  }

  createButtonReturn() {
    return new Button(
      this,
      0,
      GameOptions.screen.height / 2 - 300,
      300,
      150,
      0x000000,
      this.lang.return || '#return',
      {
        fontSize: 40
      },
      () => {
        this.click.play()
        this.tooglePanel(false)
      }
    )
  }

  toggleSoundEffect() {
    // sound
    if (!this.game.sound.mute) {
      this.scene
        .get('Message')
        .showToast(replaceRegexByArray(this.lang.sound, [this.lang.off]), 0x000000)
      // this.soundButtonSprite.setTint(0x000000)
      this.soundButtonSprite.setFrame(6)
      // if (!this.textPause) {
      //   this.createText('Pause')
      // }
    } else {
      this.scene
        .get('Message')
        .showToast(replaceRegexByArray(this.lang.sound, [this.lang.on]), 0x000000)
      // this.soundButtonSprite.setTint(GameOptions.ui.primaryColor.replace('#', '0x'))
      this.soundButtonSprite.setFrame(7)
      // if (this.textPause) {
      //   this.disablePanel()
      // }
    }
  }

  exitFromRound() {
    this.scene.bringToTop('Message')
    this.scene
      .get('Message')
      .showMessage(this.lang?.exitFromBattleTitle, this.lang?.exitFromBattleDescription, () => {
        this.game.scene.getScene('Home').stopGame()
        this.tooglePanel(false)
        this.scene.sendToBack('Message')
      })
  }

  tooglePanel(status: boolean) {
    this.generalContainer?.setVisible(status)
    this.gameOverContainer.setVisible(status)

    this.buttonExitFromRound.setVisible(!!this.scene.get('Game'))
    this.buttonSetting.setVisible(!this.scene.get('Game'))
    // this.textControlTitle?.setVisible(status)
  }

  showHelp(key: string, duration: number) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isOpenHelp && !this.gameData.help[key]) {
          this.buttonExitFromRound.setVisible(false)
          this.buttonSound.setVisible(false)
          this.isOpenHelp = true
          console.log(key)
          // this.click.play()

          this.scene.pause('Game')

          const bg = this.add.rectangle(
            0,
            0,
            GameOptions.screen.width,
            GameOptions.screen.height,
            0x000000,
            0.3
          )

          const graphics = this.add
            .graphics({
              lineStyle: {
                color: 0xffffff,
                alpha: 0.2,
                width: 3
              },
              fillStyle: {
                color: GameOptions.ui.panelBgColorLight
              }
            })
            .setAlpha(1)
            .setDepth(1)
            .setAngle(-90)
          const counter = this.add
            .text(0, 0, '100', {
              fontFamily: 'Arial',
              fontStyle: 'bold',
              fontSize: 80,
              align: 'center'
            })
            .setOrigin(0.5)
          const containerCounter = this.add.container(
            GameOptions.screen.width / 2 - 200,
            -GameOptions.screen.height / 2 + 150,
            [counter, graphics]
          )

          const button = new Button(
            this,
            GameOptions.screen.width / 2 - 200,
            -GameOptions.screen.height / 2 + 300,
            250,
            120,
            GameOptions.ui.accentNumber,
            'Ok',
            {
              fontSize: 35,
              fontStyle: 'bold',
              strokeThickness: 4,
              stroke: '#000000'
            },
            () => {
              this.scene.resume('Game')
              container.destroy()

              this.isOpenHelp = false
              this.gameData.help[key] = true
              EventBus.emit('save-data', this.gameData)

              this.buttonExitFromRound.setVisible(true)
              this.buttonSound.setVisible(true)
              EventBus.emit('save-data', this.gameData)

              resolve('complete')
            }
          ).setVisible(false)

          const bgPanel = this.add
            .rectangle(-50, -50, GameOptions.screen.width, 400, 0x000000, 0.8)
            .setOrigin(0)
          const title = this.add
            .text(0, -10, this.lang.help[key].title, {
              fontFamily: 'Arial',
              fontStyle: 'bold',
              fontSize: 60,
              color: GameOptions.ui.accent,
              align: 'left',
              wordWrap: {
                width: GameOptions.screen.width - 400
              }
            })
            .setOrigin(0)
          const description = this.add
            .text(0, 70, this.lang.help[key].text, {
              fontFamily: 'Arial',
              fontStyle: 'bold',
              fontSize: 28,
              align: 'left',
              lineSpacing: 6,
              wordWrap: {
                width: GameOptions.screen.width - 400
              }
            })
            .setOrigin(0)
          const containerText = this.add.container(
            -GameOptions.screen.width / 2 + 50,
            -GameOptions.screen.height / 2 + 50,
            [bgPanel, title, description]
          )
          const container = this.add.container(
            GameOptions.screen.width / 2,
            GameOptions.screen.height / 2,
            [bg, containerText, containerCounter, button]
          )

          this.tweens.addCounter({
            from: 0,
            to: 360,
            duration,
            onUpdate: (tween) => {
              const v = tween.getValue()
              counter.setText((Math.round((duration - tween.totalElapsed) / 1000) + 1).toString())
              graphics.clear()

              graphics.beginPath()
              graphics.lineStyle(10, GameOptions.ui.panelBgColorLight)
              graphics.arc(0, 0, 100, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(v), true, 0.02)
              graphics.strokePath()
              graphics.closePath()
            },
            onComplete: () => {
              containerCounter.setVisible(false)
              button.setVisible(true)
            }
          })
        } else {
          resolve('exist')
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  onShowLangList(pointer: any) {
    // // this.tooglePanel(true)
    // this.soundButton.setDepth(0)
    // const sceneGame = this.game.scene.getScene('Game')
    // this.click.play()
    // if (sceneGame && (sceneGame.scene.isActive() || sceneGame.scene.isPaused())) {
    //   sceneGame?.scene.pause()
    // }
    // EventBus.emit('toggle-lang-list')
    EventBus.emit('toggle-lang')
  }

  onHideLangList() {
    this.buttonSound.setDepth(100)
    this.tooglePanel(false)
    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    sceneGame?.scene.resume()
  }

  onOpenMenu(pointer: Phaser.Input.Pointer) {
    this.click.play()
    this.tooglePanel(true)
    this.gameOverContainer.setVisible(false)
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.gameData = JSON.parse(JSON.stringify(gameData))
    this.lang = lang

    this.input.enabled = !!this.gameData.name

    this.btnLangText?.setText(capitalizeFirstLetter(langs[this.gameData.lang.toString()].codeName))

    this.createSettings()

    this.changeLocale()
  }

  changeLocale() {
    if (!this.lang) return

    this.textControlTitle.setText(this.lang.controlTitle || '#controlTitle')
    this.textGameOverTitle.setText(this.lang.gameOverTitle || '#gameOverTitle')
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
