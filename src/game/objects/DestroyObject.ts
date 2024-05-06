import { IWorld, addComponent, addEntity } from 'bitecs'
import { IDestroyObject } from '../types'
import { GameOptions } from '../options/gameOptions'
import { isProbability } from '../utils/utils'
import { Bonus } from '../components/Bonus'
import Position from '../components/Position'

export class DestroyObject extends Phaser.Physics.Matter.Sprite {
  key = 'destroyObject'
  ecsId: number
  config: IDestroyObject
  bonusRefreshEvent: Phaser.Time.TimerEvent
  status: boolean = true

  constructor(
    ecsId: number,
    ecsWorld: IWorld,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    config: IDestroyObject,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, config.texture, config.frameStart, {
      ...bodyOptions,
      vertices: config.vert
      // collisionFilter: {
      //   category: defaultCategory,
      //   mask: sensorCategory & defaultCategory
      // }
      // render: {
      //   sprite: options.items[level].offset
      // }
    })
    this.config = config
    this.ecsId = ecsId
    this.setScale(1.2)
    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
    }
    // matter.body.setCentre(towerObject?.body, { x: -60, y: 0 }, true)
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.world.remove(this.body, true)
    // this.setActive(false)

    this.scene.add.existing(this)
    this.scene.minimap?.ignore([this])

    const rotates = [0, 90, 180]
    this.setAngle(rotates[Phaser.Math.Between(0, rotates.length - 1)])
    this.setDepth(0)

    this.setOnCollide((collisionData) => {
      const destroyObject: DestroyObject =
        collisionData.bodyB.gameObject === this
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      const target: any =
        collisionData.bodyB.gameObject?.key !== 'destroyObject'
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject

      if (!target || !this.status) {
        return
      }

      if (destroyObject && target) {
        this.status = false
      }

      destroyObject.setDestroy()

      const bonus = GameOptions.bonuses[Phaser.Math.Between(0, GameOptions.bonuses.length - 1)]
      const probability = isProbability(bonus.probability)
      // console.log(probability)

      if (probability) {
        // const tile = scene.groundTilesLayer.getTileAtWorldXY(destroyObject.x, destroyObject.y)

        const bonusId = addEntity(ecsWorld)

        addComponent(ecsWorld, Bonus, bonusId)
        // Bonus.gridX[bonusId] = tile.x
        // Bonus.gridY[bonusId] = tile.y
        Bonus.type[bonusId] = bonus.type
        Bonus.value[bonusId] = bonus.value
        Bonus.duration[bonusId] = bonus.duration
        Bonus.entityId[bonusId] = -1

        addComponent(ecsWorld, Position, bonusId)
        Position.x[bonusId] = destroyObject.x
        Position.y[bonusId] = destroyObject.y

        // console.log(destroyObject, target)
      }
    })
  }

  // preUpdate(time, delta) {
  //   super.preUpdate(time, delta)
  // }

  setDestroy() {
    this.setFrame(this.config.frameEnd)
    this.setActive(false)
    this.world.remove(this.body, true)
  }

  removeObject() {
    this.world.remove(this.body, true)
    this.destroy(true)
  }
}
