export default class ContainerBall extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text
  sprite: Phaser.GameObjects.Sprite

  constructor(scene, x, y, text) {
    super(scene)

    this.text = scene.add.text(x, y + 15, text)
    this.sprite = scene.physics.add.sprite(x, y, 'airplane')
    this.vLabel.setOrigin(0.5)

    scene.add.existing(this)
  }

  fly() {
    this.vIcon.setVelocity(10, 0)
  }

  preUpdate = (time, delta) => {
    this.vLabel.x = this.vIcon.x
    this.vLabel.y = this.vIcon.y + 15
  }
}
