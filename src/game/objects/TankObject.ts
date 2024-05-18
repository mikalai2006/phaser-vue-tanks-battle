import { Entity } from '../components/Entity'
import Input from '../components/Input'
import Rotation from '../components/Rotation'
import { Tank } from '../components/Tank'
import { GameOptions } from '../options/gameOptions'
import { KeySound } from '../types'

export class TankObject extends Phaser.Physics.Matter.Sprite {
  key = 'tank'
  ecsId: number
  detectorCollision: MatterJS.BodyType
  detectorBonus: MatterJS.BodyType
  damageImage: Phaser.GameObjects.Image
  areol: Phaser.GameObjects.Container
  arrow: Phaser.GameObjects.Image
  smoke: Phaser.GameObjects.Particles.ParticleEmitter
  smokeConfig: any
  moveSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  constructor(
    ecsId: number,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    level: number,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const options = GameOptions.tanks
    super(world, x, y, options.key, options.items[level].frame, {
      ...bodyOptions,
      vertices: options.items[level].vert,
      render: {
        sprite: options.items[level].offset
      }
    })
    this.ecsId = ecsId
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    this.setActive(true)
    this.moveSound = this.scene.sound.add(KeySound.Move, {
      loop: true,
      volume: 0
    })
    this.moveSound.play()

    // if this is player.
    // if (this.ecsId != this.scene.idPlayer) {
    this.detectorCollision = this.scene.matter.bodies.circle(this.x, this.y, 100, {
      isSensor: true
      // collisionFilter: {
      //   group:0,
      //   category: sensorCategory,
      //   mask: defaultCategory & allCollision
      // }
    })
    this.detectorCollision.key = 'detector'
    this.detectorCollision.onCollideCallback = (d) => {
      if (d.bodyA !== this.detectorCollision && d.bodyB !== this.detectorCollision) {
        return
      }

      const target = d.bodyA !== this.detectorCollision ? d.bodyA.gameObject : d.bodyB.gameObject

      if (['destroyObject', 'bonus', 'weaponMap'].includes(target?.key)) {
        return
      }

      const angleToPointer = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(
          d.bodyA.position.x,
          d.bodyA.position.y,
          d.bodyB.position.x,
          d.bodyB.position.y
        )
      )

      const angleDelta = Math.abs(
        Phaser.Math.Angle.ShortestBetween(angleToPointer, Rotation.angle[this.ecsId])
      )
      // console.log(
      //   target?.key,
      //   ['destroyObject', 'bonus', 'weaponMap'].includes(target?.key),
      //   d.bodyA,
      //   d.bodyB,
      //   angleDelta
      // )

      if (
        angleDelta < 40 ||
        angleDelta > 140
        // &&
        // (d.bodyA.gameObject?.ecsId || d.bodyB.gameObject?.ecsId)
      ) {
        Input.obstacle[this.ecsId] = 1
        // console.log(
        //   'obstacle: isPlayer=',
        //   this.ecsId == this.scene.idPlayer,
        //   ' this.ecsId=',
        //   this.ecsId
        // )
      }
    }
    this.scene.matter.add.constraint(this.body, this.detectorCollision, 0, 0)
    this.world.add(this.detectorCollision)
    this.detectorBonus = this.scene.matter.bodies.circle(this.x, this.y, 200, {
      isSensor: true
      // collisionFilter: {
      //   category: sensorCategory,
      //   mask: defaultCategory & allCollision
      // }
    })
    this.detectorBonus.key = 'detector'
    this.detectorBonus.onCollideCallback = (d) => {
      // if this is player.
      if (this.ecsId == this.scene.idPlayer) {
        return
      }

      if (d.bodyA !== this.detectorBonus && d.bodyB !== this.detectorBonus) {
        return
      }
      // console.log(d.bodyA, d.bodyB)
      const target = d.bodyA.gameObject?.ecsId
        ? d.bodyA.gameObject
        : d.bodyB.gameObject?.ecsId
          ? d.bodyB.gameObject
          : null
      if (!target || !['destroyObject', 'bonus', 'weaponMap'].includes(target.key)) {
        return
      }
      const tile = this.scene.groundTilesLayer.getTileAtWorldXY(target.x, target.y)
      if (!tile) {
        return
      }
      if (Entity.targetGridX[this.ecsId] == -1) {
        Entity.targetGridX[this.ecsId] = tile.x
        Entity.targetGridY[this.ecsId] = tile.y
        // console.log(this.ecsId, target, tile, tile.x, tile.y)
      }
    }
    this.scene.matter.add.constraint(this.body, this.detectorBonus, 0, 0)
    this.world.add(this.detectorBonus)
    // }

    this.damageImage = this.scene.add.image(this.x, this.y, 'tank', 36).setDepth(5)
    this.damageImage.setVisible(false)

    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
      this.damageImage.setPipeline('Light2D')
    }

    this.arrow = this.scene.add
      .image(0, 0, 'arrow')
      .setTint(0xadff2f)
      .setScale(1.5)
      .setDepth(10)
      .setVisible(false)
    const areolImage = this.scene.add.image(0, 0, 'areol').setTint(0xadff2f).setScale(1.1)
    this.areol = this.scene.add.container(x, y, [areolImage]).setDepth(2).setVisible(false)

    this.scene.add.existing(this)

    this.smokeConfig = {
      speed: 50,
      // quantity: 1,
      lifespan: {
        onEmit: (particle, key, t, value) =>
          Phaser.Math.Percent(this.body.speed, 0, 200) * 40000 + 1000
      },
      alpha: 0.3,
      frequency: 50,
      gravityY: -50,
      scale: { start: 0, end: 1 },
      emitting: false
      // stopAfter: 200
    }
    if (this.scene.sys.game.device.os.desktop) {
      this.smoke = this.scene.add
        .particles(0, 0, 'smoke-puff', this.smokeConfig)
        // .on('stop', () => {
        //   console.log('Smoke stop')
        // })
        // .on('complete', () => {
        //   console.log('Smoke complete')
        // })
        .startFollow(this)
        .setDepth(9999)
        .setActive(false)
        .stop(true)
    }

    this.setDepth(3)
  }

  startMove() {
    const isFollower = this.ecsId == this.scene.idFollower
    if (this.scene.cameras.main.cull([this]).length) {
      // !this.moveSound.isPlaying && this.moveSound.setVolume(isFollower ? 0.1 : 0.03).play()
      if (!this.moveSound.isPlaying && this.scene.isMute) {
        this.moveSound.play()
      }
      this.moveSound.setVolume(isFollower ? 0.5 : 0.1)
    } else {
      this.moveSound.stop()
    }
  }

  stopMove() {
    const isFollower = this.ecsId == this.scene.idFollower
    // this.moveSound.stop()
    if (!this.moveSound.isPlaying && this.scene.isMute) {
      this.moveSound.play()
    }
    this.moveSound.setVolume(isFollower ? 0.2 : 0.005)
  }

  createSmoke() {
    if (!this.smoke) {
      return
    }

    const countSmoke = Phaser.Math.Clamp(
      (Tank.maxHealth[this.ecsId] - Tank.health[this.ecsId]) * 0.001,
      0,
      1
    )
    if (Tank.health[this.ecsId] == Tank.maxHealth[this.ecsId]) {
      this.smoke.stop(true).setActive(false)
    } else if (
      Tank.health[this.ecsId] < Tank.maxHealth[this.ecsId] * 0.5 &&
      !this.smoke.emitting
      // this.smoke.quantity != countSmoke
    ) {
      this.smoke
        // .setConfig({
        //   ...this.smokeConfig,
        //   quantity: countSmoke
        // })
        .stop(true)
        .setActive(true)
        .start()
    }
  }

  onGetDamage() {
    this.createSmoke()
  }

  onHealth() {
    this.createSmoke()
    // this.smoke.setActive(false).stop(true)
  }

  removeTank() {
    this.world.remove(this.detectorBonus, true)
    this.world.remove(this.detectorCollision, true)

    this.createSmoke()
    this.moveSound.destroy()
    this.setActive(true)
    this.key = 'tankDestroy'
    this.removeAllListeners()
    this.damageImage.setVisible(true)
    this.areol?.destroy()
    this.arrow?.destroy()

    // this.smoke.start()
    // this.world.remove(this.body, true)
    // this.setStatic(true)
    // this.destroy(true)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    if (!this.scene.isMute) {
      this.moveSound.stop()
    }

    this.damageImage.setPosition(this.x, this.y)
    this.damageImage.setAngle(this.angle)

    if (this.ecsId != this.scene.idFollower) {
      return
    }

    if (this.scene.gameData.settings.showAreol) {
      this.areol.setVisible(true)
    }

    if (this.scene.gameData.settings.showArrow) {
      this.arrow.setVisible(true)
    }
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene)

    this.moveSound?.destroy()
    this.smoke?.destroy()
  }
}
