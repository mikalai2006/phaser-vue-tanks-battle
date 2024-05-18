import { GameOptions } from '../../../game/options/gameOptions'

export class Button extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text
  callback: (pointer: Phaser.Input.Pointer) => void

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    bgColor: number,
    text: string,
    textStyle: Phaser.Types.GameObjects.Text.TextStyle,
    callback: (pointer: Phaser.Input.Pointer) => void
  ) {
    super(scene, x, y, [])
    this.callback = callback

    // const bgFill = this.scene.add
    //   .nineslice(0, 0, 'buttons', 1, width, height, 50, 50, 50, 50)
    //   .setTint(bgColor)
    //   .setAlpha(1)
    //   .setOrigin(0.5)
    // const bg = this.scene.add
    //   .nineslice(0, 0, 'buttons', 0, width, height, 50, 50, 50, 50)
    //   .setTint(0xffffff)
    //   .setAlpha(1)
    //   .setOrigin(0.5)
    //   .setScrollFactor(0)
    //   .setInteractive({ useHandCursor: true })
    const bg = scene.add
      .rectangle(0, 0, width, height, bgColor, 1)
      .setAlpha(0.8)
      .setInteractive({ useHandCursor: true })

    this.text = this.scene.add
      .text(textStyle?.padding?.left || 0, textStyle?.padding?.top || 0, text, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 30,
        color: GameOptions.colors.darkColor,
        // stroke: '#000000',
        // strokeThickness: 3,
        align: 'center',
        ...textStyle
      })
      .setDepth(1000)
      .setOrigin(0.5)

    bg.on('pointerdown', (pointer: any) => this.callback(pointer))
    bg.on('pointerover', (pointer) => {
      bg.setAlpha(1)
    })
    bg.on('pointerout', (pointer) => {
      bg.setAlpha(0.8)
    })

    this.add([bg, this.text])
  }

  setCallback(callback: (pointer: Phaser.Input.Pointer) => void) {
    this.callback = callback
  }

  setText(text: string, textStyle?: Phaser.Types.GameObjects.Text.TextStyle) {
    this.text.setText(text)
    this.text.setStyle(textStyle)
  }
}
