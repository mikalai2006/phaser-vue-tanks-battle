import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'

import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { BonusType, GameOptions, WeaponType } from '../options/gameOptions'
import { Button } from '../objects/ui/Button'
import { IComplexConfig, IGameData, IWeaponObject, TLang } from '../types'
import { getEnumStringKey, getMaxOptionValue, getRank, getTankImage } from '../utils/utils'
import { debounce } from 'lodash'
import { getLocalStorage, setLocalStorage } from '../utils/storageUtils'

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

  bg: Phaser.GameObjects.Container
  textTitleScene: Phaser.GameObjects.Text

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
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

    // events.
    this.events.on('pause', () => {
      this.click.pause()
    })
    this.events.on('resume', () => {
      this.tooglePanel(false)
    })

    this.tooglePanel(false)

    EventBus.emit('current-scene-ready', this)
    this.onSync(gameData, lang)
  }

  drawPlayerInfo() {
    this.infoContainer.removeAll(true)
    // this.rankContainer?.destroy()

    this.buttonReturn = new Button(
      this,
      -160,
      GameOptions.screen.height - 70,
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
        -GameOptions.screen.width / 2 - 380,
        -65,
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
      .image(-GameOptions.workshop.sideWidth / 2 + 60, 0, 'rank', getRank(this.gameData.score))
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
      .text(
        -GameOptions.workshop.sideWidth / 2 + 120,
        -12,
        this.lang?.rank[getRank(this.gameData?.score)],
        {
          fontFamily: 'Arial',
          fontSize: 20,
          color: '#999999',
          align: 'left'
        }
      )
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

  changeGerb(index: number) {
    this.gameData.gerbId = index
    EventBus.emit('save-data', this.gameData)
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
      const maximumOptionValue = getMaxOptionValue(option, tankData.id)
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

      if (optionValue < getMaxOptionValue(option, tankData.id)) {
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
      y: 150
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

    const configComplexTank = GameOptions.complexTanks.find((x) => x.id == tankData.id)

    const progressBg = this.add
      .rectangle(
        GameOptions.workshop.updateSideWidth / 2,
        90,
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
        90,
        currentValueProgress * 300 * 0.01,
        20,
        GameOptions.workshop.colorValueProgress
      )
      .setOrigin(0)

    const textStretch = this.add
      .text(
        GameOptions.workshop.updateSideWidth / 2 - 20,
        120,
        `${this.lang?.stretch} - ${currentValueProgress.toFixed(1)}%`,
        {
          fontFamily: 'Arial',
          fontSize: 30,
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
      GameOptions.complexTanks[configComplexTank.tank].name,
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
        top: 100
      },
      orientation: 'y',

      keys: ['tanksPage', 'weaponsPage'],

      keyScroll: 'scrollS'
    }
    this.shopPanel = this.CreateMainPanel(this, config).layout()

    const storageSettings = getLocalStorage(GameOptions.localStorageSettingsName, {})
    for (const page of this.shopPanel.childrenMap.pages.children) {
      page.t = storageSettings[page.keey] || 0
    }
  }

  CreateMainPanel(scene, config) {
    var keys = config.keys
    var buttons = CreateButtons(scene, config, keys)
    var pages = CreatePages(scene, config, keys)
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
      height: GameOptions.screen.height - 20,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: 1330,
        top: 150
      },
      orientation: 'y',

      keys: ['tanksPage'],
      garaz: true,
      workshop: true,

      keyScroll: 'scrollGM'
    }
    this.garazPanel = CreateGarazPanel(this, configPlayer).layout()

    const storageSettings = getLocalStorage(GameOptions.localStorageSettingsName, {})
    for (const page of this.garazPanel.childrenMap.pages.children) {
      page.t = storageSettings[page.keey] || 0
    }
  }

  tooglePanel(status: boolean) {
    if (status) {
      this.scene.moveDown('Control')
      this.createShopTanks()
      this.createGarazTabs()
    } else {
      this.scene.moveUp('Control')
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

  onUpdateOption(option: string, value: number) {
    if (this.gameData.coin < GameOptions.costUpdate[option] * value) return
    console.log('onUpdateOption: ', option, value)

    this.gameData.coin -= Math.round(GameOptions.costUpdate[option] * value)

    const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]
    this.gameData.tanks[this.gameData.activeTankIndex][option] = Phaser.Math.Clamp(
      this.gameData.tanks[this.gameData.activeTankIndex][option] + value,
      this.gameData.tanks[this.gameData.activeTankIndex][option],
      getMaxOptionValue(option, activeTankData.id)
      // GameOptions.maximum[option]
    )
    // console.log(
    //   option,
    //   getMaxOptionValue(
    //     option,
    //     configComplexTank
    //   ),
    //   this.gameData.tanks[this.gameData.activeTankIndex][option]
    // )

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
    if (this.gameData.coin < config.cost) {
      this.rexUI.add
        .toast({
          x: GameOptions.screen.width / 2,
          y: GameOptions.screen.height / 2,

          background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, GameOptions.ui.accentNumber),
          text: this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: 35,
            color: '#000000',
            fontStyle: 'bold'
          }),
          space: {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
          },
          duration: {
            in: 200,
            hold: 2000,
            out: 200
          }
        })
        .setDepth(999999)
        .showMessage(this.lang.notMany)
      return
    }

    this.gameData.coin -= config.cost

    this.gameData.tanks.push({
      ...GameOptions.tanks.items[config.tank].game,
      ...GameOptions.towers.items[config.tower].game,
      ...GameOptions.muzzles.items[config.muzzle].game,
      cb: 0,
      id: config.id
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

  onCartWeapon(config: IWeaponObject, value: number) {
    if (this.gameData.coin < config.cost * value) {
      this.rexUI.add
        .toast({
          x: GameOptions.screen.width / 2,
          y: GameOptions.screen.height / 2,

          background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, GameOptions.ui.accentNumber),
          text: this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: 35,
            color: '#000000',
            fontStyle: 'bold'
          }),
          space: {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
          },
          duration: {
            in: 200,
            hold: 2000,
            out: 200
          }
        })
        .setDepth(999999)
        .showMessage(this.lang.notMany)
      return
    }

    this.gameData.coin -= config.cost * value

    const existWeaponIndex = this.gameData.weapons[config.type]
    if (existWeaponIndex) {
      this.gameData.weapons[config.type] += value
    } else {
      this.gameData.weapons[config.type] = value
    }

    EventBus.emit('save-data', this.gameData)
    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.createShopTanks()
    this.drawPlayerInfo()
  }

  onCheckTank(index: number) {
    this.gameData.activeTankIndex = index
    EventBus.emit('save-data', this.gameData)
    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.createShopTanks()
  }

  onSellTank(id: string, cost: number) {
    const tankSellIndex = this.gameData.tanks.findIndex((x) => x.id == id)
    if (tankSellIndex == -1) {
      return
    }

    this.gameData.tanks = this.gameData.tanks.filter((x) => x.id != id)

    if (this.gameData.activeTankIndex == tankSellIndex) {
      this.gameData.activeTankIndex = 0
    }

    this.gameData.coin += cost
    EventBus.emit('save-data', this.gameData)

    this.drawWorkShopContainer()
    this.createGarazTabs()
    this.createShopTanks()
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.gameData = JSON.parse(JSON.stringify(gameData))
    this.lang = lang

    this.drawPlayerInfo()

    // this.textScoreValue?.setText(this.gameData.score.toString())
    this.textCoinValue?.setText(this.gameData.coin.toString())

    // this.createTank()
    this.drawWorkShopContainer()

    this.changeLocale()
  }

  changeLocale() {
    this.drawWorkShopContainer()
    this.textTitleScene?.setText(this.lang.workShopTitle || '#workShopTitle')
    this.textShopTitle?.setText(this.lang.shopTitle || '#shopTitle')
    this.textRank?.setText(this.lang?.rank[getRank(this.gameData?.score)])
    this.buttonReturn?.setText(this.lang.return || '#return')
    this.buttonBank?.setText(this.lang.bank || '#bank')
  }
}

const updateScrollFn = (scene: Phaser.Scene, key: string, value: number) => {
  const uiSettings = getLocalStorage(GameOptions.localStorageSettingsName, {})
  uiSettings[key] = value
  setLocalStorage(GameOptions.localStorageSettingsName, uiSettings)
}

const debounceUpdateScrollFn = debounce(updateScrollFn, 300)

export const CreateTankPage = (scene: Phaser.Scene, config: any) => {
  const keyT = config.keyScroll + 'T'
  const items = GameOptions.complexTanks.sort((a, b) => {
    const currentOptionsA = {
      ...GameOptions.tanks.items[a.tank].game,
      ...GameOptions.towers.items[a.tower].game,
      ...GameOptions.muzzles.items[a.muzzle].game
    }
    const currentValueA = Object.values(currentOptionsA).reduce((a, b) => a + b, 0)
    const currentOptionsB = {
      ...GameOptions.tanks.items[b.tank].game,
      ...GameOptions.towers.items[b.tower].game,
      ...GameOptions.muzzles.items[b.muzzle].game
    }
    const currentValueB = Object.values(currentOptionsB).reduce((a, b) => a + b, 0)
    return currentValueA - currentValueB
  })
  const t = scene.rexUI.add.gridTable({
    table: {
      cellHeight: 250,
      columns: 1,
      mask: {
        padding: 2
      }
    },

    // clamplTableOXY: false,

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 30, 60, 0, GameOptions.ui.primaryColorNumber),
      valuechangeCallback: function (newValue) {
        debounceUpdateScrollFn(scene, keyT, newValue)
      }
    },

    space: {
      table: 10
    },

    createCellContainerCallback: (cell) => {
      const item = items[cell.index]
      var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        // item = cell.item,
        index = cell.index

      const configTank = GameOptions.complexTanks.find((x) => x.id == item.id)
      const tankContainer = getTankImage(scene, configTank.id).setAngle(-90).setScale(1.2)
      tankContainer.setPosition(80, 20)

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
        currentProgress
      ])

      if (item.cost > 0) {
        const priceImage = scene.add.image(20, 160, 'coin', 0)
        const priceText = scene.add.text(50, 140, item.cost, {
          fontFamily: 'Arial',
          fontSize: 35,
          color: '#ffffff', //GameOptions.ui.accent,
          align: 'left',
          fontStyle: 'bold',
          lineSpacing: -25
        })
        containerOptions.add([priceImage, priceText])
      }

      if (scene.gameData.tanks.find((x) => x.id === item.id)) {
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
      } else if (item.rank <= getRank(scene.gameData.score)) {
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

      if (item.rank > getRank(scene.gameData.score)) {
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
    items: items
  })
  t.keey = keyT
  return t
}

export const CreateWeaponsPage = (scene, config) => {
  const keyT = config.keyScroll + 'W'
  const t = scene.rexUI.add.gridTable({
    table: {
      cellHeight: 250,
      columns: 1,
      mask: {
        padding: 2
      }
    },

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 30, 60, 0, GameOptions.ui.primaryColorNumber),
      valuechangeCallback: function (newValue) {
        debounceUpdateScrollFn(scene, keyT, newValue)
      }
    },

    space: {
      table: 10
    },

    createCellContainerCallback: (cell) => {
      const item: IWeaponObject = config.garaz
        ? GameOptions.weaponObjects.find((x) => x.type == cell.item.type)
        : cell.item
      var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        index = cell.index

      const scale = 1.3
      const image = scene.add.image(70, 30, 'weapon', item.frame).setScale(scale)

      const bgPanel = scene.add
        .nineslice(0, -120, 'shopPanel2', 0, width, 250, 50, 50, 50, 50)
        .setOrigin(0)
        .setScale(1)

      const bgLb = scene.add
        .nineslice(0, -115, 'buttons', 1, width, 250, 50, 50, 50, 50)
        .setTint(GameOptions.ui.panelBgColorLight)
        .setAlpha(0.9)
        .setOrigin(0)
      const containerImage = scene.add.container(0, 0, [bgLb, bgPanel, image])
      const textNameTank = scene.add.text(
        -80,
        0,
        `${scene.lang.weapons[getEnumStringKey(WeaponType, item.type)]} ${scene.lang.weapon}`,
        {
          fontFamily: 'Arial',
          fontSize: 30,
          fontStyle: 'bold',
          color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
          align: 'left',
          lineSpacing: -25
        }
      )
      const containerOptions = scene.add.container(0, 0, [textNameTank])

      if (!config.garaz) {
        const textDamage = scene.add.text(0, 60, `${scene.lang.damage} - ${item.damage}HP`, {
          fontFamily: 'Arial',
          fontSize: 30,
          color: GameOptions.ui.primaryColor, //GameOptions.ui.accent,
          align: 'left',
          lineSpacing: -25
        })
        const priceImage = scene.add.image(20, 140, 'coin', 0)
        const priceText = scene.add.text(50, 120, item.cost, {
          fontFamily: 'Arial',
          fontSize: 35,
          color: '#ffffff', //GameOptions.ui.accent,
          align: 'left',
          fontStyle: 'bold',
          lineSpacing: -25
        })
        const buttonCart = new Button(
          scene,
          width - 230,
          140,
          180,
          100,
          GameOptions.ui.panelBgColor,
          scene.lang.cart,
          {
            color: GameOptions.ui.primaryColor
          },
          () => {
            scene.scene.get('Message').showCartWeapon(item, cell.index)
          }
        )
        containerOptions.add([buttonCart, priceImage, priceText, textDamage])
      } else {
        const countTitle = scene.add
          .text(width - 160, 110, scene.lang.exist, {
            fontFamily: 'Arial',
            fontSize: 35,
            color: GameOptions.ui.primaryColor,
            align: 'right',
            lineSpacing: -25
          })
          .setOrigin(1)
        const countText = scene.add
          .text(width - 160, 170, cell.item.count, {
            fontFamily: 'Arial',
            fontSize: 60,
            color: GameOptions.ui.accent,
            align: 'left',
            fontStyle: 'bold',
            lineSpacing: -25
          })
          .setOrigin(1)
        containerOptions.add([countText, countTitle])
      }

      const gridOptions = Phaser.Actions.GridAlign([containerOptions], {
        width: 1,
        height: 10,
        cellWidth: width,
        cellHeight: 37,
        x: 120,
        y: -80
      })

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
    items: config.garaz
      ? scene.gameData.weapons
      : GameOptions.weaponObjects.filter((x) => x.cost > 0)
  })
  t.keey = keyT
  return t
}

export const CreatePages = (scene: Phaser.Scene, config, keys) => {
  var pages = scene.rexUI.add.pages({
    space: { left: 0, right: 0, top: 10, bottom: 10 }
  })
  // .addBackground(
  //   scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, GameOptions.ui.panelBgColor, 0.5)
  // )

  var createPageCallback = {
    tanksPage: CreateTankPage,
    weaponsPage: CreateWeaponsPage
  }
  var key
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    key = keys[i]
    pages.addPage(
      createPageCallback[key](scene, config), // game object
      key // key
    )
  }
  return pages
}

export const CreateButtons = (scene, config, keys) => {
  var buttons = []
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    buttons.push(
      scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, GameOptions.ui.panelBgColor, 0),
        text: scene.add.text(
          0,
          0,
          `${config.garaz ? scene.lang.my : ''} ${scene.lang ? (config.garaz ? scene.lang[keys[i]].toLowerCase() : scene.lang[keys[i]]) : keys[i]}`,
          {
            fontFamily: 'Arial',
            fontSize: 35
          }
        ),
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
  const btns = scene.rexUI.add
    .buttons({
      buttons: buttons,
      orientation: 'x' // Left-right
    })
    .setDepth(999999)
  return btns
}

export const CreateGarazPanel = (scene, config) => {
  var keys = config.keys
  var buttons = CreateButtons(scene, config, keys)
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
    tanksPage: CreateGarazTankPage,
    weaponsPage: CreateWeaponsPage
  }
  var key
  for (var i = 0, cnt = keys.length; i < cnt; i++) {
    key = keys[i]
    pages.addPage(
      createPageCallback[key](scene, config), // game object
      key // key
    )
  }
  return pages
}

export const CreateGarazTankPage = (scene: Phaser.Scene, config: any) => {
  const keyT = config.keyScroll + 'T'
  const t = scene.rexUI.add.gridTable({
    table: {
      cellHeight: 250,
      columns: 1,
      mask: {
        padding: 2
      }
    },

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 30, 60, 0, GameOptions.ui.primaryColorNumber),
      valuechangeCallback: function (newValue) {
        debounceUpdateScrollFn(scene, keyT, newValue)
      }
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

      const configTank = GameOptions.complexTanks.find((x) => x.id == item.id)

      const tankContainer = getTankImage(scene, configTank.id).setAngle(-90).setScale(1.2)
      tankContainer.setPosition(80, 20)

      const bgBorder = scene.add
        .nineslice(0, -120, 'shopPanel2', 0, width, height, 50, 50, 50, 50)
        .setOrigin(0)
        .setScale(1)
      const bgPanel = scene.add
        .nineslice(0, -115, 'buttons', 1, width, 250, 50, 50, 50, 50)
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
        width - 260,
        140,
        180,
        100,
        GameOptions.ui.panelBgColor,
        scene.lang?.check,
        {
          color: GameOptions.ui.primaryColor,
          fontSize: 25
        },
        () => {
          scene.onCheckTank(cell.index)
        }
      )
      const progressBg = scene.add
        .rectangle(0, 45, width / 2, 10, GameOptions.ui.progressBgColor)
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
          currentValueProgress * progressBg.width * 0.01,
          10,
          GameOptions.workshop.colorValueProgress
        )
        .setOrigin(0)
      const textNameTank = scene.add.text(0, 0, configTank.name, {
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

      if (config.workshop && configTank.cost > 0) {
        const buttonSell = new Button(
          scene,
          width - 420,
          140,
          180,
          100,
          GameOptions.ui.panelBgColor,
          scene.lang?.sell,
          {
            color: GameOptions.ui.primaryColor,
            fontSize: 25
          },
          () => {
            // scene.onSellTank(cell.index)
            scene.scene.get('Message').showSellTank(item.id)
          }
        )
        containerOptions.add(buttonSell)
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
    items: scene.gameData.tanks
  })
  t.keey = keyT
  return t
}

export function createTableGerb(scene: Phaser.Scene, callback: () => void) {
  const items = Array.from(Array(GameOptions.countGerb).keys())

  const table = scene.rexUI.add.gridTable({
    table: {
      cellHeight: 125,
      cellWidth: 125,
      columns: 6,
      rows: 10,
      mask: {
        padding: {
          top: 25,
          bottom: 25
        }
      }
      // cellInvisibleCallback: (cell) => {
      //   console.log(cell)
      // }
    },

    slider: {
      track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, GameOptions.ui.panelBgColor),
      thumb: scene.rexUI.add.roundRectangle(0, 0, 60, 60, 0, GameOptions.ui.primaryColorNumber),
      valuechangeCallback: function (newValue) {
        // debounceUpdateScrollFn(scene, keyT, newValue)
      }
    },

    // space: {
    //   table: 0
    // },

    createCellContainerCallback: (cell) => {
      const item = items[cell.index]
      var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        // item = cell.item,
        index = cell.index

      const container = scene.add.container(0, 0, [])

      if (scene.gameData.gerbId == item) {
        const bg = scene.add.rectangle(0, 0, width, height, GameOptions.ui.accentNumber, 0.3)
        container.add(bg)
      }

      const image = scene.add
        .image(0, 0, 'gerb', item)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          scene.scene.get('WorkShop').changeGerb(item)
          callback && callback()
        })
      container.add(image)

      return scene.rexUI.add
        .label({
          width: width,
          height: height,

          // background: scene.rexUI.add
          //   .roundRectangle(0, 0, 20, 20, 0)
          //   .setStrokeStyle(2, COLOR_LIGHT),
          icon: container, //scene.rexUI.add.imageBox(0, 0, 'tank', 0).setAngle(-90),
          text: null, //scene.add.container(0, 0, [...gridOptions]), //scene.add.text(0, 0, item.id),

          space: {
            left: width,
            top: 0
          }
        })
        .setOrigin(0)
    },
    items
  })

  return (
    scene.rexUI.add
      .sizer({
        x: 0,
        y: 0,
        width: 900,
        height: 300,
        orientation: 'y',
        // enableLayer: true,
        space: { left: 5, right: 5, top: 25, bottom: 25, item: 0 },
        anchor: {
          top: 'top',
          left: 'left'
        }
      })
      // .addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, 0x000000))
      .add(
        table,
        1, // proportion
        'center', // align
        0, // paddingConfig
        true // expand)
      )
      .layout()
  )
}
