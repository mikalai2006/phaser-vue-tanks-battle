import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { IComplexConfig, IGameData, TLang } from '../types'
import { Button } from '../objects/ui/Button'
import { getMaxOptionValue, replaceRegexByArray } from '../utils/utils'

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

  bomb: Phaser.GameObjects.Particles.ParticleEmitter

  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  addbonus: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  create() {
    this.click = this.sound.add('click')
    // this.addbonus = this.sound.add('addbonus', { loop: false })

    // message box.
    const messageOverlay = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.8)
      .setInteractive()

    const bgBox = this.add
      .nineslice(0, 0, 'buttons', 1, 1000, 900, 50, 50, 50, 50)
      .setTint(GameOptions.ui.panelBgColor)
      .setAlpha(0.9)
    // .setOrigin(0)
    const messageBoxBg = this.add.nineslice(0, 0, 'shopPanel2', 0, 1000, 900, 33, 33, 33, 33)
    // .setTint(GameOptions.ui.panelBgColor)
    this.textTitle = this.add
      .text(0, -370, 'Message', {
        fontFamily: 'Arial',
        fontSize: 40,
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
      .text(0, -300, 'Message', {
        fontFamily: 'Arial',
        fontSize: 40,
        color: GameOptions.ui.primaryColor,
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
      GameOptions.ui.panelBgColor,
      'ok',
      {},
      () => {}
    )

    this.buttonCancel = new Button(
      this,
      -170,
      320,
      300,
      120,
      GameOptions.ui.panelBgColor,
      'ok',
      {},
      () => {
        this.click.play()
        this.messageBox.setVisible(false)
        const sceneGame = this.game.scene.getScene('Game')
        sceneGame?.scene.resume()
      }
    )
    this.body = this.add.container(0, 0, [])
    this.messageBox = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        messageOverlay,
        bgBox,
        messageBoxBg,
        this.textTitle,
        this.textBody,
        this.body,
        this.buttonOk,
        this.buttonCancel
      ])
      .setDepth(999999)
      .setVisible(false)

    EventBus.emit('current-scene-ready', this)
  }

  showMessageAddBonusBomb(text: string) {
    this.addbonus.play()
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.scene?.pause()
    this.messageBox.setVisible(true)
    this.textBody.setText(text)
    this.buttonCancel.setVisible(false)
    this.buttonOk.setVisible(false)
    this.bomb.setVisible(true)
    // this.messageBoxButtonNext.once('pointerup', () => {
    //   this.click.play()
    //   this.messageBox.setVisible(false)
    //   sceneGame.scene?.resume()
    // })
  }

  showMessageCreateBomb() {
    this.click.play()
    const sceneGame = this.game.scene.getScene('Game')
    sceneGame.scene?.pause()
    this.messageBox.setVisible(true)
    // this.messageBoxText.setText('Create bomb by view adv?')
    this.buttonCancel.setVisible(true)
    this.buttonOk.setVisible(true)
    this.bomb.setVisible(false)
    this.textBody.setText(this.lang.create_bomb_help || '#create_bomb_help')
    this.buttonOk.once('pointerup', () => {
      this.click.play()
      this.messageBox.setVisible(false)
      // sceneGame?.scene.resume()
      this.onUpdateOption()
    })
  }

  showUpdate(option: string) {
    this.click.play()
    this.body.removeAll(true)
    this.messageBox.setVisible(true)
    this.buttonCancel.setVisible(true)
    this.buttonOk.setVisible(false)
    this.textTitle.setText(
      `${this.lang.updateTitle} ${GameOptions.complexTanks[this.gameData.activeTankIndex].name}` ||
        '#updateTitle'
    )

    const activeTankData = this.gameData.tanks[this.gameData.activeTankIndex]
    const optionValue = activeTankData[option]
    const sliderWidth = 600
    const progressBg = this.add
      .rectangle(-sliderWidth / 2, 5, sliderWidth, 30, GameOptions.ui.progressBgColor)
      .setOrigin(0)
    const maximumOptionValue = getMaxOptionValue(
      option,
      activeTankData.levelTank,
      activeTankData.levelTower,
      activeTankData.levelMuzzle
    )
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

    this.textBody.setText(this.lang?.updateTextSlider)
    const img = this.add.circle(0, 150, 30, 0xffffff).setDepth(999)
    this.buttonOk.setCallback(() => {
      this.click.play()
      this.messageBox.setVisible(false)
      // sceneGame?.scene.resume()
      this.scene.get('WorkShop').onUpdateOption(option, valueForUpdate)
    })
    const coinImage = this.add.image(-105, -55, 'coin').setScale(1.5)
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
        color: GameOptions.ui.dangerText,
        fontStyle: 'bold',
        align: 'left'
      })
      .setVisible(this.gameData.coin < GameOptions.costUpdate[option] * valueForUpdate)
    const sliderBg = this.add.rectangle(
      0,
      150,
      sliderWidth,
      40,
      GameOptions.ui.progressBgColor,
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
        valueForUpdate = newValue * rangeSlider

        if (this.gameData.coin < GameOptions.costUpdate[option] * valueForUpdate) {
          this.buttonOk.setVisible(false)
          notEnoughCoinText.setVisible(true)
        } else {
          this.buttonOk.setVisible(true)
          notEnoughCoinText.setVisible(false)
        }

        updateProgress.width =
          ((valueForUpdate * 100) / rangeSlider) * totalUpdateRangeProgress * 0.01
        this.textBody.setText(
          replaceRegexByArray(this.lang.updateText, [
            this.lang.options[option],
            // Math.round(value * (100 / GameOptions.maximum[option])),
            (
              valueForUpdate *
              (100 /
                getMaxOptionValue(
                  option,
                  activeTankData.levelTank,
                  activeTankData.levelTower,
                  activeTankData.levelMuzzle
                ))
            ).toFixed(1),
            Math.round(valueForUpdate * GameOptions.costUpdate[option])
          ])
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

  showCartTank(config: IComplexConfig, index: number) {
    this.click.play()
    this.messageBox.setVisible(true)
    this.buttonCancel.setVisible(true)
    this.buttonOk.setVisible(true)
    this.body.removeAll(true)
    this.textTitle.setText(this.lang.cartTitle || '#cartTitle')
    this.textBody.setText(
      replaceRegexByArray(this.lang.cartText, [config.name, config.cost.toString()]) || '#cartText'
    )
    this.buttonOk.setCallback(() => {
      this.click.play()
      this.messageBox.setVisible(false)
      this.scene.get('WorkShop').onCartTank(config, index)
    })
  }

  onSetGameData(data: IGameData) {
    this.gameData = JSON.parse(JSON.stringify(data))
  }

  setLocale(lang: TLang) {
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {
    this.buttonOk.setText(this.lang.ok || '#ok')
    this.buttonCancel.setText(this.lang.cancel || '#cancel')
    this.textBody.setText(this.lang.create_bomb_help || '#create_bomb_help')
  }
}
