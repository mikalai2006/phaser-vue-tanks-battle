import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { IGameData, TLang } from '@/App.vue'

export class Record extends Scene {
  constructor() {
    super('Record')
  }

  gameData: IGameData

  lang: TLang
  scoreText: Phaser.GameObjects.Text
  scoreValueText: Phaser.GameObjects.Text
  recordText: Phaser.GameObjects.Text
  bestScoreText: Phaser.GameObjects.Text
  bestScoreContainer: Phaser.GameObjects.Container

  bg: Phaser.GameObjects.Image
  startButton: Phaser.GameObjects.Container
  startButtonBg: Phaser.GameObjects.NineSlice
  startButtonText: Phaser.GameObjects.Text
  startButtonSprite: Phaser.GameObjects.Sprite
  textName: Phaser.GameObjects.Text

  record_level_5000: Phaser.GameObjects.Image
  record_level_1000: Phaser.GameObjects.Image
  record_level_500: Phaser.GameObjects.Image
  record_level_250: Phaser.GameObjects.Image
  record_level_100: Phaser.GameObjects.Image
  record_level_50: Phaser.GameObjects.Image
  record_level_10: Phaser.GameObjects.Image
  record_crown: Phaser.GameObjects.Image
  record_boom: Phaser.GameObjects.Image
  record_boom_5: Phaser.GameObjects.Image
  record_boom_10: Phaser.GameObjects.Image
  record_boom_15: Phaser.GameObjects.Image
  record_boom_20: Phaser.GameObjects.Image

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.click = this.sound.add('click')

    // bg.
    this.bg = this.add
      .image(GameOptions.screen.width / 2, GameOptions.screen.height / 2, 'heroboard')
      .setTint(GameOptions.ui.panelBgColor)
      .setDepth(-100)

    // // panel.
    // this.textName = this.add
    //   .text(GameOptions.screen.width / 2, 200, '#NameGame', {
    //     fontFamily: 'Arial Black',
    //     fontSize: 100,
    //     color: GameOptions.ui.accent,
    //     align: 'center'
    //   })
    //   .setDepth(1000)
    //   .setOrigin(0.5)

    // records.
    this.record_boom_5 = this.add
      .image(60, 400, 'record_boom_5')
      .setTint(0xfde047)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_boom_10 = this.add
      .image(260, 150, 'record_boom_10')
      .setTint(0xfacc15)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_boom_15 = this.add
      .image(550, 150, 'record_boom_15')
      .setTint(0xeab308)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_boom_20 = this.add
      .image(750, 400, 'record_boom_20')
      .setTint(0xca8a04)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_boom = this.add
      .image(380, 420, 'record_boom')
      .setTint(0xffff00)
      .setScale(0.6)
      .setDepth(10)
      .setOrigin(0)
    this.record_crown = this.add
      .image(340, 720, 'record_crown')
      .setTint(0x8b5cf6)
      .setScale(0.8)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_10 = this.add
      .image(60, 770, 'record_level_10')
      .setTint(0x84cc16)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_50 = this.add
      .image(770, 770, 'record_level_50')
      .setTint(0x0ea5e9)
      .setScale(0.5)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_100 = this.add
      .image(-20, 1070, 'record_level_100')
      .setTint(0x14b8a6)
      .setScale(0.6)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_250 = this.add
      .image(800, 1070, 'record_level_250')
      .setTint(0x14b8a6)
      .setScale(0.6)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_500 = this.add
      .image(0, 1530, 'record_level_500')
      .setTint(0x14b8a6)
      .setScale(0.6)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_1000 = this.add
      .image(700, 1500, 'record_level_1000')
      .setTint(0x14b8a6)
      .setScale(0.7)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_5000 = this.add
      .image(300, 1100, 'record_level_5000')
      .setTint(0xd946ef)
      .setScale(1)
      .setDepth(10)
      .setOrigin(0)
    this.record_level_5000.preFX.setPadding(8)
    const fx = this.record_level_5000.preFX.addGlow(0xffffff, 3, 0, false, 0.1, 32)
    // this.tweens.add({
    //   targets: fx,
    //   outerStrength: 10,
    //   yoyo: true,
    //   loop: -1,
    //   ease: 'sine.inout'
    // })
    // this.bestScoreText = this.add
    //   .text(170, 90, '', {
    //     fontFamily: 'Arial',
    //     fontSize: 60,
    //     color: '#ffffff',
    //     stroke: '#000000',
    //     strokeThickness: 0,
    //     align: 'center'
    //   })
    //   .setOrigin(0)
    //   .setDepth(100)
    // this.recordText = this.add
    //   .text(185, 50, '', {
    //     fontFamily: 'Arial',
    //     fontSize: 30,
    //     color: '#ffffff',
    //     // stroke: '#000000',
    //     // strokeThickness: 0,
    //     align: 'right'
    //   })
    //   .setAlpha(0.8)
    //   .setOrigin(0)
    //   .setDepth(100)
    // this.bestScoreContainer = this.add.container(GameOptions.screen.width / 2 - 300, 250, [
    //   rate,
    //   this.bestScoreText,
    //   this.recordText
    // ])

    // // start game button.
    // this.startButtonBg = this.add
    //   .nineslice(0, 0, 'button', 0, 500, 250, 33, 33, 33, 33)
    //   .setTint(GameOptions.ui.activeTextNumber)
    //   .setAlpha(1)
    //   .setOrigin(0.5)
    //   .setInteractive({ useHandCursor: true })
    // this.startButtonText = this.add
    //   .text(0, 50, '#startGame', {
    //     fontFamily: 'Arial',
    //     fontSize: 50,
    //     color: '#000',
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

    // this.scoreText = this.add
    //   .text(0, -80, 'Current score', {
    //     fontFamily: 'Arial',
    //     fontSize: 30,
    //     color: '#000000',
    //     align: 'left'
    //   })
    //   .setAlpha(0.8)
    //   .setOrigin(0.5)
    //   .setDepth(100)
    // this.scoreValueText = this.add
    //   .text(0, -40, '123456789012345', {
    //     fontFamily: 'Arial',
    //     fontSize: 50,
    //     color: '#000000',
    //     align: 'left'
    //   })
    //   .setAlpha(0.8)
    //   .setOrigin(0.5)
    //   .setDepth(100)

    // this.startButton = this.add.container(GameOptions.screen.width / 2, 550, [
    //   this.startButtonBg,
    //   this.startButtonText,
    //   this.scoreText,
    //   this.scoreValueText
    // ]) //.setInteractive()

    // // events.
    // this.events.on('pause', () => {
    //   this.click.pause()
    // })
    // this.events.on('resume', () => {
    //   this.tooglePanel(false)
    // })

    // // this.drawLeaderBoard()

    // this.tooglePanel(true)

    EventBus.emit('current-scene-ready', this)
  }

  update() {
    // if (this.gameData.bestScore) {
    //   this.startButtonText.setText(this.lang.btn_continue || '#btn_continue')
    // } else {
    //   this.startButtonText.setText(this.lang.btn_startgame || '#btn_startgame')
    // }
    // pause
    // if (!this.game.scene.isPaused('Game')) {
    // } else {
    // }
  }

  tooglePanel(status: boolean) {
    this.textName?.setVisible(status)
    this.bg.setVisible(status)
    this.bestScoreContainer.setVisible(status)
    this.startButton.setVisible(status)

    const sceneControl = this.scene.get('Control')
    if (sceneControl) {
      sceneControl?.togglePause(!status)
    }
    EventBus.emit('show-lb', status)
  }

  startGame(pointer: any) {
    this.tooglePanel(false)

    this.click.play()
    // this.scene.start('Game')
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame?.scene.start()

    if (window && window.onGamePlayStart) {
      window.onGamePlayStart()
    }
    // const sceneGame = this.game.scene.getScene('Game')
    // sceneGame?.onSetGameData(this.gameData)
    // EventBus.emit('toggle-lang-list')
  }

  stopGame() {
    this.tooglePanel(true)

    const sceneGame = this.game.scene.getScene('Game')
    this.click.play()
    sceneGame?.scene.stop()

    if (window && window.onGameplayStop) {
      window.onGameplayStop()
    }
  }

  // drawLeaderBoard() {
  //   this.leaderBoardList.removeAll()

  //   for (let i = 0; i < 7; i++) {
  //     const bg = this.add
  //       .nineslice(350, 0, 'panel', 0, 600, 150, 33, 33, 33, 33)
  //       .setTint(GameOptions.ui.buttonBgColor)
  //       .setAlpha(0.8)
  //       .setOrigin(0.5, 0)
  //       .setInteractive({ useHandCursor: true })
  //     const text = this.add
  //       .text(200, 40, 'Mikalai Parakhnevich', {
  //         fontFamily: 'Arial',
  //         fontSize: 30,
  //         color: '#ffffff',
  //         align: 'center'
  //       })
  //       .setDepth(111)
  //       .setOrigin(0)
  //     const score = this.add
  //       .text(200, 90, '5456456333', {
  //         fontFamily: 'Arial',
  //         fontSize: 30,
  //         color: '#ffffff',
  //         align: 'center'
  //       })
  //       .setDepth(111)
  //       .setOrigin(0)

  //     const img = this.add.image(120, 80, '').setScale(2)
  //     this.toDataUrl(
  //       'https://avatars.mds.yandex.net/get-yapic/21493/enc-949461d55ad8e9deb5fb42767a562a9cb258976f2c3ad874aa76c9afbae08952/islands-middle',
  //       (myBase64) => {
  //         const nameImage = `image-${i}`
  //         console.log(nameImage)

  //         const b = this.textures.addBase64(nameImage, myBase64)
  //         b.once('addtexture', (key) => {
  //           console.log(key, nameImage)

  //           if (key === nameImage) {
  //             img.setTexture(nameImage)
  //           } else {
  //             throw new Error('Wrong key: ' + key)
  //           }
  //         })
  //       }
  //     )
  //     const item = this.add.container(0, i * 160, [bg, text, img, score]).setDepth(100)

  //     this.leaderBoardList.add([item])
  //   }
  // }

  // toDataUrl(url, callback) {
  //   var xhr = new XMLHttpRequest()
  //   xhr.onload = function () {
  //     var reader = new FileReader()
  //     reader.onloadend = function () {
  //       callback(reader.result)
  //     }
  //     reader.readAsDataURL(xhr.response)
  //   }
  //   xhr.open('GET', url)
  //   xhr.responseType = 'blob'
  //   xhr.send()
  // }

  onSetGameData(data: IGameData) {
    this.gameData = JSON.parse(JSON.stringify(data))

    this.bestScoreText.setText(this.gameData.bestScore.toString())
    this.scoreValueText.setText(this.gameData.totalScore.toString())
  }

  changeLocale(lang: TLang) {
    this.lang = lang

    this.textName.setText(lang.name_game || '#name_game')
    // if (this.gameData.bestScore) {
    //   this.startButtonText.setText(lang.btn_continue || '#btn_continue')
    // } else {
    //   this.startButtonText.setText(lang.btn_startgame || '#btn_startgame')
    // }
    this.recordText.setText(lang.record || '#record')
    this.scoreText.setText(lang.current_score || '#current_score')
  }
}
