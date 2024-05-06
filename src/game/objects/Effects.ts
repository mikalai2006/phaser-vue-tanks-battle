export class Effect extends Phaser.GameObjects.Container {
  lifespan
  key = 'effects'
  pool: Phaser.GameObjects.Sprite[] = []

  constructor(scene, x, y) {
    super(scene, x, y, [])

    for (let i = 0; i < 1000; i++) {
      this.createSprite()
    }

    this.scene.add.existing(this)
  }

  createSprite() {
    const sprite = this.scene.add
      .sprite(0, 0, 'effects', 1)
      .setActive(false)
      .setVisible(false)
      .setDepth(1)
      .setScale(1.5)
    this.pool.push(sprite)
    return sprite
  }

  addEffect(x, y, frame = 1, scale = 1) {
    let sprite = this.pool.find((x) => !x.visible)
    if (!sprite) {
      sprite = this.createSprite()
    }

    sprite.setFrame(frame)
    sprite.setAngle(Phaser.Math.Between(-180, 180))

    sprite.setScale(scale)
    sprite.setPosition(x, y)

    // sprite.setActive(true)
    sprite.setVisible(true)
  }

  // fire(x, y, angle, speed) {
  //   this.world.add(this.body)

  //   this.setPosition(x, y)
  //   this.setActive(true)
  //   this.setVisible(true)

  //   this.setRotation(angle)
  //   this.setVelocityX(speed * Math.cos(angle))
  //   this.setVelocityY(speed * Math.sin(angle))

  //   this.lifespan = 500
  // }

  // boom() {
  //   this.world.remove(this.body, true)
  //   this.play('explodeAnimation', true)
  // }

  // preUpdate(time, delta) {
  //   super.preUpdate(time, delta)

  //   this.lifespan -= delta

  //   if (this.lifespan <= 0 && this.lifespan > -200 && !this.anims.isPlaying) {
  //     this.boom()
  //   }
  // }
}
