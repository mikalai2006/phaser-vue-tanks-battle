import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { Button } from '../objects/ui/Button'
import { IGameData, ILeaderBoard, TLang } from '../types'
import { CreateGarazPanel } from './WorkShop'
import Game from './Game'

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
  leaderBoardTitle: Phaser.GameObjects.Text
  leaderBoardList: Phaser.GameObjects.Container

  bg: Phaser.GameObjects.Container
  generalContainer: Phaser.GameObjects.Container
  startButtonBg: Phaser.GameObjects.NineSlice
  startButtonText: Phaser.GameObjects.Text
  startButtonSprite: Phaser.GameObjects.Sprite
  textNameGame: Phaser.GameObjects.Text

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
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
      this.leaderBoardList = this.add.container(200, 370, [])
      this.leaderBoardTitle = this.add
        .text(300, 320, 'Leader board', {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 40,
          color: GameOptions.ui.primaryColor,
          stroke: '#000000',
          strokeThickness: 0,
          align: 'center'
        })
        .setOrigin(0)
        .setDepth(100)
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
      this.leaderBoardList ? GameOptions.screen.width / 2 + 230 : GameOptions.screen.width / 2 - 20,
      600,
      []
    )
    this.rankContainer = this.add.container(
      this.leaderBoardList ? GameOptions.screen.width / 2 + 150 : GameOptions.screen.width / 2 - 80,
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
    EventBus.emit('start-create', null)
  }

  createPlayerUI() {
    this.generalContainer.removeAll(true)
    this.rankContainer.removeAll(true)

    this.buttonBattle = new Button(
      this,
      200,
      350,
      300,
      120,
      GameOptions.ui.accent.replace('#', '0x'),
      '',
      {},
      (pointer) => this.startGame(pointer)
    )

    this.buttonWorkShop = new Button(
      this,
      -100,
      350,
      300,
      120,
      GameOptions.ui.primaryColor,
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
    if (GameOptions.isBank) {
      this.buttonBank = new Button(
        this,
        350,
        -15,
        200,
        100,
        GameOptions.ui.primaryColor,
        '',
        {},
        (pointer) => {
          this.openBank()
        }
      )
      walletContainer.add(this.buttonBank)
    }

    // score and rank
    const rank = this.add
      .image(-105, 0, 'rank', this.gameData.rank)
      .setTint(GameOptions.ui.accent.replace('#', '0x'))
      .setScale(2)
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
      .text(-50, -55, 'Mikalai Parakhnevich', {
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

    this.generalContainer.add([this.buttonBattle, this.buttonWorkShop])
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
      width: GameOptions.workshop.sideWidth - 20,
      height: GameOptions.screen.height - 200,
      anchor: {
        top: 'top',
        left: 'left'
      },
      space: {
        left: this.leaderBoardList ? 950 : 700,
        top: 320
      },
      orientation: 'y',

      keys: ['tanks', 'artefact']
    }
    this.garazPanel = CreateGarazPanel(this, configPlayer).layout()
    // const garazContainer = this.add.container(-200, -400, [garazPanel])
    // this.generalContainer.add(garazContainer)
    // this.shopContainer.add(mainPanel)
  }

  createTank() {
    const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]
    const scale = 1
    const caterpillar1 = this.add
      .sprite(0, -GameOptions.tanks.items[activeTankData.levelTank].catYOffset, 'caterpillar', 0)
      .setScale(scale)
      .setTint(GameOptions.colors.caterpillar)
    const caterpillar2 = this.add
      .sprite(0, GameOptions.tanks.items[activeTankData.levelTank].catYOffset, 'caterpillar', 0)
      .setScale(scale)
      .setTint(GameOptions.colors.caterpillar)
    const tank = this.add
      .sprite(0, 0, 'tank', GameOptions.tanks.items[activeTankData.levelTank].frame)
      .setScale(scale)
    const tower = this.add
      .sprite(0, 0, 'tower', GameOptions.towers.items[activeTankData.levelTower].frame)
      .setScale(scale)
    const muzzle = this.add
      .sprite(
        -GameOptions.muzzles.items[0].offset.xOffset *
          GameOptions.muzzles.items[0].vert[0].x *
          scale,
        0,
        'muzzle',
        GameOptions.muzzles.items[activeTankData.levelMuzzle].frame
      )
      .setTint(0x111111)
      .setScale(scale)
    const tankContainer = this.add
      .container(0, 100, [caterpillar1, caterpillar2, tank, tower, muzzle])
      .setAngle(-90)

    this.generalContainer.add(tankContainer)
  }

  tooglePanel(status: boolean) {
    this.leaderBoardTitle?.setVisible(status)
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
    this.tooglePanel(!hideHomeScene)

    this.click.play()

    const sceneWorkshop = this.game.scene.getScene('WorkShop')
    sceneWorkshop?.tooglePanel(true)
  }

  startGame(pointer: any) {
    this.tooglePanel(false)
    this.garazPanel?.destroy()

    this.click.play()
    // this.scene.start('Game')
    this.scene.add('Game', new Game(), true, {
      data: this.gameData,
      lang: this.lang
    })
    // const sceneGame = this.game.scene.getScene('Game')
    // this.scene.start('Game')
    // sceneGame?.scene.start()
    // sceneGame?.onSetGameData()
    // sceneGame?.setLocale(this.lang)

    if (window && window.onGamePlayStart) {
      window.onGamePlayStart()
    }
    const sceneControl = this.game.scene.getScene('Control')
    sceneControl?.tooglePanel(false)
    // EventBus.emit('toggle-lang-list')
  }

  stopGame() {
    EventBus.emit('show-lb', true)
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
    this.game.scene.getScene('Bank').toggle(true)
  }
  onSetLeaderBoard(data: Ilb) {
    this.lbData = JSON.parse(JSON.stringify(data))
    this.drawLeaderBoard()
  }

  drawLeaderBoard() {
    // if (!this.leaderBoardList) {
    //   return
    // }
    // console.log('drawLeaderBoard: ', this.lbData)
    this.leaderBoardList?.removeAll(true)
    const bgLb = this.add
      .nineslice(30, -110, 'buttons', 0, 650, 750, 50, 50, 50, 50)
      .setTint(GameOptions.ui.panelBgColorLight)
      .setAlpha(0.9)
      .setOrigin(0)

    const bgLb2 = this.add
      .nineslice(30, -110, 'buttons', 1, 650, 750, 50, 50, 50, 50)
      .setTint(GameOptions.ui.panelBgColor)
      .setAlpha(0.9)
      .setOrigin(0)
    this.leaderBoardList.add([bgLb2, bgLb])

    for (let i = 0; i < 5; i++) {
      const itemData = this.lbData.entries[i]
      if (!itemData) return
      // const bg = this.add
      //   .nineslice(350, 0, 'panel', 0, 600, 150, 33, 33, 33, 33)
      //   .setTint(GameOptions.ui.panelBgColor)
      //   .setAlpha(0.8)
      //   .setOrigin(0.5, 0)
      //   .setInteractive({ useHandCursor: true })
      const text = this.add
        .text(200, 40, itemData.name, {
          fontFamily: 'Arial',
          fontSize: 30,
          color: GameOptions.ui.primaryColor,
          align: 'center'
        })
        .setDepth(111)
        .setOrigin(0)
      const score = this.add
        .text(200, 90, itemData.score.toString(), {
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

      const img = this.add.image(120, 80, 'placeholder').setScale(1)
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
      const item = this.add.container(0, i * 120, [text, img, score]).setDepth(100)

      this.leaderBoardList.add([item])
    }
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

  onSetGameData(data: IGameData) {
    this.gameData = JSON.parse(JSON.stringify(data))

    this.createPlayerUI()

    this.textScoreValue.setText(this.gameData.score.toString())
    this.textCoinValue.setText(this.gameData.coin.toString())

    // this.createTank()
    this.createGarazTabs()
    this.changeLocale()
  }

  setLocale(lang: TLang) {
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    if (!this.lang) return

    this.textRank.setText(this.lang.rank[this.gameData.rank] || '#rank')
    this.leaderBoardTitle?.setText(this.lang.leaderboard_title || '#leaderboard')
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
