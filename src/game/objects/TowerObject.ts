import { GameOptions, allCollision, defaultCategory } from '../options/gameOptions'

export class TowerObject extends Phaser.Physics.Matter.Sprite {
  key = 'tower'
  ecsId: number
  level: number = 0
  weaponRefreshEvent: Phaser.Time.TimerEvent

  constructor(
    ecsId: number,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    level: number,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const options = GameOptions.towers
    super(world, x, y, options.key, options.items[level].frame, {
      ...bodyOptions
      // vertices: options.items[level].vert
      // render: {
      //   sprite: options.items[level].offset
      // }
    })
    // matter.body.setCentre(towerObject?.body, { x: -60, y: 0 }, true)
    this.ecsId = ecsId
    this.level = level
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    this.world.remove(this.body, true)
    this.setActive(false)

    // if (this.scene.configRound.night) {
    //   this.setPipeline('Light2D')
    // }

    this.scene.add.existing(this)

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
    // this.setTint(0x779451)
    // this.tower.setTint(0x5a7733)
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
    // world.scene.matter.add.constraint(this, this.tower, 0, 0, {
    //   pointA: JSON.parse(JSON.stringify(optionsTower.level[levelTower].center)),
    //   pointB: JSON.parse(JSON.stringify(optionsTower.level[levelTower].center))
    // })

    // this.emitterPath = world.scene.add.particles(0, 0, 'tank_path', {
    //   tint: 0x9a3412,
    //   // speed: {
    //   //   onEmit: (particle, key, t, value) => tank.body.speed * 10
    //   // },
    //   lifespan: {
    //     onEmit: (particle, key, t, value) => Phaser.Math.Percent(this.body.speed, 0, 100) * 40000
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

  // preUpdate(time, delta) {
  //   super.preUpdate(time, delta)

  //   this.lifespan -= delta

  //   if (this.lifespan <= 0) {
  //     this.setActive(false)
  //     this.setVisible(false)
  //     this.world.remove(this.body, true)
  //   }
  // }
  fire(timeRefresh: number) {
    if (timeRefresh < 500) timeRefresh = 500
    this.weaponRefreshEvent = this.scene.time.delayedCall(
      timeRefresh, //GameOptions.towers.items[this.level].game.timeRefreshWeapon,
      this.onEvent,
      [],
      this
    )
  }

  onEvent() {}

  removeTower() {
    this.weaponRefreshEvent?.destroy()
    // this.setStatic(true)
    // this.world.remove(this.body, true)
    // this.destroy(true)
  }
}
