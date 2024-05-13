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

    const bgFill = this.scene.add
      .nineslice(0, 0, 'buttons', 1, width, height, 50, 50, 50, 50)
      .setTint(bgColor)
      .setAlpha(1)
      .setOrigin(0.5)
    const bg = this.scene.add
      .nineslice(0, 0, 'buttons', 0, width, height, 50, 50, 50, 50)
      .setTint(0xffffff)
      .setAlpha(1)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
    // bg.setInteractive({ useHandCursor: true })

    this.text = this.scene.add
      .text(0, 0, text, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 30,
        color: GameOptions.ui.buttonTextColor,
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        ...textStyle
      })
      .setDepth(1000)
      .setOrigin(0.5)

    bg.on('pointerdown', (pointer: any) => this.callback(pointer))
    bg.on('pointerover', (pointer) => {
      bg.setAlpha(0.8)
    })
    bg.on('pointerout', (pointer) => {
      bg.setAlpha(1)
    })

    this.add([bgFill, bg, this.text])
  }

  setCallback(callback: (pointer: Phaser.Input.Pointer) => void) {
    this.callback = callback
  }

  setText(text: string, textStyle?: Phaser.Types.GameObjects.Text.TextStyle) {
    this.text.setText(text)
    this.text.setStyle(textStyle)
  }
}
