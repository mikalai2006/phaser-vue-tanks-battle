export class Caterpillar extends Phaser.Physics.Matter.Sprite {
  key = 'caterpillar'
  ecsId: number
  animator: Phaser.Animations.Animation
  emitterPath: Phaser.GameObjects.Particles.ParticleEmitter
  followeObject: Phaser.GameObjects.Rectangle
  isUp: boolean = false

  constructor(
    ecsId: number,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    level: number,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, 'caterpillar', null, {
      ...bodyOptions
      // vertices: [
      //   { x: 30, y: 70 },
      //   { x: 80, y: 70 },
      //   { x: 80, y: 80 },
      //   { x: 30, y: 80 }
      // ]
    })
    this.ecsId = ecsId
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.setActive(false)
    this.scene.add.existing(this)
    this.setDepth(2)

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

    this.followeObject = this.scene.add.rectangle(x - 100, y, this.width, 10)

    if (this.scene.sys.game.device.os.desktop) {
      this.emitterPath = world.scene.add.particles(0, 0, 'tank_path', {
        tint: 0x9a3412,
        // speed: {
        //   onEmit: (particle, key, t, value) => this.body.speed * 10
        // },
        lifespan: {
          onEmit: (particle, key, t, value) =>
            Phaser.Math.Percent(this.body.speed, 0, 100) * 40000 + 500
        },
        // alpha: {
        //   onEmit: (particle, key, t, value) => Phaser.Math.Percent(tank.body.speed, 0, 300) * 1000
        // },
        // // scale: { start: 1.0, end: 1 },
        // blendMode: 'ADD'
        frequency: 30,
        rotate: {
          onEmit: (particle, key, t, value) => this.angle
        },
        // follow:this,
        // followOffset: {
        //   x: 140,
        //   y: 140
        // },
        advance: 1000,
        blendMode: 'COLOR',
        alpha: { start: 0.5, end: 0, ease: 'quad.out' },
        // lifespan: 500,
        scale: { start: 0.75, end: 0.6 },
        emitting: false
      })
      this.emitterPath.startFollow(this.followeObject).setDepth(0)
    }
    // this.world.remove(this.body, false)
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

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    const vec = new Phaser.Math.Vector2(this.x, this.y)
    vec.setToPolar(this.rotation, 40)
    const x2 = this.x - vec.x * (this.isUp ? 1 : -1)
    const y2 = this.y - vec.y * (this.isUp ? 1 : -1)
    this.followeObject?.setPosition(x2, y2)
    // this.lifespan -= delta

    // if (this.lifespan <= 0) {
    //   this.setActive(false)
    //   this.setVisible(false)
    //   this.world.remove(this.body, true)
    // }
  }
  toggleEmitter(status: boolean, isUp: boolean) {
    if (!this.scene.sys.game.device.os.desktop) {
      return
    }

    this.isUp = isUp
    if (!status && !this.emitterPath.emitting) {
      return
    }

    if (status && this.emitterPath.emitting) {
      return
    }

    // console.log('emitting', status)
    if (status) {
      this.emitterPath.start()
    } else {
      this.emitterPath.stop()
    }
  }

  removeCatterpillar() {
    this.emitterPath && this.emitterPath.destroy()
    this.anims.stop()
    // this.anims.destroy()
    this.world.remove(this.body, true)
    this.destroy(true)
  }
}
