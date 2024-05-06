import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'

import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { BonusType, GameOptions } from '../options/gameOptions'
import { Button } from '../objects/ui/Button'
import { IComplexConfig, IGameData, TLang } from '../types'
import { getMaxOptionValue } from '../utils/utils'

export class WorkShop extends Scene {
  constructor() {
    super('WorkShop')
  }

  rexUI: RexUIPlugin
  gameData: IGameData

  lang: TLang
  generalContainer: Phaser.GameObjects.Container
  infoContainer: Phaser.GameObjects.Container
  updateContainer: Phaser.GameObjects.Container
  shopContainer: Phaser.GameObjects.Container
  shopPanel: any
  garazPanel: any

  buttonReturn: Button
  buttonBank: Button

  textShopTitle: Phaser.GameObjects.Text
  textRank: Phaser.GameObjects.Text
  textCoinValue: Phaser.GameObjects.Text
  // textUpdateButton: Phaser.GameObjects.Text
  // textScoreValue: Phaser.GameObjects.Text
  textNamePlayer: Phaser.GameObjects.Text
  rankContainer: Phaser.GameObjects.Container

  bg: Phaser.GameObjects.Container
  startButtonBg: Phaser.GameObjects.NineSlice
  startButtonText: Phaser.GameObjects.Text
  startButtonSprite: Phaser.GameObjects.Sprite
  textTitleScene: Phaser.GameObjects.Text

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.click = this.sound.add('click')

    this.generalContainer = this.add.container(0, 0, [])

    const bgTankContainer = this.add
      .rectangle(0, 0, GameOptions.workshop.sideWidth, GameOptions.screen.height, 0x000000, 0.7)
      .setOrigin(0)
    this.infoContainer = this.add.container(
      GameOptions.screen.width - GameOptions.workshop.sideWidth,
      0,
      [bgTankContainer]
    )

    this.updateContainer = this.add.container(
      GameOptions.screen.width -
        GameOptions.workshop.sideWidth -
        GameOptions.workshop.updateSideWidth,
      0,
      []
    )
    this.shopContainer = this.add.container(
      0,

      0,
      []
    )

    const bg = this.add
      .image(GameOptions.screen.width / 2, GameOptions.screen.height / 2, 'bg')
      .setScale(1.1)
      .setDepth(-100)

    const bgOverlay = this.add.rectangle(
      GameOptions.screen.width / 2,
      GameOptions.screen.height / 2,
      GameOptions.screen.width,
      GameOptions.screen.height,
      GameOptions.ui.panelBgColor,
      0.7
    )
    this.bg = this.add.container(0, 0, [bg, bgOverlay])
    this.generalContainer.add(this.bg)

    const bgUpdateContainer = this.add
      .rectangle(
        GameOptions.screen.width -
          GameOptions.workshop.sideWidth -
          GameOptions.workshop.updateSideWidth,
        0,
        GameOptions.workshop.updateSideWidth,
        GameOptions.screen.height,
        GameOptions.ui.panelBgColor,
        1
      )
      .setOrigin(0)
    this.generalContainer.add(bgUpdateContainer)
    this.textTitleScene = this.add
      .text(
        GameOptions.screen.width -
          GameOptions.workshop.sideWidth -
          GameOptions.workshop.updateSideWidth / 2 -
          150,
        50,
        '#workShopTitle',
        {
          fontFamily: 'Arial',
          fontSize: 50,
          fontStyle: 'bold',
          color: GameOptions.ui.accent, //GameOptions.ui.accent,
          align: 'center',
          lineSpacing: -25
        }
      )
      .setDepth(1000)
      .setOrigin(0.5)
    this.generalContainer.add(this.textTitleScene)
    this.textShopTitle = this.add
      .text(GameOptions.workshop.updateSideWidth / 2, 50, '#shopTitle', {
        fontFamily: 'Arial',
        fontSize: 50,
        fontStyle: 'bold',
        color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
        align: 'center',
        lineSpacing: -25
      })
      .setDepth(1000)
      .setOrigin(0.5)
    this.generalContainer.add(this.textShopTitle)

    // start game button.
    // this.startButtonBg = this.add
    //   .nineslice(0, 0, 'button', 0, 250, 150, 50, 50, 50, 50)
    //   // .setTint(0xffffff)
    //   .setAlpha(1)
    //   .setOrigin(0.5)
    //   .setInteractive({ useHandCursor: true })
    // this.startButtonText = this.add
    //   .text(0, 50, '#startGame', {
    //     fontFamily: 'Arial',
    //     fontStyle: 'bold',
    //     fontSize: 50,
    //     color: '#ffff00',
    //     // stroke: '#000000',
    //     // strokeThickness: 2,
    //     align: 'center'
    //   })
    //   .setDepth(1000)
    //   .setOrigin(0.5)

    // this.startButtonBg.on('pointerup', (pointer) => this.startGame(pointer))
    // this.startButtonBg.on('pointerover', (pointer) => {
    //   this.startButtonBg.setAlpha(0.8)
    // })
    // this.startButtonBg.on('pointerout', (pointer) => {
    //   this.startButtonBg.setAlpha(1)
    // })

    // const buttonGaraz = new Button(this, -100, 350, 300, 120, 0x333333, '', {}, (pointer) =>
    //   this.startGame(pointer)
    // )

    // events.
    this.events.on('pause', () => {
      this.click.pause()
    })
    this.events.on('resume', () => {
      this.tooglePanel(false)
    })

    this.tooglePanel(false)

    EventBus.emit('current-scene-ready', this)
  }

  drawPlayerInfo() {
    this.infoContainer.removeAll(true)
    // this.rankContainer?.destroy()

    this.buttonReturn = new Button(
      this,
      GameOptions.workshop.sideWidth / 2,
      GameOptions.screen.height - 100,
      300,
      120,
      GameOptions.ui.panelBgColor,
      this.lang?.return || '#return',
      {},
      (pointer) => {
        this.tooglePanel(false)

        this.game.scene.getScene('Home')?.tooglePanel(true)
      }
    )
    this.infoContainer.add(this.buttonReturn)

    const coinImage = this.add.image(0, 0, 'coin')
    this.textCoinValue = this.add.text(35, -18, this.gameData.coin.toString(), {
      fontFamily: 'Arial',
      fontSize: 35,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'left'
    })
    const walletContainer = this.add.container(140, 115, [coinImage, this.textCoinValue])
    if (GameOptions.isBank) {
      this.buttonBank = new Button(
        this,
        350,
        -15,
        200,
        100,
        GameOptions.ui.primaryColor,
        this.lang?.bank || '#bank',
        {},
        (pointer) => {
          this.scene.get('Home').openBank()
        }
      )
      walletContainer.add(this.buttonBank)
    }

    // score and rank
    const rank = this.add
      .image(-GameOptions.workshop.sideWidth / 2 + 60, 0, 'rank', this.gameData.rank)
      .setTint(GameOptions.ui.accent.replace('#', '0x'))
      .setScale(2)
    // this.textScoreValue = this.add
    //   .text(-GameOptions.workshop.sideWidth / 2 + 120, 10, '', {
    //     fontFamily: 'Arial',
    //     fontStyle: 'bold',
    //     fontSize: 40,
    //     color: '#ffffff',
    //     stroke: '#000000',
    //     strokeThickness: 0,
    //     align: 'center'
    //   })
    //   .setOrigin(0)
    //   .setDepth(100)
    this.textNamePlayer = this.add
      .text(-GameOptions.workshop.sideWidth / 2 + 120, -55, 'Mikalai Parakhnevich', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 35,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
      .setDepth(100)
    this.textRank = this.add
      .text(-GameOptions.workshop.sideWidth / 2 + 120, -12, this.lang?.rank[this.gameData?.rank], {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#999999',
        align: 'left'
      })
      .setAlpha(0.8)
      .setOrigin(0)
      .setDepth(100)

    const rankContainer = this.add.container(GameOptions.workshop.sideWidth / 2, 80, [
      rank,
      // this.textScoreValue,
      this.textRank,
      this.textNamePlayer
    ])

    this.infoContainer.add([walletContainer, rankContainer]) //.setInteractive()
  }

  drawWorkShopContainer() {
    this.updateContainer.removeAll(true)
    const optionsForGrid = []
    const tankData = this.gameData.tanks[this.gameData.activeTankIndex]
    const excludeOptions = GameOptions.excludeFromStretchOptions
    const options = Object.keys(this.gameData.tanks[this.gameData.activeTankIndex]).filter(
      (x) => !excludeOptions.includes(x)
    )

    let index = 0
    for (const option of options) {
      const optionValue = tankData[option] //GameOptions.tanks.items[tankData.level].game[option]
      const bg = this.add
        .rectangle(
          -20,
          -20,
          GameOptions.workshop.updateSideWidth,
          100,
          0x000000,
          index % 2 == 0 ? 0.5 : 0
        )
        .setOrigin(0)
      const progressBg = this.add
        .rectangle(0, 55, 300, 10, GameOptions.ui.progressBgColor)
        .setOrigin(0)

      const maximumOptionValue = getMaxOptionValue(
        option,
        tankData.levelTank,
        tankData.levelTower,
        tankData.levelMuzzle
      )
      // console.log(option, maximumOptionValue, optionValue)

      // Math.max.apply(
      //   Math,
      //   [...GameOptions.tanks.items, ...GameOptions.towers.items, ...GameOptions.muzzles.items]
      //     .filter((x) => !!x.game[option])
      //     .map(function (o) {
      //       return o.game[option]
      //     })
      // )
      const currentValueProgress = (optionValue * 100) / maximumOptionValue
      const currentProgress = this.add
        .rectangle(
          0,
          55,
          currentValueProgress * 300 * 0.01,
          10,
          GameOptions.workshop.colorValueProgress
        )
        .setOrigin(0)
      // const keyOption = Object.values(BonusType).find((value) => BonusType[value] === option)
      // console.log(option, Object.values(BonusType), keyOption)

      // const bonusConfig = GameOptions.bonuses.find((x) => x.type === keyOption)
      // const imgOption = this.add.image(25, 25, 'bonuses', bonusConfig.frame).setScale(0.7)
      const textNameOptions = this.add.text(0, -10, `${this.lang?.options[option]}`, {
        fontFamily: 'Arial',
        fontSize: 25,
        color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
        align: 'left',
        lineSpacing: -25
      })
      const textValueOptions = this.add.text(
        currentValueProgress * 300 * 0.01 - 20,
        25,
        `${currentValueProgress.toFixed(1)}%`,
        {
          fontFamily: 'Arial',
          fontSize: 20,
          color: GameOptions.ui.primaryColor,
          align: 'left',
          lineSpacing: -25
        }
      )

      const containerOptions = this.add.container(0, 0, [
        bg,
        progressBg,
        textNameOptions,
        textValueOptions,
        currentProgress
      ])

      const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]

      if (
        optionValue <
        getMaxOptionValue(
          option,
          activeTankData.levelTank,
          activeTankData.levelTower,
          activeTankData.levelMuzzle
        )
      ) {
        const updateButton = new Button(
          this,
          GameOptions.workshop.updateSideWidth - 130,
          30,
          200,
          90,
          GameOptions.ui.primaryColor,
          '',
          {
            fontSize: 25
          },
          (pointer) => {
            this.scene.get('Message').showUpdate(option)
          }
        )
        const textUpdateButton = this.add.text(
          GameOptions.workshop.updateSideWidth - 190,
          15,
          this.lang?.update || '#textUpdate',
          {
            fontFamily: 'Arial',
            fontSize: 25,
            color: GameOptions.ui.primaryColor,
            fontStyle: 'bold',
            align: 'left'
          }
        )
        // const coinImage = this.add.image(GameOptions.workshop.updateSideWidth - 130, 30, 'coin')
        // const textCoinValue = this.add.text(
        //   GameOptions.workshop.updateSideWidth - 105,
        //   15,
        //   GameOptions.costUpdate[option],
        //   {
        //     fontFamily: 'Arial',
        //     fontSize: 30,
        //     color: '#ffffff',
        //     fontStyle: 'bold',
        //     align: 'left'
        //   }
        // )
        containerOptions.add([updateButton, textUpdateButton])
      } else {
        const textUpdateButton = this.add.text(
          GameOptions.workshop.updateSideWidth - 190,
          15,
          this.lang?.maxValue || '#maxValue',
          {
            fontFamily: 'Arial',
            fontSize: 25,
            color: GameOptions.ui.primaryColor,
            fontStyle: 'bold',
            align: 'left'
          }
        )
        containerOptions.add([textUpdateButton])
      }

      optionsForGrid.push(containerOptions)
      index++
    }

    const gridOptions = Phaser.Actions.GridAlign(optionsForGrid, {
      width: 1,
      height: 10,
      cellWidth: 300,
      cellHeight: 90,
      x: 20,
      y: 180
    })
    this.updateContainer.add(gridOptions)

    // const fullOptionsValue = new Map()
    // for (let i = 0; i < GameOptions.complexTanks.length; i++) {
    //   const item = GameOptions.complexTanks[i]
    //   const tankItem = GameOptions.tanks.items[item.tank]
    //   let value = 0
    //   for (const option in tankItem.game) {
    //     value += tankItem.game[option]
    //   }
    //   const towerItem = GameOptions.towers.items[item.tower]
    //   for (const option in towerItem.game) {
    //     // if (['timeRefreshWeapon'].includes(option)) {
    //     //   // value -= towerItem.game[option]
    //     // } else {
    //     // }
    //     value += towerItem.game[option]
    //   }
    //   const muzzleItem = GameOptions.muzzles.items[item.muzzle]
    //   for (const option in muzzleItem.game) {
    //     value += muzzleItem.game[option]
    //   }

    //   fullOptionsValue.set(i, value)
    // }

    let activeTankOptionsValue = 0
    for (const option of options) {
      const optionValue = tankData[option]
      activeTankOptionsValue += optionValue
    }

    const progressBg = this.add
      .rectangle(
        GameOptions.workshop.updateSideWidth / 2,
        110,
        300,
        20,
        GameOptions.ui.progressBgColor
      )
      .setOrigin(0)
    const maximumOptionValue = Object.values(GameOptions.maximum).reduce((a, b) => a + b, 0)
    //Math.max(...fullOptionsValue.values())
    const currentValueProgress = (activeTankOptionsValue * 100) / maximumOptionValue
    const currentProgress = this.add
      .rectangle(
        GameOptions.workshop.updateSideWidth / 2,
        110,
        currentValueProgress * 300 * 0.01,
        20,
        GameOptions.workshop.colorValueProgress
      )
      .setOrigin(0)

    const textStretch = this.add
      .text(
        GameOptions.workshop.updateSideWidth / 2 - 20,
        140,
        `${this.lang?.stretch} - ${currentValueProgress.toFixed(1)}%`,
        {
          fontFamily: 'Arial',
          fontSize: 35,
          fontStyle: 'bold',
          color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
          align: 'right',
          lineSpacing: -25
        }
      )
      .setOrigin(1)
    const textNameTank = this.add.text(
      GameOptions.workshop.updateSideWidth / 2 + 100,
      35,
      GameOptions.complexTanks[tankData.level].name,
      {
        fontFamily: 'Arial',
        fontSize: 35,
        fontStyle: 'bold',
        color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
        align: 'left',
        lineSpacing: -25
      }
    )
    const cont = this.add.container(0, 0, [progressBg, currentProgress, textNameTank, textStretch])
    this.updateContainer.add(cont)

    // const grid = Phaser.Actions.GridAlign(optionCards, {
    //   width: 1,
    //   height: 10,
    //   cellWidth: 680,
    //   cellHeight: 300,
    //   x: 150,
    //   y: 300
    // })
  }

  createShopTanks() {
    if (this.shopPanel) {
      this.shopPanel?.removeAll(true)
    }
    var config = {
      x: 0,
      y: 0,
      width:
        GameOptions.screen.width -
        GameOptions.workshop.sideWidth -
        GameOptions.workshop.updateSideWidth -
        20,
      height: GameOptions.screen.height - 20,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: 30,
        top: 150
      },
      orientation: 'y',

      keys: ['tanks', 'artefact']
    }
    this.shopPanel = this.CreateMainPanel(this, config).layout()
  }

  CreateMainPanel(scene, config) {
    var keys = config.keys
    var buttons = CreateButtons(scene, keys)
    var pages = CreatePages(scene, keys)
    var mainPanel = scene.rexUI.add
      .sizer(config)
      .add(
        buttons, //child
        0, // proportion
        'left', // align
        1, // paddingConfig
        true // expand
      )
      .add(
        pages, //child
        1, // proportion
        'center', // align
        0, // paddingConfig
        true // expand
      )

    var prevButton = undefined
    buttons.on('button.click', function (button) {
      if (button === prevButton) {
        return
      }
      button.getElement('background').setFillStyle(GameOptions.ui.panelBgColor)
      if (prevButton) {
        prevButton.getElement('background').setFillStyle(GameOptions.ui.panelBgColor, 0)
      }
      prevButton = button

      pages.swapPage(button.name)
    })

    mainPanel.addChildrenMap('buttons', buttons)
    mainPanel.addChildrenMap('pages', pages)

    buttons.emitButtonClick(0)
    return mainPanel
  }

  createGarazTabs() {
    if (this.garazPanel) {
      this.garazPanel?.removeAll(true)
    }
    var configPlayer = {
      x: 0,
      y: 0,
      width: GameOptions.workshop.sideWidth - 20,
      height: GameOptions.screen.height - 200,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: 1330,
        top: 150
      },
      orientation: 'y',

      keys: ['tanks', 'artefact']
    }
    this.garazPanel = CreateGarazPanel(this, configPlayer).layout()
    // this.shopContainer.add(mainPanel)
  }

  // createTank() {
  //   const scale = 1.7
  //   const caterpillar1 = this.add
  //     .sprite(
  //       0,
  //       -GameOptions.tanks.items[this.gameData.tanks[this.gameData.activeTankIndex].levelTank]
  //         .catYOffset -
  //         10 * scale,
  //       'caterpillar',
  //       0
  //     )
  //     .setScale(scale)
  //     .setTint(GameOptions.colors.caterpillar)
  //   const caterpillar2 = this.add
  //     .sprite(
  //       0,
  //       GameOptions.tanks.items[this.gameData.tanks[this.gameData.activeTankIndex].levelTank]
  //         .catYOffset +
  //         10 * scale,
  //       'caterpillar',
  //       0
  //     )
  //     .setScale(scale)
  //     .setTint(GameOptions.colors.caterpillar)
  //   const tank = this.add
  //     .sprite(0, 0, 'tank', this.gameData.tanks[this.gameData.activeTankIndex].levelTank)
  //     .setScale(scale)
  //   const tower = this.add
  //     .sprite(0, 0, 'tower', this.gameData.tanks[this.gameData.activeTankIndex].levelTower)
  //     .setScale(scale)
  //   const muzzle = this.add
  //     .sprite(
  //       -GameOptions.muzzles.items[0].offset.xOffset *
  //         GameOptions.muzzles.items[0].vert[0].x *
  //         scale,
  //       0,
  //       'muzzle',
  //       this.gameData.tanks[this.gameData.activeTankIndex].levelMuzzle
  //     )
  //     .setTint(0x111111)
  //     .setScale(scale)
  //   const tankContainer = this.add
  //     .container(GameOptions.workshop.sideWidth / 2, GameOptions.screen.height / 2, [
  //       caterpillar1,
  //       caterpillar2,
  //       tank,
  //       tower,
  //       muzzle
  //     ])
  //     .setAngle(-90)

  //   this.infoContainer.add(tankContainer)
  // }

  tooglePanel(status: boolean) {
    if (status) {
      this.createShopTanks()
      this.createGarazTabs()
    } else {
      this.shopPanel?.removeAll(true)
      this.garazPanel?.removeAll(true)
    }

    this.generalContainer.setVisible(status)
    this.infoContainer.setVisible(status)
    this.updateContainer.setVisible(status)
    this.shopContainer.setVisible(status)

    // const sceneControl = this.scene.get('Control')
    // if (sceneControl) {
    //   sceneControl?.togglePause(!status)
    // }
    // window.getLB && window.getLB()
  }

  // startGame(pointer: any) {
  //   this.tooglePanel(false)

  //   this.click.play()
  //   // this.scene.start('Game')
  //   const sceneGame = this.game.scene.getScene('Game')
  //   sceneGame?.scene.start()

  //   if (window && window.onGamePlayStart) {
  //     window.onGamePlayStart()
  //   }
  //   // const sceneGame = this.game.scene.getScene('Game')
  //   // sceneGame?.onSetGameData(this.gameData)
  //   // EventBus.emit('toggle-lang-list')
  // }
  onUpdateOption(option: string, value: number) {
    if (this.gameData.coin < GameOptions.costUpdate[option] * value) return
    console.log('onUpdateOption: ', option, value)

    this.gameData.coin -= Math.round(GameOptions.costUpdate[option] * value)

    const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]

    this.gameData.tanks[this.gameData.activeTankIndex][option] = Phaser.Math.Clamp(
      this.gameData.tanks[this.gameData.activeTankIndex][option] + value,
      this.gameData.tanks[this.gameData.activeTankIndex][option],
      getMaxOptionValue(
        option,
        activeTankData.levelTank,
        activeTankData.levelTower,
        activeTankData.levelMuzzle
      )
      // GameOptions.maximum[option]
    )
    console.log(
      option,
      getMaxOptionValue(
        option,
        activeTankData.levelTank,
        activeTankData.levelTower,
        activeTankData.levelMuzzle
      ),
      this.gameData.tanks[this.gameData.activeTankIndex][option]
    )

    // console.log(
    //   'Update',
    //   option,
    //   GameOptions.steps[option],
    //   this.gameData.tanks[this.gameData.activeTankIndex][option]
    // )
    EventBus.emit('save-data', this.gameData)
    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.drawPlayerInfo()
    // const sceneGame = this.game.scene.getScene('Game')
    // if (window.showRewardedAdv) {
    //   EventBus.emit('show-reward-adv', () => {
    //     // console.log('SHOW show-reward-adv')
    //     sceneGame.scene.resume()
    //     this.scene.get('Game').onCreateBomb(true)
    //   })
    // } else {
    //   sceneGame.scene.resume()
    //   this.scene.get('Game').onCreateBomb(true)
    // }
  }
  onCartTank(config: IComplexConfig, index: number) {
    if (this.gameData.coin < config.cost) return

    this.gameData.coin -= config.cost

    this.gameData.tanks.push({
      level: index,
      levelTank: config.tank,
      ...GameOptions.tanks.items[config.tank].game,
      levelTower: config.tower,
      ...GameOptions.towers.items[config.tower].game,
      levelMuzzle: config.muzzle,
      ...GameOptions.muzzles.items[config.muzzle].game
    })

    EventBus.emit('save-data', this.gameData)
    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.createShopTanks()
    this.drawPlayerInfo()
    // const sceneGame = this.game.scene.getScene('Game')
    // if (window.showRewardedAdv) {
    //   EventBus.emit('show-reward-adv', () => {
    //     // console.log('SHOW show-reward-adv')
    //     sceneGame.scene.resume()
    //     this.scene.get('Game').onCreateBomb(true)
    //   })
    // } else {
    //   sceneGame.scene.resume()
    //   this.scene.get('Game').onCreateBomb(true)
    // }
  }

  onCheckTank(index: number) {
    this.gameData.activeTankIndex = index
    EventBus.emit('save-data', this.gameData)
    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.createShopTanks()
  }

  stopGame() {
    EventBus.emit('show-lb', true)
    this.tooglePanel(true)

    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    sceneGame?.scene.stop()

    if (window && window.onGameplayStop) {
      window.onGameplayStop()
    }
  }

  onSetGameData(data: IGameData) {
    this.gameData = JSON.parse(JSON.stringify(data))

    this.drawPlayerInfo()

    // this.textScoreValue?.setText(this.gameData.score.toString())
    this.textCoinValue?.setText(this.gameData.coin.toString())

    // this.createTank()
    this.drawWorkShopContainer()
  }

  setLocale(lang: TLang) {
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    this.drawWorkShopContainer()
    this.textTitleScene?.setText(this.lang.workShopTitle || '#workShopTitle')
    this.textShopTitle?.setText(this.lang.shopTitle || '#shopTitle')
    // if (this.gameData.bestScore) {
    //   this.startButtonText.setText(lang.btn_continue || '#btn_continue')
    // } else {
    //   this.startButtonText.setText(lang.btn_startgame || '#btn_startgame')
    // }
    // this.textUpdateButton?.setText(this.lang.update || '#textUpdate')
    this.textRank?.setText(this.lang?.rank[this.gameData?.rank])
    this.buttonReturn?.setText(this.lang.return || '#return')
    this.buttonBank?.setText(this.lang.bank || '#bank')
  }
}

export const CreateTankPage = (scene: Phaser.Scene) => {
  // var GetItems = function (count) {
  //   var data = []
  //   for (var i = 0; i < GameOptions.tanks.items.length; i++) {
  //     data.push({
  //       id: i,
  //       color: 0xffffff
  //     })
  //   }
  //   return data
  // }
  // const fullOptionsValue = new Map()
  // for (let i = 0; i < GameOptions.complexTanks.length; i++) {
  //   const item = GameOptions.complexTanks[i]
  //   const tankItem = GameOptions.tanks.items[item.tank]
  //   let value = 0
  //   for (const option in tankItem.game) {
  //     value += tankItem.game[option]
  //   }
  //   const towerItem = GameOptions.towers.items[item.tower]
  //   for (const option in towerItem.game) {
  //     // if (['timeRefreshWeapon'].includes(option)) {
  //     //   // value -= towerItem.game[option]
  //     // } else {
  //     // }
  //     value += towerItem.game[option]
  //   }
  //   const muzzleItem = GameOptions.muzzles.items[item.muzzle]
  //   for (const option in muzzleItem.game) {
  //     value += muzzleItem.game[option]
  //   }

  //   fullOptionsValue.set(i, value)
  // }

  return scene.rexUI.add.gridTable({
    table: {
      cellHeight: 250,
      columns: 1,
      mask: {
        padding: 2
      }
    },

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 30, 60, 0, GameOptions.ui.primaryColorNumber)
    },

    space: {
      table: 10
    },

    createCellContainerCallback: (cell) => {
      const item = GameOptions.complexTanks[cell.index]
      const tankConfig = GameOptions.tanks.items[item.tank]
      const towerConfig = GameOptions.towers.items[item.tower]
      const muzzleConfig = GameOptions.muzzles.items[item.muzzle]
      var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        // item = cell.item,
        index = cell.index

      const scale = 1.3
      const towerSprite = scene.add.image(0, 0, 'tower', towerConfig.frame).setScale(scale)
      const muzzleSprite = scene.add
        .sprite(
          -GameOptions.muzzles.items[0].offset.xOffset *
            GameOptions.muzzles.items[0].vert[0].x *
            scale,
          0,
          'muzzle',
          muzzleConfig.frame
        )
        .setTint(0x111111)
        .setScale(scale)
      const tankSprite = scene.add.image(0, 0, 'tank', tankConfig.frame).setScale(scale)
      const tankContainer = scene.add
        .container(80, 20, [tankSprite, towerSprite, muzzleSprite])
        .setAngle(-90)

      const bgPanel = scene.add
        .nineslice(
          0,
          -120,
          'shopPanel2',
          0,
          GameOptions.screen.width -
            GameOptions.workshop.sideWidth -
            GameOptions.workshop.updateSideWidth -
            80,
          250,
          50,
          50,
          50,
          50
        )
        .setOrigin(0)
        .setScale(1)

      const bgLb = scene.add
        .nineslice(
          0,
          -115,
          'buttons',
          1,
          GameOptions.screen.width -
            GameOptions.workshop.sideWidth -
            GameOptions.workshop.updateSideWidth -
            80,
          250,
          50,
          50,
          50,
          50
        )
        .setTint(GameOptions.ui.panelBgColorLight)
        .setAlpha(0.9)
        .setOrigin(0)
      const containerImage = scene.add.container(0, 0, [bgLb, bgPanel, tankContainer])
      const priceImage = scene.add.image(20, 160, 'coin', 0)
      const priceText = scene.add.text(50, 140, item.cost, {
        fontFamily: 'Arial',
        fontSize: 35,
        color: '#ffffff', //GameOptions.ui.accent,
        align: 'left',
        fontStyle: 'bold',
        lineSpacing: -25
      })
      const progressBg = scene.add
        .rectangle(0, 45, 300, 10, GameOptions.ui.progressBgColor)
        .setOrigin(0)
      const maximumOptionValue = Object.values(GameOptions.maximum).reduce((a, b) => a + b, 0) //Math.max(...fullOptionsValue.values())
      const currentOptions = {
        ...GameOptions.tanks.items[item.tank].game,
        ...GameOptions.towers.items[item.tower].game,
        ...GameOptions.muzzles.items[item.muzzle].game
      }
      const currentValueProgress =
        (Object.values(currentOptions).reduce((a, b) => a + b, 0) * 100) / maximumOptionValue
      const currentProgress = scene.add
        .rectangle(
          0,
          45,
          currentValueProgress * 300 * 0.01,
          10,
          GameOptions.workshop.colorValueProgress
        )
        .setOrigin(0)
      const textNameTank = scene.add.text(0, 0, item.name, {
        fontFamily: 'Arial',
        fontSize: 35,
        fontStyle: 'bold',
        color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
        align: 'left',
        lineSpacing: -25
      })
      const textNameOptions = scene.add.text(
        0,
        60,
        `${scene.lang.stretch} - ${currentValueProgress.toFixed(1)}%`,
        {
          fontFamily: 'Arial',
          fontSize: 30,
          color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
          align: 'left',
          lineSpacing: -25
        }
      )
      const containerOptions = scene.add.container(0, 0, [
        progressBg,
        textNameOptions,
        textNameTank,
        currentProgress,
        priceImage,
        priceText
      ])

      if (scene.gameData.tanks.find((x) => x.level === cell.index)) {
        const textInGaraz = scene.add
          .text(340, 170, scene.lang.inGaraz, {
            fontFamily: 'Arial',
            fontSize: 30,
            color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
            align: 'right',
            lineSpacing: -25
          })
          .setOrigin(1)
        containerOptions.add(textInGaraz)
      } else if (item.rank <= scene.gameData.rank) {
        const buttonCart = new Button(
          scene,
          280,
          140,
          180,
          100,
          GameOptions.ui.panelBgColor,
          scene.lang.cart,
          {
            color: GameOptions.ui.primaryColor
          },
          () => {
            scene.scene
              .get('Message')
              .showCartTank(GameOptions.complexTanks[cell.index], cell.index)
          }
        )
        containerOptions.add(buttonCart)
      }

      if (item.rank > scene.gameData.rank) {
        const lockImage = scene.add
          .image(-50, 70, 'rank', item.rank)
          .setTint(GameOptions.ui.accentNumber)
          .setScale(1.5)
          .setInteractive()
        const lockPanel = scene.add
          .rectangle(-140, -30, 520, 235, GameOptions.ui.panelBgColor, 0.8)
          .setOrigin(0)
          .setScale(1)
        const lockText = scene.add.text(
          0,
          20,
          `${scene.lang.norank}${scene.lang.rank[item.rank]}`,
          {
            fontFamily: 'Arial',
            fontSize: 30,
            color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
            align: 'center',
            lineSpacing: 5,
            wordWrap: {
              width: 400
            }
          }
        )
        const lockContainer = scene.add
          .container(0, 0, [lockPanel, lockImage, lockText])
          .setDepth(99999)
        containerOptions.add(lockContainer)
      }

      const gridOptions = Phaser.Actions.GridAlign([containerOptions], {
        width: 1,
        height: 10,
        cellWidth: 250,
        cellHeight: 37,
        x: 150,
        y: -80
      })

      // const progressBg = scene.add.rectangle(130, 0, 300, 10, 0x444444).setOrigin(0)
      // const progress = scene.add.rectangle(130, 0, 200, 10, 0x888888).setOrigin(0)

      return scene.rexUI.add
        .label({
          width: width,
          height: height,

          // background: scene.rexUI.add
          //   .roundRectangle(0, 0, 20, 20, 0)
          //   .setStrokeStyle(2, COLOR_LIGHT),
          icon: containerImage, //scene.rexUI.add.imageBox(0, 0, 'tank', 0).setAngle(-90),
          text: scene.add.container(0, 0, [...gridOptions]), //scene.add.text(0, 0, item.id),

          space: {
            left: 0
          }
        })
        .setOrigin(0)
    },
    items: GameOptions.complexTanks
  })
}

export const CreatePages = (scene: Phaser.Scene, keys) => {
  var pages = scene.rexUI.add.pages({
    space: { left: 0, right: 0, top: 10, bottom: 10 }
  })
  // .addBackground(
  //   scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, GameOptions.ui.panelBgColor, 0.5)
  // )

  var createPageCallback = {
    tanks: CreateTankPage,
    artefact: CreateArtefactPage
  }
  var key
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    key = keys[i]
    pages.addPage(
      createPageCallback[key](scene), // game object
      key // key
    )
  }
  return pages
}

export const CreateArtefactPage = (scene) => {
  return scene.rexUI.add.gridTable()
}

export const CreateButtons = (scene, keys) => {
  var buttons = []
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    buttons.push(
      scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, GameOptions.ui.panelBgColor, 0),
        text: scene.add.text(0, 0, scene.lang ? scene.lang[keys[i]] : keys[i], {
          fontFamily: 'Arial',
          fontSize: 35
        }),
        name: keys[i],
        space: {
          top: 15,
          left: 15,
          right: 15,
          bottom: 15
        }
      })
    )
  }
  const btns = scene.rexUI.add.buttons({
    buttons: buttons,
    orientation: 'x' // Left-right
  })
  return btns
}

export const CreateGarazPanel = (scene, config) => {
  var keys = config.keys
  var buttons = CreateButtons(scene, keys)
  var pages = CreateGarazPages(scene, config, keys)
  var mainPanel = scene.rexUI.add
    .sizer(config)
    .add(
      buttons, //child
      0, // proportion
      'left', // align
      1, // paddingConfig
      true // expand
    )
    .add(
      pages, //child
      1, // proportion
      'center', // align
      0, // paddingConfig
      true // expand
    )

  var prevButton = undefined
  buttons.on('button.click', function (button) {
    if (button === prevButton) {
      return
    }
    button.getElement('background').setFillStyle(GameOptions.ui.panelBgColor)
    if (prevButton) {
      prevButton.getElement('background').setFillStyle(GameOptions.ui.panelBgColor, 0)
    }
    prevButton = button

    pages.swapPage(button.name)
  })

  mainPanel.addChildrenMap('buttons', buttons)
  mainPanel.addChildrenMap('pages', pages)
  buttons.emitButtonClick(0)
  return mainPanel
}

export const CreateGarazPages = (scene: Phaser.Scene, config, keys) => {
  var pages = scene.rexUI.add.pages({
    width: config.width - 20,
    space: { left: 0, right: 0, top: 10, bottom: 10 }
  })
  // .addBackground(
  //   scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, GameOptions.ui.panelBgColor, 0.5)
  // )

  var createPageCallback = {
    tanks: CreateGarazTankPage,
    artefact: CreateArtefactPage
  }
  var key
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    key = keys[i]
    pages.addPage(
      createPageCallback[key](scene), // game object
      key // key
    )
  }
  return pages
}

export const CreateGarazTankPage = (scene: Phaser.Scene) => {
  // const fullOptionsValue = new Map()
  // for (let i = 0; i < GameOptions.complexTanks.length; i++) {
  //   const item = GameOptions.complexTanks[i]
  //   const tankItem = GameOptions.tanks.items[item.tank]
  //   let value = 0
  //   for (const option in tankItem.game) {
  //     value += tankItem.game[option]
  //   }
  //   const towerItem = GameOptions.towers.items[item.tower]
  //   for (const option in towerItem.game) {
  //     // if (['timeRefreshWeapon'].includes(option)) {
  //     //   // value -= towerItem.game[option]
  //     // } else {
  //     // }
  //     value += towerItem.game[option]
  //   }
  //   const muzzleItem = GameOptions.muzzles.items[item.muzzle]
  //   for (const option in muzzleItem.game) {
  //     value += muzzleItem.game[option]
  //   }

  //   fullOptionsValue.set(i, value)
  // }

  // const gameData = scene.gameData

  return scene.rexUI.add.gridTable({
    table: {
      cellHeight: 250,
      columns: 1,
      mask: {
        padding: 2
      }
    },

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 30, 60, 0, GameOptions.ui.primaryColorNumber)
    },

    space: {
      table: 10
    },

    createCellContainerCallback: (cell) => {
      var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        // item = cell.item,
        index = cell.index
      const item = scene.gameData.tanks[cell.index]

      const tankConfig = GameOptions.tanks.items[item.levelTank]
      const towerConfig = GameOptions.towers.items[item.levelTower]
      const muzzleConfig = GameOptions.muzzles.items[item.levelMuzzle]

      const scale = 1.3
      const towerSprite = scene.add.image(0, 0, 'tower', towerConfig.frame).setScale(scale)
      const muzzleSprite = scene.add
        .sprite(
          -GameOptions.muzzles.items[0].offset.xOffset *
            GameOptions.muzzles.items[0].vert[0].x *
            scale,
          0,
          'muzzle',
          muzzleConfig.frame
        )
        .setTint(0x111111)
        .setScale(scale)
      const tankSprite = scene.add.image(0, 0, 'tank', tankConfig.frame).setScale(scale)
      const tankContainer = scene.add
        .container(80, 20, [tankSprite, towerSprite, muzzleSprite])
        .setAngle(-90)

      const bgBorder = scene.add
        .nineslice(
          0,
          -120,
          'shopPanel2',
          0,
          GameOptions.screen.width -
            GameOptions.workshop.sideWidth -
            GameOptions.workshop.updateSideWidth -
            80,
          250,
          50,
          50,
          50,
          50
        )
        .setOrigin(0)
        .setScale(1)
      const bgPanel = scene.add
        .nineslice(
          0,
          -115,
          'buttons',
          1,
          GameOptions.screen.width -
            GameOptions.workshop.sideWidth -
            GameOptions.workshop.updateSideWidth -
            80,
          250,
          50,
          50,
          50,
          50
        )
        .setTint(
          cell.index === scene.gameData.activeTankIndex
            ? GameOptions.ui.accentNumber
            : GameOptions.ui.panelBgColorLight
        )
        .setAlpha(0.9)
        .setOrigin(0)
      const containerImage = scene.add.container(0, 0, [bgPanel, bgBorder, tankContainer])

      const buttonCheck = new Button(
        scene,
        280,
        140,
        180,
        100,
        GameOptions.ui.panelBgColor,
        scene.lang?.check,
        {
          color: GameOptions.ui.primaryColor
        },
        () => {
          scene.onCheckTank(cell.index)
        }
      )
      const progressBg = scene.add
        .rectangle(0, 45, 300, 10, GameOptions.ui.progressBgColor)
        .setOrigin(0)
      const maximumOptionValue = Object.values(GameOptions.maximum).reduce((a, b) => a + b, 0)
      //Math.max(...fullOptionsValue.values())
      const tankData = scene.gameData.tanks[cell.index]
      const excludeOptions = GameOptions.excludeFromStretchOptions
      const options = Object.keys(item).filter((x) => !excludeOptions.includes(x))
      let activeTankOptionsValue = 0
      for (const option of options) {
        const optionValue = tankData[option]
        activeTankOptionsValue += optionValue
      }

      const currentValueProgress = (activeTankOptionsValue * 100) / maximumOptionValue
      const currentProgress = scene.add
        .rectangle(
          0,
          45,
          currentValueProgress * 300 * 0.01,
          10,
          GameOptions.workshop.colorValueProgress
        )
        .setOrigin(0)
      const textNameTank = scene.add.text(0, 0, GameOptions.complexTanks[item.level].name, {
        fontFamily: 'Arial',
        fontSize: 35,
        fontStyle: 'bold',
        color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
        align: 'left',
        lineSpacing: -25
      })
      const textNameOptions = scene.add.text(
        0,
        60,
        `${scene.lang?.stretch} - ${currentValueProgress.toFixed(1)}%`,
        {
          fontFamily: 'Arial',
          fontSize: 30,
          color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
          align: 'left',
          lineSpacing: -25
        }
      )
      const containerOptions = scene.add.container(0, 0, [
        progressBg,
        textNameOptions,
        textNameTank,
        currentProgress,
        buttonCheck
      ])

      const gridOptions = Phaser.Actions.GridAlign([containerOptions], {
        width: 1,
        height: 10,
        cellWidth: 250,
        cellHeight: 37,
        x: 150,
        y: -80
      })

      // const progressBg = scene.add.rectangle(130, 0, 300, 10, 0x444444).setOrigin(0)
      // const progress = scene.add.rectangle(130, 0, 200, 10, 0x888888).setOrigin(0)

      return scene.rexUI.add
        .label({
          width: width,
          height: height,

          // background: scene.rexUI.add
          //   .roundRectangle(0, 0, 20, 20, 0)
          //   .setStrokeStyle(2, COLOR_LIGHT),
          icon: containerImage, //scene.rexUI.add.imageBox(0, 0, 'tank', 0).setAngle(-90),
          text: scene.add.container(0, 0, [...gridOptions]), //scene.add.text(0, 0, item.id),

          space: {
            left: 0
          }
        })
        .setOrigin(0)
    },
    items: scene.gameData.tanks
  })
}
