import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions, WeaponType } from '../options/gameOptions'
import { Button } from '../objects/ui/Button'
import { IGameData, ILeaderBoard, TLang } from '../types'
import { CreateGarazPanel } from './WorkShop'
import Game from './Game'
import { getRank, getTankImage } from '../utils/utils'
import { getLocalStorage } from '../utils/storageUtils'

export class Home extends Scene {
  constructor() {
    super('Home')
  }

  gameData: IGameData

  lang: TLang
  textRank: Phaser.GameObjects.Text
  textCoinValue: Phaser.GameObjects.Text
  textScoreValue: Phaser.GameObjects.Text
  textNamePlayer: Phaser.GameObjects.Text
  rankContainer: Phaser.GameObjects.Container
  garazPanel: any

  buttonBattle: Button
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

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    this.click = this.sound.add('click')

    // bg.
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

    if (GameOptions.isLeaderBoard) {
      this.leaderBoardList = this.add.container(150, 370, [])
    }

    // panel.
    this.textNameGame = this.add
      .text(GameOptions.screen.width / 2, 100, '#NameGame', {
        fontFamily: 'Arial',
        fontSize: 100,
        fontStyle: 'bold',
        color: GameOptions.ui.accent, //GameOptions.ui.accent,
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
      this.leaderBoardList ? GameOptions.screen.width / 2 + 50 : GameOptions.screen.width / 2 - 150,
      600,
      []
    )
    this.rankContainer = this.add.container(
      this.leaderBoardList ? GameOptions.screen.width / 2 - 50 : GameOptions.screen.width / 2 - 210,
      220,
      []
    )
    // events.
    this.events.on('pause', () => {
      this.click.pause()
    })
    this.events.on('resume', () => {
      this.tooglePanel(false)
    })

    this.tooglePanel(true)

    EventBus.emit('current-scene-ready', this)
    // EventBus.emit('start-game', null)

    this.onSync(gameData, lang)
    // this.scene
    //   .get('Control')
    //   .onGameOverPlayer(
    //     this.lang?.gameOverTitle,
    //     this.lang?.gameOverPlayer,
    //     GameOptions.ui.dangerText,
    //     12345
    //   )
    EventBus.emit('get-lb')
  }

  createPlayerUI() {
    this.generalContainer?.removeAll(true)
    this.rankContainer?.removeAll(true)

    this.buttonBattle = new Button(
      this,
      550,
      400,
      400,
      120,
      GameOptions.ui.accent.replace('#', '0x'),
      '',
      {},
      (pointer) => this.startGame(pointer)
    )

    this.buttonWorkShop = new Button(
      this,
      -80,
      this.buttonBattle.y,
      350,
      120,
      GameOptions.ui.panelBgColor,
      '',
      {},
      (pointer) => this.toggleWorkShop(pointer, true)
    )

    const coinImage = this.add.image(0, 0, 'coin')
    this.textCoinValue = this.add.text(30, -18, '12345', {
      fontFamily: 'Arial',
      fontSize: 35,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'left'
    })
    const walletContainer = this.add.container(-30, 50, [coinImage, this.textCoinValue])

    // score and rank
    const rank = this.add
      .image(-105, 0, 'rank', getRank(this.gameData.score))
      .setTint(GameOptions.ui.accent.replace('#', '0x'))
      .setScale(1.5)
    this.textScoreValue = this.add
      .text(-50, 10, '', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 40,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
      .setDepth(100)
      .setVisible(false)
    this.textNamePlayer = this.add
      .text(-50, -55, this.gameData.name, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 40,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
      .setDepth(100)
    this.textRank = this.add
      .text(-50, -10, 'Current rank', {
        fontFamily: 'Arial',
        fontSize: 30,
        color: GameOptions.ui.primaryColor,
        align: 'left'
      })
      .setAlpha(0.8)
      .setOrigin(0)
      .setDepth(100)

    this.rankContainer.add([
      rank,
      this.textScoreValue,
      this.textRank,
      this.textNamePlayer,
      walletContainer
    ])

    const bgPanel = this.add.rectangle(-280, -440, 1050, 900, 0xffffff, 0.1).setOrigin(0)
    this.generalContainer.add([bgPanel, this.buttonBattle, this.buttonWorkShop])

    if (GameOptions.isBank) {
      this.buttonBank = new Button(
        this,
        220,
        this.buttonBattle.y,
        250,
        120,
        GameOptions.ui.panelBgColor,
        '',
        {},
        (pointer) => {
          this.openBank()
        }
      )
      this.generalContainer.add(this.buttonBank)
    }
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
    }
    var configPlayer = {
      x: 0,
      y: 0,
      width: GameOptions.workshop.sideWidth - 120,
      height: GameOptions.screen.height - 140,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: this.leaderBoardList ? 760 : 560,
        top: 320
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
      .setScale(1.5)

    const gridItems = []

    for (const weaponConfig of GameOptions.weaponObjects) {
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
            color: GameOptions.ui.white,
            stroke: '#000000',
            strokeThickness: 0,
            align: 'right'
          }
        )
        .setOrigin(1)
      const containerWeapon = this.add.container(0, 0, [image, countText])

      gridItems.push(containerWeapon)
    }

    const gridWeapons = Phaser.Actions.GridAlign(gridItems, {
      width: 1,
      height: 10,
      cellWidth: 100,
      cellHeight: 100,
      x: 550,
      y: -150
    })

    const gerbImage = this.add.image(0, -530, 'gerb', this.gameData.gerbId).setScale(1.2)
    const buttonEditGerb = new Button(
      this,
      210,
      -530,
      300,
      100,
      GameOptions.ui.panelBgColor,
      this.lang.gerbEdit,
      {},
      () => {
        this.scene.get('Message').showGerbs()
      }
    )

    const tankContainer = this.add.container(400, 150, [containerTank, gerbImage, buttonEditGerb])

    this.generalContainer.add([tankContainer, ...gridWeapons])
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
    // window.getLB && window.getLB()
  }

  toggleWorkShop(pointer: Phaser.Input.Pointer, hideHomeScene: boolean) {
    this.scene.bringToTop('Message')
    this.tooglePanel(!hideHomeScene)

    this.click.play()

    const sceneWorkshop = this.game.scene.getScene('WorkShop')
    sceneWorkshop?.tooglePanel(true)
  }

  startGame(pointer: any) {
    this.tooglePanel(false)
    this.garazPanel?.removeAll(true)

    this.click.play()
    // this.scene.start('Game')
    this.scene.add('Game', new Game(), true, {
      data: this.gameData,
      lang: this.lang
    })
    // const sceneGame = this.game.scene.getScene('Game')
    // this.scene.start('Game')
    // sceneGame?.scene.start()

    if (window && window.onGamePlayStart) {
      window.onGamePlayStart()
    }
    const sceneControl = this.game.scene.getScene('Control')
    sceneControl?.tooglePanel(false)
    // sceneControl?.createHelloMessage()
    // EventBus.emit('toggle-lang-list')
  }

  stopGame() {
    EventBus.emit('get-lb')

    this.tooglePanel(true)
    this.createGarazTabs()

    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.onShutdown()
    sceneGame?.scene.remove()

    if (window && window.onGameplayStop) {
      window.onGameplayStop()
    }
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
    const title =
      this.lbData.leaderboard.title.find((x) => x.lang == this.gameData.lang)?.value ||
      this.lang.leaderboard_title

    const leaderBoardTitle = this.add
      .text(50, -195, title, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 40,
        color: GameOptions.ui.white,
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0)
      .setDepth(100)

    const bgLb2 = this.add.rectangle(0, -210, 550, 900, 0x000000, 0.4).setOrigin(0)

    this.leaderBoardList.add([bgLb2, leaderBoardTitle])
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
        .image(40, 0, 'rank', getRank(itemData.score))
        .setTint(GameOptions.ui.accentNumber)
      const text = this.add
        .text(170, -32, itemData.name, {
          fontFamily: 'Arial',
          fontSize: 26,
          color: GameOptions.ui.white,
          align: 'center'
        })
        .setDepth(111)
        .setOrigin(0)
      const score = this.add
        .text(170, 0, itemData.score.toString(), {
          fontFamily: 'Arial',
          fontSize: 30,
          fontStyle: 'bold',
          color: GameOptions.ui.primaryColor,
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
      cellHeight: 80,
      x: 30,
      y: -90
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

  onSync(gameData: IGameData, lang: TLang) {
    this.lang = lang
    this.gameData = JSON.parse(JSON.stringify(gameData))

    this.input.enabled = !!this.gameData.name

    this.createPlayerUI()

    this.textScoreValue.setText(this.gameData.score.toString())
    this.textCoinValue.setText(this.gameData.coin.toString())

    this.createTank()
    this.createGarazTabs()
    this.changeLocale()

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
    //.setText(this.lang.current_score || '#current_score')

    this.buttonBattle?.setText(this.lang.btnToBattle || '#btnToBattle')
    this.buttonWorkShop?.setText(this.lang.workShopTitle || '#workShopTitle')
    this.buttonBank?.setText(this.lang.bank || '#bank')
  }
}
