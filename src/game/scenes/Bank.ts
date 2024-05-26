import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions, SpriteKeys } from '../options/gameOptions'
import { IGameData, KeySound, PacketPaymentsType, TLang } from '../types'
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

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.95)
      .setInteractive()

    this.textTitle = this.add
      .text(0, -450, '#bank', {
        fontFamily: 'Arial',
        fontSize: 100,
        fontStyle: 'bold',
        color: GameOptions.colors.accent,
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
        color: GameOptions.colors.lightColor,
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
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      '#return',
      {},
      () => {
        this.sound.play(KeySound.Click)
        this.wrapperContainer.setVisible(false)

        this.scene.sendToBack('Bank')
        // const sceneGame = this.game.scene.getScene('Game')
        // sceneGame?.scene.resume()
      }
    )
    this.bodyContainer = this.add.container(0, 0, [])
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

    const packets = [...GameOptions.packetPaymentsAd]
    if (GameOptions.isPacketPortal) {
      packets.push(...GameOptions.packetPayments)
    }

    const items = []
    for (const packet of packets) {
      const itemContainer = this.add.container(0, 0, [])

      const boxBorder = this.add.rectangle(
        0,
        0,
        cellWidth - 10,
        cellHeight,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color
      )
      // this.add.nineslice(
      //   0,
      //   0,
      //   'shopPanel2',
      //   0,
      //   cellWidth,
      //   cellHeight,
      //   33,
      //   33,
      //   33,
      //   33
      // )

      const pictoImage = this.add.image(0, -90, packet.texture, packet.frame).setScale(1.7)
      const walletContainer = this.add.container(0, 0, [pictoImage])
      const coinImage = this.add.image(-50, 0, SpriteKeys.Coin)
      const totalCoin = packet.countCoin + packet.countCoin * this.gameData.rank
      const textCoinValue = this.add.text(-20, -18, totalCoin.toString(), {
        fontFamily: 'Arial',
        fontSize: 35,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'left'
      })
      walletContainer.add([coinImage, textCoinValue])

      if (packet.type === PacketPaymentsType.Ad) {
        const pictoType = this.add
          .image(-cellWidth / 2 + 40, 90, SpriteKeys.Clipart, 4)
          .setTint(Phaser.Display.Color.ValueToColor(GameOptions.colors.ad).color)

        if (!this.gameData.adb) {
          const buttonGet = new Button(
            this,
            0,
            100,
            cellWidth - 10,
            150,
            Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color,
            this.lang.getAdv,
            {
              fontFamily: 'Arial',
              fontSize: 30,
              fontStyle: 'bold',
              align: 'center',
              wordWrap: {
                width: 270
              }
            },
            () => {
              this.sound.play(KeySound.Click)
              if (window?.showRewardedAdv) {
                let coins = 0
                window.showRewardedAdv({
                  successC: () => {
                    this.addCoin(coins)
                  },
                  rewardC: () => {
                    coins = totalCoin
                  },
                  errorC: () => {
                    // TODO
                  }
                })
              } else {
                this.addCoin(totalCoin)
              }
            }
          )
          walletContainer.add([buttonGet])
        } else {
          const bgDisable = this.add.rectangle(
            0,
            100,
            cellWidth - 10,
            150,
            Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color
          )
          const disableText = this.add.text(-70, 80, this.lang.notAvailable, {
            fontFamily: 'Arial',
            fontSize: 30,
            align: 'center',
            wordWrap: {
              width: 200
            }
          })
          walletContainer.add([bgDisable, disableText])
        }
        walletContainer.add([pictoType])
      } else {
        const pictoType = this.add.image(-cellWidth / 2 + 55, 90, SpriteKeys.Clipart, 1)
        const buttonGet = new Button(
          this,
          0,
          100,
          cellWidth - 10,
          150,
          Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color,
          replaceRegexByArray(this.lang.getYan, [packet.cost.toString()]),
          {
            fontFamily: 'Arial',
            fontSize: 35,
            fontStyle: 'bold',
            align: 'center',
            wordWrap: {
              width: 200
            }
          },
          () => {
            this.sound.play(KeySound.Click)
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
      width: packets.length,
      height: 10,
      cellWidth,
      cellHeight,
      x: packets.length > 1 ? (-packets.length / 2) * cellWidth + cellWidth / 2 : 0,
      y: 0
    })
    this.bodyContainer.add(gridOptions)

    if (this.gameData.adb) {
      const text = this.add
        .text(25, 25, this.lang.adbMessage, {
          fontFamily: 'Arial',
          fontSize: 30,
          align: 'center',
          wordWrap: {
            width: 1000
          },
          color: GameOptions.colors.darkColor
        })
        .setOrigin(0)
      const bg = this.add
        .rectangle(
          0,
          0,
          text.width + 50,
          text.height + 50,
          Phaser.Display.Color.ValueToColor(GameOptions.colors.danger).color
        )
        .setOrigin(0)
      const message = this.add.container(-bg.width / 2, -600, [bg, text])
      this.bodyContainer.add(message)
    }
  }

  addCoin(value: number) {
    if (value) {
      this.gameData.coin += value
      this.sound.play(KeySound.AddCoin)
      this.rexUI.add
        .toast({
          x: GameOptions.screen.width / 2,
          y: GameOptions.screen.height / 2,

          background: this.rexUI.add.roundRectangle(
            0,
            0,
            2,
            2,
            20,
            Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color
          ),
          text: this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: 35,
            color: GameOptions.colors.darkColor,
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
  //   //   this.sound.play(KeySound.Click)
  //   //   this.messageBox.setVisible(false)
  //   //   sceneGame.scene?.resume()
  //   // })
  // }

  // showMessageCreateBomb() {
  //   this.sound.play(KeySound.Click)
  //   const sceneGame = this.game.scene.getScene('Game')
  //   sceneGame.scene?.pause()
  //   this.wrapperContainer.setVisible(true)
  //   // this.messageBoxText.setText('Create bomb by view adv?')
  //   this.buttonReturn.setVisible(true)
  //   this.buttonOk.setVisible(true)
  //   this.bomb.setVisible(false)
  //   this.textBody.setText(this.lang.create_bomb_help || '#create_bomb_help')
  //   this.buttonOk.once('pointerup', () => {
  //     this.sound.play(KeySound.Click)
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
