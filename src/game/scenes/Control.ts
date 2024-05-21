import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { langs } from '../lang'
import { GameOptions, SpriteKeys } from '../options/gameOptions'
import { capitalizeFirstLetter, replaceRegexByArray } from '../utils/utils'
import { IGameData, IPlayerData, KeySound, TLang } from '../types'
import { Button } from '../objects/ui/Button'
import Input from '../components/Input'

export class Control extends Scene {
  constructor() {
    super('Control')
  }

  gameData: IGameData
  playerData: IPlayerData
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

  overlay: Phaser.GameObjects.Rectangle
  btnLangText: Phaser.GameObjects.Text

  isOpenHelp: boolean

  create({
    lang,
    gameData,
    playerData
  }: {
    lang: TLang
    gameData: IGameData
    playerData: IPlayerData
  }) {
    // general container.
    this.overlay = this.add
      .rectangle(
        0,
        0,
        GameOptions.screen.width,
        GameOptions.screen.height,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
        0.95
      )
      .setInteractive()
    this.textControlTitle = this.add
      .text(0, -500, '#controlTitle', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 70,
        color: GameOptions.colors.accent,
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
      .setDepth(9999999)

    const overlayGameOver = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.5)
      .setInteractive()
    this.textGameOverTitle = this.add
      .text(
        -GameOptions.screen.width / 2 + 50,
        -GameOptions.screen.height / 2 + 30,
        '#gameOverTitle',
        {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 60,
          color: GameOptions.colors.accent,
          // stroke: '#ffffff',
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
      .setDepth(99999999)

    // button exit from round.
    const buttonExitSprite = this.add
      .sprite(0, 0, SpriteKeys.Clipart, 8)
      .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color)
    const buttonExitBg = this.add
      .circle(0, 0, 45, 0x000000, 0.2)
      .setInteractive({ useHandCursor: true })
    buttonExitBg.on('pointerup', (pointer) => {
      this.sound.play(KeySound.Click)
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
    //     this.sound.play(KeySound.Click)
    //     this.exitFromRound()
    //   }
    // )
    // this.generalContainer.add(this.buttonExitFromRound)

    // button menu.
    const buttonMenuSprite = this.add
      .sprite(0, 0, SpriteKeys.Clipart, 5)
      .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color)
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
        buttonMenuSprite.setTint(
          Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
        )
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
    this.soundButtonSprite = this.add
      .sprite(0, 0, SpriteKeys.Clipart, 7)
      .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color)
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
      this.soundButtonSprite.setTint(
        Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
      )
    })
    soundButtonBg.on('pointerup', () => {
      this.sound.play(KeySound.Click)
      this.game.sound.mute = !this.game.sound.mute
      // console.log('tap to toggle mute. sound.mute = ' + this.game.sound.mute)
      this.toggleSoundEffect()
    })

    // this.toggleSoundEffect()
    // this.onCreateBanner()
    this.tooglePanel(false)
    EventBus.emit('current-scene-ready', this)

    this.onSyncPlayerData(playerData)
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
        400,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
        1
      )
      .setOrigin(0)
    const textBody = this.add
      .text(-GameOptions.screen.width / 2 + 50, -GameOptions.screen.height / 2 + 100, description, {
        fontFamily: 'Arial',
        // fontStyle: 'bold',
        fontSize: 40,
        color: GameOptions.colors.lightColor,
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
        -GameOptions.screen.height / 2 + 225,
        this.lang ? replaceRegexByArray(this.lang?.roundReward, [roundCoin.toString()]) : '',
        {
          fontFamily: 'Arial',
          // fontStyle: 'bold',
          fontSize: 40,
          color: GameOptions.colors.lightColor,
          stroke: '#ffffff',
          wordWrap: {
            width: 1400
          },
          align: 'left'
        }
      )
      .setOrigin(0)
    const imageCoin = this.add
      .image(-GameOptions.screen.width / 2 + 100, -290, SpriteKeys.Clipart, 3)
      .setScale(1.5)
    const textCoin = this.add
      .text(-GameOptions.screen.width / 2 + 150, -330, roundCoin.toString(), {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 80,
        color: GameOptions.colors.accent,
        stroke: '#ffffff',
        wordWrap: {
          width: 600
        },
        align: 'left'
      })
      .setOrigin(0)
    this.gameOverBodyContainer.add([bg, textBody, textCoin, imageCoin])

    // const tempMatrix = new Phaser.GameObjects.Components.TransformMatrix()
    // const tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix()
    // imageCoin.getWorldTransformMatrix(tempMatrix, tempParentMatrix)

    // const d = tempMatrix.decomposeMatrix()
    const fromX =
      this.gameOverBodyContainer.x + this.gameOverBodyContainer.parentContainer.x + imageCoin.x
    const fromY =
      this.gameOverBodyContainer.y + this.gameOverBodyContainer.parentContainer.y + imageCoin.y

    const sceneHome = this.scene.get('Home')
    const toMoveCoinX = sceneHome.walletContainer.x || 0
    const toMoveCoinY = sceneHome.walletContainer.y || 0

    const buttonReward = new Button(
      this,
      GameOptions.screen.width / 2 - 220,
      -330,
      300,
      150,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color,
      this.lang?.getReward,
      {
        fontSize: 40,
        wordWrap: {
          width: 200
        }
      },
      () => {
        // this.gameData.coin += roundCoin
        // this.gameData.score += roundCoin
        // EventBus.emit('save-data', this.gameData)

        this.scene.pause()

        window?.showFullSrcAdv(() => {
          this.scene.resume()
          this.moveCoinToWallet(
            new Phaser.Math.Vector2(fromX, fromY),
            new Phaser.Math.Vector2(toMoveCoinX, toMoveCoinY),
            1000,
            () => {
              this.gameData.coin += roundCoin
              EventBus.emit('save-data', this.gameData)

              this.scene.get('Message')?.showNewRank()
            }
          )
          this.game.scene.getScene('Home').stopGame()
          this.tooglePanel(false)
        })
      }
    )

    this.gameOverBodyContainer.add([textReward, buttonReward])

    if (GameOptions.isDoubleRewardAdv) {
      const buttonGetReward = new Button(
        this,
        buttonReward.x - 440,
        buttonReward.y,
        500,
        150,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
        this.lang?.getReward2,
        {
          fontSize: 35,
          wordWrap: { width: 400 }
        },
        () => {
          window?.showRewardedAdv({
            successC: () => {
              this.scene.resume()
              this.moveCoinToWallet(
                new Phaser.Math.Vector2(fromX, fromY),
                new Phaser.Math.Vector2(toMoveCoinX, toMoveCoinY),
                1000,
                () => {
                  this.gameData.coin += roundCoin * 2
                  EventBus.emit('save-data', this.gameData)

                  this.scene.get('Message')?.showNewRank()
                }
              )
              this.game.scene.getScene('Home').stopGame()
              this.tooglePanel(false)
            },
            errorC: () => {
              this.scene.resume()
              this.scene.get('Message')?.showNewRank()
              this.game.scene.getScene('Home').stopGame()
              this.tooglePanel(false)
            }
          })
          this.scene.pause()
        }
      )

      const imageAd = this.add
        .image(buttonGetReward.x - 220, buttonGetReward.y - 50, SpriteKeys.Clipart, 4)
        .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color)
      this.gameOverBodyContainer.add([buttonGetReward, imageAd])
    }
  }

  moveCoinToWallet(
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
    duration: number,
    callback: () => void
  ) {
    // console.log('move to ', from, to)
    //   const vec = new Phaser.Math.Vector2(tank.x, tank.y)
    //   const azimut = Phaser.Math.FloatBetween(-Math.PI, Math.PI)
    //   vec.setToPolar(azimut, 100)
    //   const x2 = tank.x + vec.x
    //   const y2 = tank.y + vec.y

    const xVals = [from.x, GameOptions.screen.width / 2, to.x]
    const yVals = [from.y, GameOptions.screen.height / 2, to.y]
    const target = this.add.image(from.x, from.y, SpriteKeys.Coin)
    const particles = this.add
      .particles(0, 0, SpriteKeys.Coin, {
        // frame: 3,
        x: 0,
        y: 0,
        // x: { values: xVals, interpolation: 'catmull' },
        // y: { values: yVals, interpolation: 'catmull' },
        // x: xVals[0],
        // y: yVals[0],
        // advance: 300,
        quantity: { random: [1, 5] },
        frequency: 100,
        gravityY: 500,
        speed: { random: [50, 200] },
        lifespan: { random: [400, 2000] },
        scale: { random: true, start: 2, end: 0 },
        // rotate: { random: true, start: 0, end: 180 },
        // angle: { random: true, start: 0, end: 270 },
        blendMode: 'ADD',
        follow: target,
        duration
        // color: [0x555555, 0xffd189, 0x222222],
        // colorEase: 'quad.out',
        // duration: 1000
        // gravityX: 0,
        // gravityY: 0,
        // // // emitting: false,
        // // quantity: 5,
        // // speed: { random: [50, 100] },
        // // lifespan: { random: [200, 400] },
        // // scale: { random: true, start: 0.5, end: 0 },
        // // color: [0x666666, 0xffd189, 0x222222],
        // // colorEase: 'quad.out'
      })
      .setDepth(999)
    // emitter.start()

    this.tweens.addCounter({
      from: 0,
      to: 1,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: duration,
      onUpdate: (tween) => {
        const v = tween.getValue()
        const x = Phaser.Math.Interpolation.CatmullRom(xVals, v)
        const y = Phaser.Math.Interpolation.CatmullRom(yVals, v)

        target.setPosition(x, y)
      },
      onComplete: () => {
        particles.explode(16)
        callback && callback()
        target.destroy()
        this.sound.play(KeySound.AddCoin, {
          volume: 0.5
        })

        this.time.delayedCall(2000, () => {
          //particles.removeEmitter(emitter)
          particles.stop()
          particles.destroy(true)
        })
      }
    })
  }

  createSettings() {
    this.overlay.setAlpha(1)
    this.bodyContainer?.removeAll(true)
    // settings.
    const options = []

    for (const settingKey in this.gameData.settings) {
      var toggleSwitch = this.add
        .rexToggleSwitch(
          0,
          0,
          100,
          100,
          Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color,
          {
            trackRadius: 0.1,
            thumbRadius: 0.1,
            thumbColor: Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
            falseValueTrackColor: Phaser.Display.Color.ValueToColor(
              GameOptions.colors.secondaryColor
            ).color,
            value: this.gameData.settings[settingKey]
          }
        )
        .on('valuechange', (value) => {
          this.gameData.settings[settingKey] = value
          EventBus.emit('save-data', this.gameData)
        })
      const text = this.add
        .text(65, 0, this.lang.settings ? this.lang.settings[settingKey] : '', {
          fontFamily: 'Arial',
          fontSize: 22,
          color: GameOptions.colors.lightColor,
          wordWrap: { width: GameOptions.screen.width / 2 - 200 },
          align: 'left'
        })
        .setOrigin(0, 0.5)
      const container = this.add.container(0, 0, [text, toggleSwitch])
      options.push(container)
    }

    const gridOptions = Phaser.Actions.GridAlign(options, {
      width: 2,
      height: 10,
      cellWidth: GameOptions.screen.width / 2,
      cellHeight: 120,
      x: 100,
      y: -350
    })
    const containerGridOptions = this.add.container(
      -GameOptions.screen.width / 2,
      -200,
      gridOptions
    )

    const bg = this.add
      .rectangle(
        -GameOptions.screen.width / 2,
        -GameOptions.screen.height / 2 - 200,
        GameOptions.screen.width,
        GameOptions.screen.height,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
        0.8
      )
      .setOrigin(0)

    this.bodyContainer.add([
      bg,
      containerGridOptions,
      this.createButtonReturn(),
      this.createButtonsLang()
    ])
  }

  createButtonReturn() {
    return new Button(
      this,
      GameOptions.screen.width / 2 - 300,
      GameOptions.screen.height / 2 - 300,
      300,
      150,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      this.lang.return || '#return',
      {
        fontSize: 40
      },
      () => {
        this.sound.play(KeySound.Click)
        this.tooglePanel(false)
      }
    )
  }

  createButtonsLang() {
    const elems = []
    const cellWidth = 200
    const title = this.add.text(-100, -10, this.lang.langTitle, {
      fontFamily: 'Arial',
      color: GameOptions.colors.lightColor,
      fontSize: 30,
      align: 'left'
    })

    for (const langCode in langs) {
      const lang: TLang = langs[langCode]

      const button = new Button(
        this,
        GameOptions.screen.width / 2 - 300,
        GameOptions.screen.height / 2 - 300,
        cellWidth,
        100,
        this.gameData.lang == lang.code
          ? Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color
          : Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
        lang.name,
        {
          fontSize: 35
        },
        () => {
          this.sound.play(KeySound.Click)
          this.tooglePanel(false)
          EventBus.emit('toggle-lang', lang.code)
        }
      )
      elems.push(button)
    }

    const gridLangs = Phaser.Actions.GridAlign(elems, {
      width: 4,
      height: 1,
      cellWidth: cellWidth + 30,
      cellHeight: 120,
      x: 0,
      y: 90
    })

    const container = this.add.container(-GameOptions.screen.width / 2 + cellWidth, 250, [
      title,
      ...gridLangs
    ])
    return container
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
          const gameScene = this.scene.get('Game')
          if (!gameScene) {
            reject('Not found scene')
          }
          // console.log(gameScene.idPlayer)
          gameScene.isFire = false
          Input.up[gameScene.idPlayer] = 0
          Input.down[gameScene.idPlayer] = 0
          Input.left[gameScene.idPlayer] = 0
          Input.right[gameScene.idPlayer] = 0

          this.buttonExitFromRound.setVisible(false)
          this.buttonSound.setVisible(false)
          this.isOpenHelp = true
          if (gameScene.joystikMove) {
            gameScene.buttonFire.setVisible(false)
            gameScene.joystikMove.setVisible(false)
          }

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
                color: Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
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
            Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color,
            this.lang.well,
            {
              fontSize: 35,
              fontStyle: 'bold',
              color: GameOptions.colors.darkColor,
              stroke: '#000000'
            },
            () => {
              this.scene.resume('Game')
              container.destroy()

              if (gameScene.joystikMove) {
                gameScene.buttonFire.setVisible(true)
                gameScene.joystikMove.setVisible(true)
              }
              // for (const pointer of gameScene.input.manager.pointers) {
              //   pointer.reset()
              // }
              gameScene.input.resetPointers()
              this.input.resetPointers()

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
              color: GameOptions.colors.accent,
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
              fontSize: 32,
              color: GameOptions.colors.lightColor,
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
              graphics.lineStyle(
                10,
                Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
              )
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
    this.sound.play(KeySound.Click)
    sceneGame?.scene.resume()
  }

  onOpenMenu(pointer: Phaser.Input.Pointer) {
    this.sound.play(KeySound.Click)
    this.tooglePanel(true)
    this.gameOverContainer.setVisible(false)
  }

  onSyncPlayerData(playerData: IPlayerData) {
    this.playerData = JSON.parse(JSON.stringify(playerData))
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
