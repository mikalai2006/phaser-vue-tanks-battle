export class SpriteButton extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame = 0) {
    super(scene, x, y, texture, frame)

    // this.setInteractive({ useHandCursor: true })
  }
}
