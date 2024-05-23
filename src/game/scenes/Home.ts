import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions, SpriteKeys, WeaponType } from '../options/gameOptions'
import { Button } from '../objects/ui/Button'
import { IGameData, ILeaderBoard, IPlayerData, KeySound, TLang } from '../types'
import { CreateGarazPanel } from './WorkShop'
import Game from './Game'
import {
  getRank,
  getSupportWeapons,
  getTankImage,
  getTrimName,
  replaceRegexByArray
} from '../utils/utils'
import { getLocalStorage } from '../utils/storageUtils'

export class Home extends Scene {
  constructor() {
    super('Home')
  }

  gameData: IGameData
  playerData: IPlayerData

  lang: TLang
  textRank: Phaser.GameObjects.Text
  textCoinValue: Phaser.GameObjects.Text
  textCountBattles: Phaser.GameObjects.Text
  textNamePlayer: Phaser.GameObjects.Text
  rankContainer: Phaser.GameObjects.Container
  garazPanel: any

  buttonBattle: Button
  buttonShop: Button
  buttonWorkShop: Button
  buttonBank: Button

  lbData: ILeaderBoard
  leaderBoardList: Phaser.GameObjects.Container

  bg: Phaser.GameObjects.Container
  generalContainer: Phaser.GameObjects.Container
  startButtonBg: Phaser.GameObjects.NineSlice
  startButtonText: Phaser.GameObjects.Text
  startButtonSprite: Phaser.GameObjects.Sprite
  textNameGame: Phaser.GameObjects.Text

  walletContainer: Phaser.GameObjects.Container
  giftContainer: Phaser.GameObjects.Container
  giftTween: Phaser.Tweens.Tween

  widthGeneralPanel: number
  widthLeaderPanel: number

  init() {
    this.game.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this)
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.FOCUS)
      this.game.events.off(Phaser.Core.Events.BLUR)
    })

    const scrButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
    scrButton.on('down', () => this.saveScreenShot(this))
  }

  saveScreenShot(scene: Phaser.Scene) {
    scene.game.renderer.snapshot((image: HTMLImageElement) => {
      image.style.width = '160px'
      image.style.height = '120px'
      image.style.paddingLeft = '2px'

      const link = document.createElement('a')
      link.setAttribute('download', 'screenshot.png')
      link.setAttribute('href', image.src)
      link.click()
      link.remove()
    })
  }

  onFocus() {}
  onBlur() {}

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    // bg.
    const bg = this.add
      .image(this.game.scale.width / 2, this.game.scale.height / 2 + 50, 'bg')
      .setScale(1.3)

      .setDepth(-100)
    const bgOverlay = this.add.rectangle(
      this.game.scale.width / 2,
      this.game.scale.height / 2,
      this.game.scale.width,
      this.game.scale.height,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
      0.7
    )
    this.bg = this.add.container(0, 0, [bg, bgOverlay])

    this.widthGeneralPanel = this.game.scale.width - this.game.scale.width / 2
    this.widthLeaderPanel =
      GameOptions.isLeaderBoard && window?.getLB ? this.game.scale.width / 4 : 0
    const offset = (this.game.scale.width - this.widthGeneralPanel - this.widthLeaderPanel) / 2
    // console.log(
    //   this.widthGeneralPanel,
    //   this.widthLeaderPanel,
    //   this.game.scale.width,
    //   this.widthGeneralPanel + this.widthLeaderPanel
    // )

    if (GameOptions.isLeaderBoard && window?.getLB) {
      this.leaderBoardList = this.add.container(
        offset + this.widthLeaderPanel / 2,
        this.scale.height / 2 + 70,
        []
      )
    }

    // panel.
    this.textNameGame = this.add
      .text(this.game.scale.width / 2, 100, '#NameGame', {
        fontFamily: 'Arial',
        fontSize: 100,
        fontStyle: 'bold',
        color: GameOptions.colors.accent,
        align: 'center',
        lineSpacing: -25
      })
      .setDepth(1000)
      .setOrigin(0.5)

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
    this.generalContainer = this.add.container(
      offset + this.widthLeaderPanel + this.widthGeneralPanel / 2,
      this.game.scale.height / 2 + 70,
      []
    )

    this.giftContainer = this.add.container(
      this.generalContainer.x + 100,
      this.generalContainer.y - 300,
      []
    )
    // this.leaderBoardList.setX(offset + this.widthLeaderPanel / 2)

    this.rankContainer = this.add.container(
      this.generalContainer.x - this.widthGeneralPanel / 2 + 300,
      this.generalContainer.y - 440,
      []
    )
    // events.
    this.events.on('pause', () => {
      // this.click.pause()
    })
    this.events.on('resume', () => {
      this.tooglePanel(false)
    })

    this.tooglePanel(true)

    EventBus.emit('current-scene-ready', this)
    // EventBus.emit('start-game', null)

    EventBus.emit('sync-player-data')
    this.onSync(gameData, lang)
    // this.scene
    //   .get('Control')
    //   .onGameOverPlayer(
    //     this.lang?.gameOverTitle,
    //     this.lang?.gameOverPlayer,
    //     GameOptions.colors.accent,
    //     12345
    //   )

    this.createBlokGift()
    EventBus.emit('get-lb')
  }

  createPlayerUI() {
    this.generalContainer?.removeAll(true)
    this.walletContainer?.removeAll(true)
    this.rankContainer?.removeAll(true)

    const bgPanel = this.add.rectangle(
      0,
      0,
      this.widthGeneralPanel,
      this.scale.height - 200,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
      0.5
    )
    //.setOrigin(0)

    this.buttonBattle = new Button(
      this,
      this.widthGeneralPanel / 2 - 230,
      bgPanel.height / 2 - 90,
      400,
      150,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color,
      '',
      {
        color: GameOptions.colors.darkColor,
        fontSize: 50,
        fontStyle: 'bold',
        padding: {
          left: 30
        }
      },
      (pointer) => this.startGame(pointer)
    )

    this.buttonWorkShop = new Button(
      this,
      this.buttonBattle.x,
      this.buttonBattle.y - 140,
      400,
      90,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      '',
      {
        color: GameOptions.colors.darkColor
      },
      (pointer) => this.toggleWorkShop(pointer, true)
    )

    // this.buttonShop = new Button(
    //   this,
    //   GameOptions.isBank ? this.buttonBattle.x - 125 : this.buttonBattle.x,
    //   this.buttonBattle.y - 120,
    //   GameOptions.isBank ? 250 : 500,
    //   90,
    //   Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
    //   'shop',
    //   {
    //     color: GameOptions.colors.darkColor
    //   },
    //   (pointer) => this.toggleWorkShop(pointer, true)
    // )

    const coinImage = this.add.image(0, 0, SpriteKeys.Coin).setScale(1.4)
    this.textCoinValue = this.add
      .text(-35, 30, '12345', {
        fontFamily: 'Arial',
        fontSize: 55,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'right'
      })
      .setOrigin(1)
    this.walletContainer = this.add.container(
      this.generalContainer.x + this.widthGeneralPanel / 2 - 80,
      this.generalContainer.y / 2 - 100,
      [coinImage, this.textCoinValue]
    )

    // score and rank
    const rank = this.add
      .image(-65, 0, SpriteKeys.Ranks, getRank(this.gameData.score))
      .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color)
      .setScale(1.5)
    this.textNamePlayer = this.add
      .text(0, -40, getTrimName(this.gameData.name), {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 40,
        color: GameOptions.colors.lightColor,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
    this.textRank = this.add
      .text(0, 5, 'Current rank', {
        fontFamily: 'Arial',
        fontSize: 30,
        color: GameOptions.colors.lightColor,
        align: 'left'
      })
      .setAlpha(0.8)
      .setOrigin(0)

    this.textCountBattles = this.add
      .text(this.textRank.x, 40, replaceRegexByArray(this.lang.countBattle, [this.gameData.cb]), {
        fontFamily: 'Arial',
        fontSize: 25,
        color: GameOptions.colors.secondaryColorLight,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
      .setDepth(100)
    // .setVisible(false)

    this.rankContainer.add([rank, this.textCountBattles, this.textRank, this.textNamePlayer])

    this.generalContainer.add([bgPanel, this.buttonBattle, this.buttonWorkShop])

    if (GameOptions.isBank) {
      this.buttonBank = new Button(
        this,
        this.buttonWorkShop.x,
        this.buttonBattle.y - 250,
        400,
        90,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
        '',
        {
          color: GameOptions.colors.darkColor
        },
        (pointer) => {
          this.sound.play(KeySound.Click)
          this.openBank()
        }
      )
      this.generalContainer.add(this.buttonBank)
    }

    const buttonEditGerb = new Button(
      this,
      -this.widthGeneralPanel / 2 + 100,
      -this.generalContainer.y / 2 - 70,
      130,
      130,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      '',
      {},
      () => {
        this.scene.get('Message').showGerbs()
      }
    )
    const gerbImage = this.add
      .image(buttonEditGerb.x, buttonEditGerb.y, SpriteKeys.Gerb, this.gameData.gerbId)
      .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color)
      .setScale(1.1)
    this.generalContainer.add([buttonEditGerb, gerbImage])
  }

  // update() {
  //   // if (this.gameData && this.gameData.bestScore) {
  //   //   this.startButtonText.setText(this.lang.btn_continue || '#btn_continue')
  //   // } else {
  //   //   this.startButtonText.setText(this.lang.btn_startgame || '#btn_startgame')
  //   // }
  //   // pause
  //   // if (!this.game.scene.isPaused('Game')) {
  //   // } else {
  //   // }
  // }
  createGarazTabs() {
    if (this.garazPanel) {
      this.garazPanel?.removeAll(true)
      this.garazPanel?.destroy(true)
    }
    var configPlayer = {
      x: 0,
      y: 0,
      width: GameOptions.workshop.sideWidth - 150,
      height: this.game.scale.height - 50,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: this.generalContainer.x - GameOptions.workshop.sideWidth + 270,
        top: this.generalContainer.y - 320
      },
      orientation: 'y',

      keys: ['tanksPage'], //  'weaponsPage'
      keyScroll: 'scrollG',
      garaz: true
    }
    this.garazPanel = CreateGarazPanel(this, configPlayer).layout()
    // const garazContainer = this.add.container(-200, -400, [garazPanel])
    // this.generalContainer.add(garazContainer)
    // this.shopContainer.add(mainPanel)

    const storageSettings = getLocalStorage(GameOptions.localStorageSettingsName, {})
    for (const page of this.garazPanel.childrenMap.pages.children) {
      page.t = storageSettings[page.keey] || 0
    }
  }

  createTank() {
    const containerTank = getTankImage(this, this.gameData.tanks[this.gameData.activeTankIndex].id)
      .setAngle(-90)
      .setPosition(40, 430)
      .setScale(1)

    const gridItems = []

    const supportWeapons = getSupportWeapons(this.gameData.tanks[this.gameData.activeTankIndex].id)

    for (const weaponConfig of supportWeapons) {
      const myWeapon = this.gameData.weapons[weaponConfig.type]
      const image = this.add.image(150, 0, 'weapon', weaponConfig.frame).setScale(1.4)
      const countText = this.add
        .text(
          120,
          45,
          myWeapon ? myWeapon.toString() : weaponConfig.type == WeaponType.default ? '∞' : '0',
          {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: 40,
            color: GameOptions.colors.lightColor,
            stroke: '#000000',
            strokeThickness: 0,
            align: 'right'
          }
        )
        .setOrigin(1)

      const containerWeapon = this.add.container(0, 0, [image, countText])

      if (weaponConfig.type != WeaponType.default) {
        const buttonCartWeapon = new Button(
          this,
          260,
          0,
          150,
          80,
          Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color,
          this.lang.fill,
          {
            color: GameOptions.colors.lightColor,
            fontStyle: 'normal',
            fontSize: 25
          },
          () => {
            this.scene.bringToTop('Message')
            this.scene.get('Message').showCartWeapon(weaponConfig, () => {})
          }
        )
        containerWeapon.add(buttonCartWeapon)
      }

      gridItems.push(containerWeapon)
    }

    const gridWeapons = Phaser.Actions.GridAlign(gridItems, {
      width: 1,
      height: 10,
      cellWidth: 100,
      cellHeight: 100,
      x: 50,
      y: -(supportWeapons.length * 70)
    })

    const tankContainer = this.add.container(150, 0, [containerTank, ...gridWeapons])

    this.generalContainer.add(tankContainer)
  }

  tooglePanel(status: boolean) {
    this.leaderBoardList?.setVisible(status)
    this.textNameGame?.setVisible(status)
    this.bg.setVisible(status)
    this.rankContainer.setVisible(status)
    this.generalContainer.setVisible(status)

    // const sceneControl = this.scene.get('Control')
    // if (sceneControl) {
    //   sceneControl?.togglePause(!status)
    // }
  }

  toggleWorkShop(pointer: Phaser.Input.Pointer, hideHomeScene: boolean) {
    this.scene.bringToTop('Message')
    this.tooglePanel(!hideHomeScene)

    this.sound.play(KeySound.Click)

    const sceneWorkshop = this.game.scene.getScene('WorkShop')
    sceneWorkshop?.tooglePanel(true)
  }

  startGame(pointer: any) {
    window?.onGameplayStart && window.onGameplayStart()

    this.tooglePanel(false)
    this.garazPanel?.removeAll(true)

    this.sound.play(KeySound.Click)
    // this.scene.start('Game')
    this.scene.add('Game', new Game(), true, {
      data: this.gameData,
      lang: this.lang
    })
    // const sceneGame = this.game.scene.getScene('Game')
    // this.scene.start('Game')
    // sceneGame?.scene.start()

    const sceneControl = this.game.scene.getScene('Control')
    sceneControl?.tooglePanel(false)
    // sceneControl?.createHelloMessage()
    // EventBus.emit('toggle-lang-list')
  }

  stopGame() {
    window?.onGameplayStop && window.onGameplayStop()

    EventBus.emit('get-lb')

    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.onShutdown()
    this.scene.remove('Game')

    // console.log(this.sys.displayList.list)

    this.tooglePanel(true)
    this.createGarazTabs()

    // console.log(
    //   this.events.listeners('pause'),
    //   this.events.listeners('resume'),
    //   this.events.listeners('stop')
    // )
  }

  openBank() {
    // this.tooglePanel(false)
    this.scene.bringToTop('Bank')
    this.game.scene.getScene('Bank').toggle(true)
  }

  onSetLeaderBoard(data: ILeaderBoard) {
    this.lbData = JSON.parse(JSON.stringify(data))
    this.drawLeaderBoard()
  }

  drawLeaderBoard() {
    this.leaderBoardList?.removeAll(true)
    if (!this.lbData.entries.length) {
      return
    }

    const title =
      this.lbData.leaderboard.title.find((x) => x.lang == this.gameData.lang)?.value ||
      this.lang.leaderboard_title

    const bgLeaderBoard = this.add
      .rectangle(
        0,
        0,
        this.widthLeaderPanel,
        this.scale.height - 200,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
        0.7
      )
      .setOrigin(0.5)
    const leaderBoardTitle = this.add
      .text(-this.widthLeaderPanel / 2 + 30, -bgLeaderBoard.height / 2 + 30, title, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 40,
        color: GameOptions.colors.lightColor,
        // stroke: GameOptions.colors.lightColor,
        // strokeThickness: 0,
        align: 'left'
      })
      .setOrigin(0)
      .setDepth(100)

    this.leaderBoardList.add([bgLeaderBoard, leaderBoardTitle])
    const gridItems = []

    for (
      let i = 0;
      i < Phaser.Math.Clamp(this.lbData.entries.length, this.lbData.entries.length, 10);
      i++
    ) {
      const itemData = this.lbData.entries[i]
      if (!itemData) {
        return
      }

      const rankImage = this.add
        .image(40, 0, SpriteKeys.Ranks, getRank(itemData.score))
        .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color)
      const text = this.add
        .text(170, -32, itemData.name || this.lang.notName, {
          fontFamily: 'Arial',
          fontSize: 26,
          color: GameOptions.colors.lightColor,
          align: 'center'
        })
        .setDepth(111)
        .setOrigin(0)
      const score = this.add
        .text(170, 0, itemData.score.toString(), {
          fontFamily: 'Arial',
          fontSize: 30,
          fontStyle: 'bold',
          color: GameOptions.colors.lightColor,
          align: 'center'
        })
        .setDepth(111)
        .setOrigin(0)

      const nameImage = `image-${i}`
      if (this.textures.exists(nameImage)) {
        this.textures.remove(nameImage)
      }

      const img = this.add.image(120, 0, 'placeholder').setScale(0.8)
      this.load.image(
        nameImage,
        itemData.photo
        //'https://avatars.mds.yandex.net/get-yapic/21493/enc-949461d55ad8e9deb5fb42767a562a9cb258976f2c3ad874aa76c9afbae08952/islands-middle'
      )
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded so use instead of the placeholder
        img.setTexture(nameImage)
      })
      this.load.start()
      // this.toDataUrl(
      //   'https://avatars.mds.yandex.net/get-yapic/21493/enc-949461d55ad8e9deb5fb42767a562a9cb258976f2c3ad874aa76c9afbae08952/islands-middle',
      //   (myBase64) => {
      //     console.log(nameImage)

      //     const b = this.textures.addBase64(nameImage, myBase64)
      //     b.once('addtexture', (key) => {
      //       console.log(key, nameImage)

      //       if (key === nameImage) {
      //         img.setTexture(nameImage)
      //       } else {
      //         throw new Error('Wrong key: ' + key)
      //       }
      //     })
      //   }
      // )
      const item = this.add.container(0, i * 120, [rankImage, text, img, score]).setDepth(100)
      gridItems.push(item)
    }

    const gridOptions = Phaser.Actions.GridAlign(gridItems, {
      width: 1,
      height: 10,
      cellWidth: 500,
      cellHeight: 90,
      x: -this.widthLeaderPanel / 2 + 30,
      y: -bgLeaderBoard.height / 2 + 130
    })
    this.leaderBoardList.add(gridOptions)
  }

  toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
      var reader = new FileReader()
      reader.onloadend = function () {
        callback(reader.result)
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  }

  onCheckTank(index: number) {
    this.gameData.activeTankIndex = index
    EventBus.emit('save-data', this.gameData)
    this.createGarazTabs()
  }

  createBlokGift() {
    this.giftContainer?.removeAll(true)
    this.giftTween?.destroy()

    const nowDay = new Date()
    const lastDay = new Date(this.gameData.giftDay)
    const diff = Math.floor((nowDay - lastDay) / (1000 * 60 * 60 * 24))
    // console.log(lastDay, nowDay, diff)

    if (diff <= 0) {
      return
    }

    const bg = this.add
      .rectangle(
        -230,
        -50,
        400,
        100,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color,
        0.7
      )
      .setOrigin(0)
    const progress = this.add
      .rectangle(
        bg.x,
        bg.y,
        bg.width,
        bg.height,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color,
        0.2
      )
      .setOrigin(0)
    progress.displayWidth = 0
    const giftImage = this.add.image(-180, 0, SpriteKeys.Clipart, 9)
    const text = this.add
      .text(-130, -30, this.lang.giftHint, {
        fontFamily: 'Arial',
        fontSize: 24,
        color: GameOptions.colors.accent,
        align: 'left',
        wordWrap: {
          width: 300
        }
      })
      .setOrigin(0)

    const button = new Button(
      this,
      0,
      0,
      bg.width - 100,
      bg.height - 30,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color,
      this.lang.giftGet,
      {},
      () => {
        this.sound.play(KeySound.Click)
        this.scene.get('Message')?.showGiftDay()
        this.giftContainer?.removeAll(true)
        this.giftTween?.destroy()
      }
    ).setVisible(false)

    const diffPlayTime = new Date().getTime() - new Date(this.gameData.lastDay).getTime()

    const actualDuration = GameOptions.timeBeforeGift - diffPlayTime

    this.giftTween = this.tweens.addCounter({
      from: actualDuration,
      to: 0,
      duration: actualDuration,
      onUpdate: (tween) => {
        const v = tween.getValue()

        progress.displayWidth = v * (bg.width / GameOptions.timeBeforeGift)
        text.setText(
          replaceRegexByArray(this.lang.giftHint, [
            Math.floor(v / 60000),
            ((v % 60000) / 1000).toFixed(0)
          ])
        )
        // textContainer.alpha -= v * 0.005
      },
      onComplete: () => {
        text.setVisible(false)
        button.setVisible(true)
        // progress.destroy()
      }
    })

    this.giftContainer.add([bg, progress, giftImage, text, button])
  }

  onSyncPlayerData(playerData: IPlayerData) {
    this.playerData = JSON.parse(JSON.stringify(playerData))
    // console.log('onSyncPlayerData', this.playerData)
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.lang = lang
    this.gameData = JSON.parse(JSON.stringify(gameData))

    this.input.enabled = !!this.gameData.name

    this.createPlayerUI()

    // this.textCountBattles.setText(this.gameData.score.toString())
    this.textCoinValue.setText(this.gameData.coin.toString())

    this.createTank()
    this.createGarazTabs()

    this.changeLocale()
  }

  changeLocale() {
    if (!this.lang) return

    this.textRank.setText(this.lang.rank[getRank(this.gameData.score)] || '#rank')
    this.textNameGame.setText(this.lang.name_game || '#name_game')
    // if (this.gameData.bestScore) {
    //   this.startButtonText.setText(lang.btn_continue || '#btn_continue')
    // } else {
    //   this.startButtonText.setText(lang.btn_startgame || '#btn_startgame')
    // }

    this.buttonBattle?.setText(this.lang.btnToBattle || '#btnToBattle')
    this.buttonWorkShop?.setText(
      `${this.lang.workShopTitle} / ${this.lang.shopTitle}` || '#workShopTitle'
    )
    // this.buttonShop?.setText(this.lang.shopTitle || '#shopTitle')
    this.buttonBank?.setText(this.lang.bank || '#bank')
  }
}
