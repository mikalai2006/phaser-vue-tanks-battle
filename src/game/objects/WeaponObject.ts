import { IMuzzleConfigItem, IWeaponObject } from '../types'

export class WeaponObject extends Phaser.Physics.Matter.Sprite {
  isPlay: boolean
  startPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
  distance
  key = 'weapon'
  lifespan: number = 0
  weaponConfig: IWeaponObject
  muzzleConfig: IMuzzleConfigItem
  emitter: Phaser.GameObjects.Particles.ParticleEmitter
  start: boolean = false
  defaultConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    weaponConfig: IWeaponObject,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, null, { plugin: bodyOptions, restitution: 0.2 })
    this.setFrictionAir(0)
    this.setFriction(1)
    this.setFixedRotation()
    this.setActive(false)
    this.setDepth(99999)

    this.weaponConfig = weaponConfig

    this.scene.add.existing(this)

    // this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (event) => {
    //   console.log('Stop')
    //   this.stop()
    //   this.setTexture(texture)
    //   this.setFrame(0)
    //   this.setActive(false)
    //   this.setVisible(false)
    // })
    this.defaultConfig = {
      blendMode: 'ADD',
      emitting: false
    }
    this.emitter = this.scene.add
      .particles(0, 0, 'smokeBoom', {
        ...this.defaultConfig,
        ...this.weaponConfig.configParticlesBoom
        // stopAfter: 15
      })
      .on('complete', () => {
        // console.log('complete')
        this.setActive(false)
      })
      // .on('stop', () => {
      //   console.log('stop')
      // })
      .startFollow(this)
      .setDepth(9999)
    // .stop(true)

    this.world.remove(this.body, true)
  }

  fire(
    x: number,
    y: number,
    angle: number,
    weaponConfig: IWeaponObject,
    muzzleConfig: IMuzzleConfigItem
  ) {
    if (this.start) {
      return
    }

    this.start = true
    this.lifespan = 0
    this.muzzleConfig = muzzleConfig

    this.setTint(weaponConfig.color)

    const vec = new Phaser.Math.Vector2(x, y)
    vec.setToPolar(angle, muzzleConfig.vert[0].x)
    const x2 = x + vec.x
    const y2 = y + vec.y

    this.startPoint.set(x2, y2)

    this.world.add(this.body)

    this.setPosition(x2, y2)
    this.setActive(true)
    this.setVisible(true)

    this.setRotation(angle)
    this.setVelocityX(this.muzzleConfig.game.speedShot * Math.cos(angle))
    this.setVelocityY(this.muzzleConfig.game.speedShot * Math.sin(angle))

    this.distance = 0
    this.isPlay = true
    this.scene.minimap?.ignore(this)

    // this.emitter.setConfig({ ...this.defaultConfig, ...this.weaponConfig.configParticlesBoom })
    // .stop(true)
  }

  boom() {
    // this.emitter.setConfig({
    //   ...this.defaultConfig,
    //   ...this.weaponConfig.configParticlesBoom
    //   // stopAfter: 15
    // })
    // console.log({
    //   ...this.defaultConfig,
    //   ...this.weaponConfig.configParticlesBoom
    //   // stopAfter: 15
    // })
    this.start = false
    this.lifespan = 0
    this.setVisible(false)
    // this.scene.time.delayedCall(this.emitter.duration, () => {
    //   this.setActive(false)
    // })
    this.world.remove(this.body, true)
    this.scene.effects.addEffect(
      this.x,
      this.y,
      Phaser.Math.Between(0, 2),
      this.weaponConfig.scaleCrator
    )

    this.emitter.explode(16) // .start()
    // this.emitter.stop(true).start()
  }

  preUpdate(time, delta) {
    if (!this.start) {
      return
    }
    super.preUpdate(time, delta)

    this.lifespan += delta
    this.distance = Phaser.Math.Distance.Between(
      this.startPoint.x,
      this.startPoint.y,
      this.x,
      this.y
    )
    // && !this.anims.isPlaying
    if (
      (this.distance >= this.muzzleConfig.game.distanceShot && this.active) ||
      (this.lifespan > 5000 && !this.anims.isPlaying)
    ) {
      this.boom()
    }
  }
}