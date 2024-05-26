import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions, SpriteKeys, WeaponType } from '../options/gameOptions'
import { IComplexConfig, IGameData, IWeaponObject, KeySound, TLang } from '../types'
import { Button } from '../objects/ui/Button'
import {
  getEnumStringKey,
  getMaxOptionValue,
  getRank,
  getTankImage,
  replaceRegexByArray,
  shuffle
} from '../utils/utils'
import { createTableGerb } from './WorkShop'

export class Message extends Scene {
  constructor() {
    super('Message')
  }

  gameData: IGameData
  lang: TLang

  messageBox: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Container
  textBody: Phaser.GameObjects.Text
  textTitle: Phaser.GameObjects.Text
  buttonOk: Button
  buttonCancel: Button
  buttonWell: Button

  create({ lang, gameData }: { lang: TLang; gameData: IGameData }) {
    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.8)
      .setInteractive()

    const bgBox = this.add
      .rectangle(
        0,
        0,
        1000,
        900,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.darkColor).color
      )
      .setAlpha(0.9)
    this.textTitle = this.add
      .text(0, -370, 'Message', {
        fontFamily: 'Arial',
        fontSize: 40,
        fontStyle: 'bold',
        color: GameOptions.colors.accent,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 900
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)
    this.textBody = this.add
      .text(0, -300, 'Message', {
        fontFamily: 'Arial',
        fontSize: 40,
        color: GameOptions.colors.lightColor,
        stroke: '#000000',
        strokeThickness: 0,
        wordWrap: {
          width: 800
        },
        align: 'center'
      })
      .setOrigin(0.5, 0)

    this.buttonOk = new Button(
      this,
      170,
      320,
      300,
      120,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      'ok',
      {
        fontSize: 40
      },
      () => {}
    )

    this.buttonWell = new Button(
      this,
      0,
      320,
      300,
      120,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      this.lang?.well,
      {
        fontSize: 40
      },
      () => {
        this.sound.play(KeySound.Click)
        this.messageBox.setVisible(false)
        const sceneGame = this.scene.get('Game')
        sceneGame?.scene.resume()
      }
    )
    this.buttonCancel = new Button(
      this,
      -170,
      320,
      300,
      120,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonSecondary).color,
      'ok',
      {
        fontSize: 40
      },
      () => {
        this.sound.play(KeySound.Click)
        this.messageBox.setVisible(false)
        const sceneGame = this.scene.get('Game')
        sceneGame?.scene.resume()
      }
    )
    this.body = this.add.container(0, 0, [])
    this.messageBox = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        messageOverlay,
        bgBox,
        this.textTitle,
        this.textBody,
        this.body,
        this.buttonOk,
        this.buttonCancel,
        this.buttonWell
      ])
      .setDepth(999999)
      .setVisible(false)

    EventBus.emit('current-scene-ready', this)

    this.onSync(gameData, lang)
  }

  showGerbs() {
    this.sound.play(KeySound.Click)

    this.body.removeAll(true)
    this.messageBox.setVisible(true)
    this.buttonWell.setVisible(false)
    this.buttonCancel.setVisible(false)
    this.buttonOk.setVisible(true)
    this.buttonOk.setText(this.lang.return)
    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      // this.scene.get('WorkShop').onSellTank(id, cost)
    })

    this.textTitle.setText(this.lang.gerbCheckTitle)
    this.textBody.setText(this.lang.gerbCheckDescription)

    // const items = []
    // for (let i = 0; i < GameOptions.countGerb; i++) {
    //   const bg = this.add.rectangle(0, 0, 100, 100, 0x000000, 0.7)
    //   const image = this.add.image(0, 0, SpriteKeys.Gerb, i)

    //   const container = this.add.container(0, 0, [bg, image])
    //   items.push(container)
    // }

    // const gridLogos = Phaser.Actions.GridAlign(items, {
    //   width: 9,
    //   height: 10,
    //   cellWidth: 100,
    //   cellHeight: 100,
    //   x: -400,
    //   y: -130
    // })

    const tableGerbs = createTableGerb(this, () => {
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
        .showMessage(this.lang.gerbToast)
      this.messageBox.setVisible(false)
    })
    const container = this.add.container(-450, -100, [tableGerbs])

    this.body.add(container)
  }

  showSellTank(id: string) {
    this.sound.play(KeySound.Click)

    const sellTank = this.gameData.tanks.find((x) => x.id == id)
    if (!sellTank) {
      return
    }
    const configTank = GameOptions.complexTanks.find((x) => x.id == id)
    const cost = Math.round(configTank.cost / 2)

    this.body.removeAll(true)
    this.messageBox.setVisible(true)
    this.buttonWell.setVisible(false)
    this.buttonCancel.setVisible(true)
    this.buttonOk.setVisible(true)
    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      this.scene.get('WorkShop').onSellTank(id, cost)
    })

    this.textTitle.setText(
      replaceRegexByArray(this.lang.sellTitle, [configTank.name]) || '#sellTitle'
    )
    this.textBody.setText(replaceRegexByArray(this.lang.sellDescription, [configTank.name]))
    const containerTank = getTankImage(this, sellTank.id).setAngle(-90).setScale(1.5)
    const coinImage = this.add.image(-105, 180, SpriteKeys.Coin).setScale(1.5)
    const coinText = this.add.text(-65, 150, cost.toString(), {
      fontFamily: 'Arial',
      fontSize: 50,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'left'
    })

    this.body.add([containerTank, coinImage, coinText])
  }

  showUpdate(option: string) {
    this.sound.play(KeySound.Click)
    this.body.removeAll(true)
    this.messageBox.setVisible(true)
    this.buttonCancel.setVisible(true)
    this.buttonOk.setVisible(false)
    this.buttonWell.setVisible(false)
    this.textTitle.setText(
      `${this.lang.updateTitle} ${GameOptions.complexTanks[this.gameData.activeTankIndex].name}` ||
        '#updateTitle'
    )

    const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]
    const optionValue = activeTankData[option]
    const sliderWidth = 600
    const progressBg = this.add
      .rectangle(
        -sliderWidth / 2,
        5,
        sliderWidth,
        30,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColorLight).color,
        0.5
      )
      .setOrigin(0)
    const maximumOptionValue = getMaxOptionValue(option, activeTankData.id)
    const rangeSlider = maximumOptionValue - optionValue
    let valueForUpdate = rangeSlider * 0
    const currentValueProgress = (optionValue * 100) / maximumOptionValue
    const currentProgress = this.add
      .rectangle(
        -sliderWidth / 2,
        5,
        currentValueProgress * sliderWidth * 0.01,
        30,
        GameOptions.workshop.colorValueProgress
      )
      .setOrigin(0)

    // console.log(currentValueProgress, maximumOptionValue, optionValue)

    const img = this.add
      .circle(0, 150, 30, Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color)
      .setDepth(999)
    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      // sceneGame?.scene.resume()
      this.scene.get('WorkShop').onUpdateOption(option, valueForUpdate)
    })
    const coinImage = this.add.image(-105, -55, SpriteKeys.Coin).setScale(1.5)
    const coinText = this.add.text(
      -65,
      -80,
      Math.round(valueForUpdate * GameOptions.costUpdate[option]).toString(),
      {
        fontFamily: 'Arial',
        fontSize: 50,
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'left'
      }
    )
    const notEnoughCoinText = this.add
      .text(0, 300, this.lang.notMany, {
        fontFamily: 'Arial',
        fontSize: 40,
        color: GameOptions.colors.danger,
        fontStyle: 'bold',
        align: 'left'
      })
      .setVisible(this.gameData.coin < GameOptions.costUpdate[option] * valueForUpdate)

    const sliderBg = this.add.rectangle(
      0,
      150,
      sliderWidth,
      40,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColorLight).color,
      0.3
    )

    const totalUpdateRangeProgress = sliderWidth - currentValueProgress * sliderWidth * 0.01
    const updateProgress = this.add
      .rectangle(
        -sliderWidth / 2 + currentValueProgress * sliderWidth * 0.01 + 2,
        5,
        ((valueForUpdate * 100) / rangeSlider) * totalUpdateRangeProgress * 0.01,
        30,
        GameOptions.workshop.colorHighProgress
      )
      .setOrigin(0)
    const callback = () => {
      if (this.gameData.coin < GameOptions.costUpdate[option] * valueForUpdate) {
        this.buttonOk.setVisible(false)
        notEnoughCoinText.setVisible(true)
      } else {
        this.buttonOk.setVisible(valueForUpdate > 0)
        notEnoughCoinText.setVisible(false)
      }

      updateProgress.width =
        ((valueForUpdate * 100) / rangeSlider) * totalUpdateRangeProgress * 0.01
      this.textBody.setText(
        valueForUpdate
          ? replaceRegexByArray(this.lang.updateText, [
              this.lang.options[option],
              // Math.round(value * (100 / GameOptions.maximum[option])),
              (valueForUpdate * (100 / getMaxOptionValue(option, activeTankData.id))).toFixed(1),
              Math.round(valueForUpdate * GameOptions.costUpdate[option])
            ])
          : this.lang?.updateTextSlider
      )
      coinText.setText(Math.round(valueForUpdate * GameOptions.costUpdate[option]).toString())
      // console.log(
      //   newValue,
      //   valueForUpdate,
      //   valueForUpdate * GameOptions.costUpdate[option],
      //   currentValueProgress * 300 * 0.01,
      //   totalUpdateRangeProgress,
      //   (valueForUpdate * 100) / rangeSlider
      // )
    }
    callback()

    img.slider = this.plugins
      .get('rexSlider')
      .add(img, {
        endPoints: [
          {
            x: img.x - sliderWidth / 2,
            y: img.y
          },
          {
            x: img.x + sliderWidth / 2,
            y: img.y
          }
        ],
        value: 0
      })
      .on('valuechange', (newValue, prevValue) => {
        valueForUpdate = +(newValue * rangeSlider).toFixed(1)
        callback()
      })

    const container = this.add.container(0, 0, [
      sliderBg,
      progressBg,
      currentProgress,
      updateProgress,
      notEnoughCoinText,
      img,
      coinImage,
      coinText
    ])
    this.body.add(container)
  }

  showCartWeapon(config: IWeaponObject, callback: () => void) {
    this.sound.play(KeySound.Click)
    this.body.removeAll(true)
    this.messageBox.setVisible(true)
    this.buttonCancel.setVisible(true)
    this.buttonWell.setVisible(false)
    this.buttonOk.setVisible(false)
    this.textTitle.setText(
      `${this.lang.cartTitle} - ${this.lang.weapons[getEnumStringKey(WeaponType, config.type)]} ${this.lang.weapon}` ||
        '#cartTitle'
    )

    const sliderWidth = 600
    const rangeSlider = 1000
    let valueForCart = 0
    const img = this.add.circle(0, 150, 30, 0xffffff).setDepth(999)
    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      // sceneGame?.scene.resume()
      this.scene.get('WorkShop').onCartWeapon(config, valueForCart, callback)
    })
    const itemImage = this.add.image(-105, -55, SpriteKeys.Weapon, config.frame).setScale(1.5)
    const countText = this.add.text(-65, -65, `X ${valueForCart} ${this.lang.pc}`, {
      fontFamily: 'Arial',
      fontSize: 50,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'left'
    })
    const coinImage = this.add.image(-105, 55, SpriteKeys.Coin).setScale(1.5)
    const coinText = this.add.text(-65, 35, Math.round(valueForCart * config.cost).toString(), {
      fontFamily: 'Arial',
      fontSize: 50,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'left'
    })
    const notEnoughCoinText = this.add
      .text(0, 300, this.lang.notMany, {
        fontFamily: 'Arial',
        fontSize: 40,
        color: GameOptions.colors.danger,
        fontStyle: 'bold',
        align: 'left'
      })
      .setVisible(this.gameData.coin < config.cost * valueForCart)

    const callbackUpdate = () => {
      if (this.gameData.coin < config.cost * valueForCart) {
        this.buttonOk.setVisible(false)
        notEnoughCoinText.setVisible(true)
        buttonPlus.setVisible(false)
      } else {
        this.buttonOk.setVisible(valueForCart > 0)
        notEnoughCoinText.setVisible(false)
        buttonPlus.setVisible(true)
      }
      buttonMinus.setVisible(valueForCart > 0)

      this.textBody.setText(
        valueForCart
          ? replaceRegexByArray(this.lang.cartWeaponsText, [
              this.lang.weapons[getEnumStringKey(WeaponType, config.type)],
              this.lang.weapon,
              valueForCart,
              valueForCart * config.cost
            ])
          : this.lang?.cartWeaponsTextSlider
      )
      coinText.setText(Math.round(valueForCart * config.cost).toString())
      countText.setText(`X ${valueForCart} ${this.lang.pc}`)
    }
    const buttonMinus = new Button(
      this,
      0,
      0,
      100,
      100,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color,
      '-',
      {
        color: GameOptions.colors.lightColor,
        fontSize: 70
      },
      () => {
        valueForCart -= 1
        callbackUpdate()
      }
    )
    const buttonPlus = new Button(
      this,
      sliderWidth,
      0,
      100,
      100,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color,
      '+',
      {
        color: GameOptions.colors.lightColor,
        fontSize: 70
      },
      () => {
        valueForCart += 1
        callbackUpdate()
      }
    )
    const containerButtons = this.add.container(-sliderWidth / 2, 0, [buttonMinus, buttonPlus])

    callbackUpdate()
    img.slider = this.plugins
      .get('rexSlider')
      .add(img, {
        endPoints: [
          {
            x: img.x - sliderWidth / 2,
            y: img.y
          },
          {
            x: img.x + sliderWidth / 2,
            y: img.y
          }
        ],
        value: 0
      })
      .on('valuechange', (newValue, prevValue) => {
        valueForCart = Math.round(newValue * rangeSlider)
        callbackUpdate()
      })
    const sliderBg = this.add.rectangle(
      0,
      150,
      sliderWidth,
      40,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color,
      0.3
    )

    const container = this.add.container(0, 0, [
      sliderBg,
      notEnoughCoinText,
      img,
      itemImage,
      coinImage,
      coinText,
      countText,
      containerButtons
    ])
    this.body.add(container)
    // this.sound.play(KeySound.Click)
    // this.messageBox.setVisible(true)
    // this.buttonCancel.setVisible(true)
    // this.buttonOk.setVisible(true)
    // this.body.removeAll(true)
    // this.textTitle.setText(this.lang.cartTitle || '#cartTitle')
    // this.textBody.setText(
    //   replaceRegexByArray(this.lang.cartText, [config.name, config.cost.toString()]) || '#cartText'
    // )
    // this.buttonOk.setCallback(() => {
    //   this.sound.play(KeySound.Click)
    //   this.messageBox.setVisible(false)
    //   this.scene.get('WorkShop').onCartTank(config, index)
    // })
  }

  showNewRank() {
    if (getRank(this.gameData.score) == this.gameData.rank) {
      return
    }
    this.sound.play(KeySound.NewRank)
    window?.onHappyTime && window.onHappyTime()

    this.messageBox.setVisible(true)
    this.body.removeAll(true)
    this.buttonOk.setVisible(false)
    this.buttonCancel.setVisible(false)
    this.buttonWell.setVisible(true)
    this.textTitle.setText(this.lang.newRankTitle)
    const newRank = getRank(this.gameData.score)
    this.textBody.setText(
      replaceRegexByArray(this.lang.newRankDescription, [this.lang.rank[newRank]])
    )

    const image = this.add
      .image(0, 0, SpriteKeys.Ranks, GameOptions.ranks[newRank].rank)
      .setScale(1.7)

    const container = this.add.container(0, 0, [image])

    this.body.add(container)

    this.buttonWell.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)

      this.gameData.rank = getRank(this.gameData.score)
      EventBus.emit('save-data', this.gameData)
    })
  }

  showGiftDay() {
    this.messageBox.setVisible(true)
    this.body.removeAll(true)
    this.buttonOk.setVisible(false)
    this.buttonCancel.setVisible(false)
    this.buttonWell.setVisible(true)
    this.textTitle.setText(this.lang.giftTitle || '#giftTitle')
    this.textBody.setText(this.lang.giftDescription || '#giftDescription')

    const weapons: IWeaponObject[] = shuffle(
      GameOptions.weaponObjects.filter((x) => x.type != WeaponType.default)
    ).slice(0, Phaser.Math.Clamp(this.gameData.playDay, 1, 3))

    const giftsWeapon = weapons.map((x) => {
      return {
        ...x,
        count: Phaser.Math.Between(
          x.count,
          Phaser.Math.Clamp(this.gameData.playDay * x.count, x.count, x.count * 10)
        )
      }
    })

    const items = []
    for (const weapon of giftsWeapon) {
      // const keyWeapon = Object.keys(WeaponType).find((key) => WeaponType[key] === weapon.type)
      const image = this.add.image(0, 0, SpriteKeys.Weapon, weapon.frame).setScale(1.3)
      const countText = this.add.text(-10, 50, weapon.count.toString(), {
        fontFamily: 'Arial',
        fontSize: 50,
        fontStyle: 'bold',
        color: GameOptions.colors.lightColor,
        align: 'center',
        wordWrap: {
          width: 300
        }
      })
      const giftCont = this.add.container(0, 0, [image, countText])
      items.push(giftCont)
    }

    const coins = Phaser.Math.Clamp(
      this.gameData.playDay * GameOptions.countCoinByPlayDay,
      GameOptions.countCoinByPlayDay,
      GameOptions.countCoinByPlayDay * 10
    )
    const image = this.add.image(0, 0, SpriteKeys.Clipart, 3)
    const countText = this.add.text(-40, 40, coins.toString(), {
      fontFamily: 'Arial',
      fontSize: 50,
      fontStyle: 'bold',
      color: GameOptions.colors.lightColor,
      align: 'center',
      wordWrap: {
        width: 300
      }
    })
    const giftCont = this.add.container(0, 0, [image, countText])
    items.push(giftCont)

    const gridGifts = Phaser.Actions.GridAlign(items, {
      width: 3,
      height: 3,
      cellWidth: 200,
      cellHeight: 180,
      x: -200,
      y: -50
    })
    this.body.add(gridGifts)

    this.buttonWell.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      //this.scene.get('WorkShop').onCartTank(config, index)

      for (const giftWeapon of giftsWeapon) {
        const existWeaponIndex = this.gameData.weapons[giftWeapon.type]
        if (existWeaponIndex) {
          this.gameData.weapons[giftWeapon.type] += giftWeapon.count
        } else {
          this.gameData.weapons[giftWeapon.type] = giftWeapon.count
        }
      }
      this.gameData.coin += coins
      this.gameData.giftDay = new Date()

      EventBus.emit('save-data', this.gameData)
    })
  }

  showCartTank(config: IComplexConfig, index: number) {
    this.sound.play(KeySound.Click)
    this.messageBox.setVisible(true)
    this.body.removeAll(true)
    this.textTitle.setText(this.lang.cartTitle || '#cartTitle')

    if (config.cost > this.gameData.coin) {
      this.buttonOk.setVisible(false)
      this.buttonCancel.setVisible(false)
      this.buttonWell.setVisible(true)
      this.textBody.setText(this.lang.notMany || '#notMany')
    } else {
      this.buttonOk.setVisible(true)
      this.buttonCancel.setVisible(true)
      this.buttonWell.setVisible(false)
      this.textBody.setText(
        replaceRegexByArray(this.lang.cartText, [config.name, config.cost.toString()]) ||
          '#cartText'
      )
    }

    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      this.scene.get('WorkShop').onCartTank(config, index)
    })
  }

  showMessage(title: string, description: string, callback: () => void) {
    this.sound.play(KeySound.Click)
    this.messageBox.setVisible(true)
    this.buttonCancel.setVisible(true)
    this.buttonWell.setVisible(false)
    this.buttonOk.setVisible(true)
    this.body.removeAll(true)
    this.textTitle.setText(title)
    this.textBody.setText(description)
    this.buttonOk.setCallback(() => {
      this.sound.play(KeySound.Click)
      this.messageBox.setVisible(false)
      callback()
    })
  }

  showToast(text: string, bgColor: number, icon: Phaser.GameObjects.Sprite) {
    this.messageBox.setVisible(false)
    this.scene.bringToTop('Message')
    this.rexUI.add
      .toast({
        x: GameOptions.screen.width / 2,
        y: 150,

        background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 5, bgColor),
        text: this.add.text(0, 0, text, {
          fontFamily: 'Arial',
          fontSize: 25,
          color: '#ffffff'
        }),
        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20
        },
        duration: {
          in: 100,
          hold: 2000,
          out: 100
        }
      })
      .on('transitout', () => {
        // this.scene.sendToBack('Message')
      })
      .setDepth(999999)
      .showMessage(text)
      .setScrollFactor(0)
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.gameData = JSON.parse(JSON.stringify(gameData))
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    this.buttonOk.setText(this.lang.ok || '#ok')
    this.buttonCancel.setText(this.lang.cancel || '#cancel')
    this.buttonWell.setText(this.lang.well || '#well')
  }
}
