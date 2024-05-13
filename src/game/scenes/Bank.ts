import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { IGameData, PacketPaymentsType, TLang } from '../types'
import { Button } from '../objects/ui/Button'
import { replaceRegexByArray } from '../utils/utils'

export class Bank extends Scene {
  constructor() {
    super('Bank')
  }

  gameData: IGameData
  lang: TLang

  wrapperContainer: Phaser.GameObjects.Container
  bodyContainer: Phaser.GameObjects.Container
  textTitle: Phaser.GameObjects.Text
  textBody: Phaser.GameObjects.Text
  buttonReturn: Button

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    this.click = this.sound.add('click')

    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.95)
      .setInteractive()

    this.textTitle = this.add
      .text(0, -450, '#bank', {
        fontFamily: 'Arial',
        fontSize: 100,
        fontStyle: 'bold',
        color: GameOptions.ui.accent,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 500
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)

    this.textBody = this.add
      .text(0, -340, '#bank', {
        fontFamily: 'Arial',
        fontSize: 40,
        fontStyle: 'bold',
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 1000
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)
    this.buttonReturn = new Button(
      this,
      0,
      320,
      300,
      120,
      GameOptions.ui.panelBgColor,
      '#return',
      {},
      () => {
        this.click.play()
        this.wrapperContainer.setVisible(false)

        this.scene.sendToBack('Bank')
        // const sceneGame = this.game.scene.getScene('Game')
        // sceneGame?.scene.resume()
      }
    )
    this.bodyContainer = this.add.container(-GameOptions.screen.width / 2.8, 0, [])
    this.wrapperContainer = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        messageOverlay,
        this.textTitle,
        this.textBody,
        this.bodyContainer,
        this.buttonReturn
      ])
      .setDepth(999999)
      .setVisible(false)

    EventBus.emit('current-scene-ready', this)

    this.onSync(gameData, lang)
  }

  createGridPacket() {
    this.bodyContainer.removeAll(true)
    const cellWidth = 350
    const cellHeight = 350

    const items = []
    for (const packet of GameOptions.packetPayments) {
      const itemContainer = this.add.container(0, 0, [])

      const boxBorder = this.add.nineslice(
        0,
        0,
        'shopPanel2',
        0,
        cellWidth,
        cellHeight,
        33,
        33,
        33,
        33
      )

      const pictoImage = this.add.image(0, -90, packet.texture, packet.frame).setScale(1.7)
      const walletContainer = this.add.container(0, 0, [pictoImage])
      const coinImage = this.add.image(-50, 0, 'coin')
      const textCoinValue = this.add.text(-20, -18, packet.countCoin.toString(), {
        fontFamily: 'Arial',
        fontSize: 35,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'left'
      })
      walletContainer.add([coinImage, textCoinValue])

      if (packet.type === PacketPaymentsType.Ad) {
        const pictoType = this.add.image(-cellWidth / 2 + 50, 90, 'clipart', 4)
        const buttonGet = new Button(
          this,
          0,
          100,
          cellWidth,
          150,
          GameOptions.ui.panelBgColor,
          this.lang.getAdv,
          {
            fontFamily: 'Arial',
            fontSize: 30,
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: {
              width: 270
            }
          },
          () => {
            if (window.showRewardedAdv) {
              EventBus.emit('show-reward-adv', () => {
                // console.log('SHOW show-reward-adv')
                this.addCoin(packet.countCoin)
              })
            } else {
              this.addCoin(packet.countCoin)
            }
          }
        )
        walletContainer.add([buttonGet, pictoType])
      } else {
        const pictoType = this.add.image(-cellWidth / 2 + 55, 90, 'clipart', 1)
        const buttonGet = new Button(
          this,
          0,
          100,
          cellWidth,
          150,
          GameOptions.ui.panelBgColor,
          replaceRegexByArray(this.lang.getYan, [packet.cost.toString()]),
          {
            fontFamily: 'Arial',
            fontSize: 35,
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: {
              width: 200
            }
          },
          () => {
            if (window.onPurchase) {
              window.onPurchase(packet.id, () => {
                this.addCoin(packet.countCoin)
              })
            } else {
              this.addCoin(packet.countCoin)
            }
          }
        )
        walletContainer.add([buttonGet, pictoType])
      }

      itemContainer.add([boxBorder, walletContainer])

      items.push(itemContainer)
    }

    const gridOptions = Phaser.Actions.GridAlign(items, {
      width: 10,
      height: 3,
      cellWidth,
      cellHeight,
      x: 0,
      y: 0
    })
    this.bodyContainer.add(gridOptions)
  }

  addCoin(value: number) {
    this.gameData.coin += value
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
      .showMessage(replaceRegexByArray(this.lang.getCoinSuccess, [value.toString()]))
      .showMessage(this.lang.backToBank)
    EventBus.emit('save-data', this.gameData)
  }

  // showMessageAddBonusBomb(text: string) {
  //   this.addbonus.play()
  //   const sceneGame = this.game.scene.getScene('Game')
  //   sceneGame.scene?.pause()
  //   this.wrapperContainer.setVisible(true)
  //   this.textBody.setText(text)
  //   this.buttonReturn.setVisible(false)
  //   this.buttonOk.setVisible(false)
  //   this.bomb.setVisible(true)
  //   // this.messageBoxButtonNext.once('pointerup', () => {
  //   //   this.click.play()
  //   //   this.messageBox.setVisible(false)
  //   //   sceneGame.scene?.resume()
  //   // })
  // }

  // showMessageCreateBomb() {
  //   this.click.play()
  //   const sceneGame = this.game.scene.getScene('Game')
  //   sceneGame.scene?.pause()
  //   this.wrapperContainer.setVisible(true)
  //   // this.messageBoxText.setText('Create bomb by view adv?')
  //   this.buttonReturn.setVisible(true)
  //   this.buttonOk.setVisible(true)
  //   this.bomb.setVisible(false)
  //   this.textBody.setText(this.lang.create_bomb_help || '#create_bomb_help')
  //   this.buttonOk.once('pointerup', () => {
  //     this.click.play()
  //     this.wrapperContainer.setVisible(false)
  //     // sceneGame?.scene.resume()
  //     this.onUpdateOption()
  //   })
  // }
  toggle(status: boolean) {
    this.createGridPacket()
    this.wrapperContainer.setVisible(status)
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.gameData = JSON.parse(JSON.stringify(gameData))
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    this.buttonReturn.setText(this.lang.return || '#return')
    this.textTitle.setText(this.lang.bank || '#bank')
    this.textBody.setText(this.lang.bankDescription || '#bankDescription')
  }
}
