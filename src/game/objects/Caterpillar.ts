export class Caterpillar extends Phaser.Physics.Matter.Sprite {
  key = 'caterpillar'
  ecsId: number
  animator: Phaser.Animations.Animation
  emitterPath: Phaser.GameObjects.Particles.ParticleEmitter

  constructor(
    ecsId: number,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    level: number,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, 'caterpillar', null, bodyOptions)
    this.ecsId = ecsId
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.setActive(false)
    this.scene.add.existing(this)
    this.setDepth(1)

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('caterpillar', { frames: [0, 1, 2, 3] }),
      frameRate: 24,
      repeat: -1
    })
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('caterpillar', { frames: [3, 2, 1, 0] }),
      frameRate: 24,
      repeat: -1
    })

    this.emitterPath = world.scene.add.particles(0, 0, 'tank_path', {
      tint: 0x9a3412,
      // speed: {
      //   onEmit: (particle, key, t, value) => this.body.speed * 10
      // },
      lifespan: {
        onEmit: (particle, key, t, value) => Phaser.Math.Percent(this.body.speed, 0, 200) * 40000
      },
      // alpha: {
      //   onEmit: (particle, key, t, value) => Phaser.Math.Percent(tank.body.speed, 0, 300) * 1000
      // },
      // // scale: { start: 1.0, end: 1 },
      // blendMode: 'ADD'
      frequency: 20,
      rotate: {
        onEmit: (particle, key, t, value) => this.angle
      },
      blendMode: 'COLOR',
      alpha: { start: 0.5, end: 0 },
      // lifespan: 500,
      scale: { start: 0.8, end: 0.7 }
    })
    this.emitterPath.startFollow(this).setDepth(1)
    // this.scene.input.keyboard.on('keydown-K', () => {
    //   this.anims.play('up', true)
    // })
    // this.scene.input.keyboard.on('keydown-L', () => {
    //   this.anims.play('down', true)
    // })
    // this.scene.input.keyboard.on('keydown-I', () => {
    //   this.anims.stop()
    // })
    // this.world.remove(this.body, true)
  }

  // fire(x, y, angle, speed) {
  //   this.world.add(this.body)

  //   this.setPosition(x, y)
  //   this.setActive(true)
  //   this.setVisible(true)

  //   this.setRotation(angle)
  //   this.setVelocityX(speed * Math.cos(angle))
  //   this.setVelocityY(speed * Math.sin(angle))

  //   this.lifespan = 1000
  // }

  // preUpdate(time, delta) {
  //   super.preUpdate(time, delta)

  //   this.lifespan -= delta

  //   if (this.lifespan <= 0) {
  //     this.setActive(false)
  //     this.setVisible(false)
  //     this.world.remove(this.body, true)
  //   }
  // }
  removeCatterpillar() {
    this.emitterPath.destroy()
    this.anims.stop()
    // this.anims.destroy()
    this.world.remove(this.body, true)
    this.destroy(true)
  }
}
