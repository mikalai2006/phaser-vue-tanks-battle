import { Entity } from '../components/Entity'
import Input from '../components/Input'
import Rotation from '../components/Rotation'
import { Tank } from '../components/Tank'
import { GameOptions } from '../options/gameOptions'

export class TankObject extends Phaser.Physics.Matter.Sprite {
  key = 'tank'
  ecsId: number
  detectorCollision: MatterJS.BodyType
  detectorBonus: MatterJS.BodyType
  damageImage: Phaser.GameObjects.Image
  // areol: Phaser.GameObjects.Container
  arrow: Phaser.GameObjects.Image
  smoke: Phaser.GameObjects.Particles.ParticleEmitter
  smokeConfig: any
  // emitterPath: Phaser.GameObjects.Particles.ParticleEmitter

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

    this.detectorCollision = this.scene.matter.bodies.circle(this.x, this.y, 100, {
      isSensor: true
      // collisionFilter: {
      //   category: sensorCategory,
      //   mask: defaultCategory & allCollision
      // }
    })
    this.detectorCollision.onCollideCallback = (d) => {
      if (d.bodyA !== this.detectorCollision && d.bodyB !== this.detectorCollision) {
        return
      }

      const target =
        d.bodyA.gameObject !== this.detectorCollision ? d.bodyA.gameObject : d.bodyB.gameObject

      if (['destroyObject', 'bonus', 'weaponMap'].includes(target?.ecsId)) {
        return
      }

      // console.log(d.bodyA, d.bodyB)
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

      if (
        (angleDelta < 60 || angleDelta > 120) &&
        (d.bodyA.gameObject?.ecsId || d.bodyB.gameObject?.ecsId)
      ) {
        Input.obstacle[this.ecsId] = 1
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
    this.detectorBonus.onCollideCallback = (d) => {
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

    this.damageImage = this.scene.add.image(this.x, this.y, 'tank', 36).setDepth(5)
    this.damageImage.setVisible(false)

    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
      this.damageImage.setPipeline('Light2D')
    }

    this.arrow = this.scene.add.image(0, 0, 'arrow').setTint(0xadff2f).setScale(1.5).setDepth(10)
    // const areolImage = this.scene.add.image(0, 0, 'areol').setTint(0xadff2f).setScale(1.1)
    // this.areol = this.scene.add.container(x, y, [areolImage]).setVisible(false)

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
    // const tank = world.matter.add
    //     .sprite(x, y, texture, 0, {
    //       friction: 0,
    //       frictionAir: 0.2,
    //       density: 100,
    //       collisionFilter: {
    //         category: twoCategory
    //       }
    //     })
    this.setDepth(2)
    // // this.tank = this.add.container(0, 0, [tank]).setRotation(Math.PI / 2)
    // const container = scene.add.container(500, 500, [tank])
    // // container.setSize(128, 101)
    // const base = matter.add.gameObject(container, {
    //   friction: 0,
    //   frictionAir: 0.2,
    //   density: 10,
    //   collisionFilter: {
    //     category: twoCategory
    //   }
    // })
    // const levelTower = 1
    // const optionsTower = GameOptions.towers
    // this.tower = world.scene.matter.add
    //   .sprite(x, y, 'tank_tower', levelTower, {
    //     friction: 0,
    //     frictionAir: 0.2,
    //     density: 10,
    //     collisionFilter: {
    //       mask: defaultCategory & allCollision
    //     },
    //     vertices: optionsTower.level[levelTower].vert,
    //     render: {
    //       sprite: optionsTower.level[levelTower].offset
    //     }
    //   })
    //   .setDepth(3)
    // // const tankTower = scene.add.container(0, 0, [tower]).setRotation(Math.PI / 2)
    // const containerTower = world.scene.add.container(x, y, [tower])
    // containerTower.setSize(120, 30) //.setScale(1.9)
    // this.tower = world.scene.matter.add
    //   .gameObject(containerTower, {
    //     friction: 0,
    //     frictionAir: 0.2,
    //     density: 10,
    //     collisionFilter: {
    //       mask: defaultCategory & allCollision
    //     }
    //   })
    //   .setDepth(3)

    // world.scene.matter.body.setCentre(
    //   this.tower?.body,
    //   JSON.parse(JSON.stringify(optionsTower.level[levelTower].center)),
    //   true
    // )

    // this.emitterPath = world.scene.add.particles(0, 0, 'tank_path', {
    //   tint: 0x9a3412,
    //   // speed: {
    //   //   onEmit: (particle, key, t, value) => this.body.speed * 10
    //   // },
    //   lifespan: {
    //     onEmit: (particle, key, t, value) => Phaser.Math.Percent(this.body.speed, 0, 200) * 40000
    //   },
    //   // alpha: {
    //   //   onEmit: (particle, key, t, value) => Phaser.Math.Percent(tank.body.speed, 0, 300) * 1000
    //   // },
    //   // // scale: { start: 1.0, end: 1 },
    //   // blendMode: 'ADD'
    //   frequency: 20,
    //   rotate: {
    //     onEmit: (particle, key, t, value) => this.angle
    //   },
    //   blendMode: 'COLOR',
    //   alpha: { start: 0.5, end: 0 },
    //   // lifespan: 500,
    //   scale: { start: 0.8, end: 0.7 }
    // })
    // this.emitterPath.startFollow(this).setDepth(1)

    // this.setOnCollide((collisionData) => {
    //   const bullet =
    //     collisionData.bodyB.gameObject.key === 'weapon'
    //       ? collisionData.bodyB.gameObject
    //       : collisionData.bodyA.gameObject
    //   const enemy =
    //     collisionData.bodyB.gameObject.key !== 'weapon'
    //       ? collisionData.bodyB.gameObject
    //       : collisionData.bodyA.gameObject
    //   console.log(bullet, enemy)

    //   if (bullet) {
    //     bullet.setActive(false)
    //     bullet.setVisible(false)
    //     bullet.world.remove(bullet.body, true)
    //   }

    //   // if (enemy && enemy.setActive) {
    //   //   enemy.setActive(false)
    //   //   enemy.setVisible(false)
    //   //   enemy.world.remove(enemy.body, true)
    //   // }
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
    this.createSmoke()

    this.setActive(true)
    this.key = 'tankDestroy'
    this.removeAllListeners()
    this.damageImage.setVisible(true)

    // this.smoke.start()
    // this.world.remove(this.body, true)
    // this.setStatic(true)
    // this.destroy(true)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)
    this.damageImage.setPosition(this.x, this.y)
    this.damageImage.setAngle(this.angle)

    // this.areol.setPosition(this.x, this.y)
    this.arrow.setPosition(this.x, this.y)
    this.arrow.setAngle(this.angle)

    if (this.ecsId === this.scene.idFollower) {
      // this.areol.setVisible(true)
      this.arrow.setVisible(true)
    } else {
      // this.areol.setVisible(false)
      this.arrow.setVisible(false)
    }
  }
}
