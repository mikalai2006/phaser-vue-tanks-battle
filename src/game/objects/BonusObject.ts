import { IWorld, addComponent, addEntity, removeEntity } from 'bitecs'
import { Bonus } from '../components/Bonus'
import { Tank } from '../components/Tank'
import { BonusType, GameOptions } from '../options/gameOptions'
import { IBonusConfig } from '../types'
import Position from '../components/Position'
import { getMaxOptionValue } from '../utils/utils'

export class BonusObject extends Phaser.Physics.Matter.Sprite {
  key = 'bonus'
  ecsId: number
  image: Phaser.GameObjects.Image
  emitterPath: Phaser.GameObjects.Particles.ParticleEmitter
  bonusConfig: IBonusConfig
  bonusRefreshEvent: Phaser.Time.TimerEvent
  startTimer: boolean = false

  constructor(
    ecsId: number,
    ecsWorld: IWorld,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    bonusConfig: IBonusConfig,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, 'bonusBg', 0, {
      ...bodyOptions,
      isSensor: true
      // vertices: options.items[level].vert
      // render: {
      //   sprite: options.items[level].offset
      // }
    })
    this.bonusConfig = bonusConfig
    // matter.body.setCentre(towerObject?.body, { x: -60, y: 0 }, true)
    this.ecsId = ecsId
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.world.remove(this.body, true)
    // this.setActive(false)
    this.image = this.scene.add
      .image(x, y, 'bonuses', bonusConfig.frame)
      .setOrigin(0.5)
      .setDepth(6)
      .setScale(0.7)
      .setTint(bonusConfig.color)

    this.scene.add.existing(this)
    this.scene.minimap?.ignore([this, this.image])

    this.setDepth(2)

    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
      this.image.setPipeline('Light2D')
    }

    this.setOnCollide((collisionData) => {
      const bonusObject: BonusObject =
        collisionData.bodyB.gameObject == this
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      const targetObject =
        collisionData.bodyB.gameObject?.key === 'tank'
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      // console.log(bonusObject, targetObject)

      if (!targetObject || bonusObject.startTimer) {
        return
      }

      const ecsId = targetObject.ecsId
      if (ecsId === undefined) {
        return
      }

      if (bonusObject.startTimer) {
        return
      } else {
        bonusObject.startTimer = true
      }

      const tankConfigGame = GameOptions.tanks.items[Tank.level[ecsId]].game
      const keyBonus = Object.keys(BonusType).find(
        (key) => BonusType[key] === bonusObject.bonusConfig.type
      )

      const max = GameOptions.optionsOnlyRepair.includes(keyBonus)
        ? Tank[`max${keyBonus.charAt(0).toUpperCase() + keyBonus.slice(1)}`][ecsId]
        : // : getMaxOptionValue(
          //     keyBonus,
          //     Tank.level[ecsId],
          //     Tank.levelTower[ecsId],
          //     Tank.levelMuzzle[ecsId]
          //   )
          GameOptions.maximum[keyBonus]

      if (bonusObject.bonusConfig.value === -1) {
        // console.log('Full restore ', keyBonus, Tank[keyBonus][ecsId])
        Tank[keyBonus][ecsId] = max

        removeEntity(ecsWorld, this.ecsId)

        switch (bonusObject.bonusConfig.type) {
          case BonusType.health: {
            targetObject.onHealth()
            break
          }
        }
      } else {
        Bonus.entityId[this.ecsId] = ecsId
        // console.log('Add bonus ', keyBonus)

        const newValue = Phaser.Math.Clamp(
          Tank[keyBonus][ecsId] + bonusObject.bonusConfig.value,
          0,
          //GameOptions.maximum[keyBonus]
          max
        )
        // console.log(keyBonus, Tank[keyBonus][ecsId], newValue, max)

        Tank[keyBonus][ecsId] = newValue
      }

      if (bonusObject.bonusConfig.timeRefresh > 0) {
        this.scene.time.delayedCall(
          bonusObject.bonusConfig.timeRefresh,
          () => {
            const bonus = GameOptions.bonuses.find((x) => bonusConfig.type == x.type)

            const bonusId = addEntity(ecsWorld)

            addComponent(ecsWorld, Bonus, bonusId)
            Bonus.type[bonusId] = bonus.type
            Bonus.value[bonusId] = bonus.value
            Bonus.duration[bonusId] = bonus.duration
            Bonus.entityId[bonusId] = -1

            addComponent(ecsWorld, Position, bonusId)
            Position.x[bonusId] = Position.x[this.ecsId]
            Position.y[bonusId] = Position.y[this.ecsId]
          },
          [],
          this.scene
        )
      }

      bonusObject.hide()

      const text = this.scene.add
        .text(
          targetObject.x,
          targetObject.y,
          bonusObject.bonusConfig.value === -1
            ? `${this.scene.lang.repair} ${this.scene.lang.options[keyBonus]}`
            : `${this.scene.lang.options[keyBonus]} +${bonusObject.bonusConfig.value}`,
          {
            color: '#ffffff',
            fontFamily: 'Arial',
            fontSize: 25
          }
        )
        .setDepth(999999)
      this.scene.tweens.addCounter({
        from: 0,
        to: 2,
        duration: 3000,
        onUpdate: (tween) => {
          const v = tween.getValue()
          text.y = text.y - v
        },
        onComplete: () => {
          text.destroy()
        }
      })

      if (Bonus.duration[this.ecsId] > 0) {
        // console.log('Refresh bonus', keyBonus, Bonus.duration[id])
        this.scene.time.delayedCall(
          Bonus.duration[this.ecsId],
          () => {
            Bonus.value[this.ecsId] = 0
            Tank[keyBonus][ecsId] =
              Tank[`max${keyBonus.charAt(0).toUpperCase() + keyBonus.slice(1)}`][ecsId] //max //tankConfigGame.speed
            removeEntity(ecsWorld, this.ecsId)
            // console.log('Return default value', keyBonus, Bonus.duration[id])
          },
          [],
          this.scene
        )
      }
      // switch (bonusObject.bonusConfig.type) {
      //   case BonusType.health:
      //     Tank.health[ecsId] = tankConfigGame.health
      //     break
      //   case BonusType.bullet:
      //     Tank.bulletLevel[ecsId] = Bonus.value[id]
      //     break
      //   case BonusType.speed:
      //     Tank.speed[ecsId] += Bonus.value[id]
      //     scene.time.delayedCall(
      //       Bonus.duration[id],
      //       () => {
      //         Tank.speed[ecsId] = tankConfigGame.speed
      //       },
      //       [],
      //       scene
      //     )
      //     break

      //   default:
      //     break
      // }
    })
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    this.image.setPosition(this.x, this.y)
    this.image.setAngle(this.angle)
  }

  hide() {
    this.setActive(false)
    this.setVisible(false)
    this.world.remove(this.body, true)
    this.image.setVisible(false)

    // console.log('hide: ', this.startTimer, this.bonusConfig.timeRefresh)

    if (this.bonusConfig.timeRefresh > 0 && !this.startTimer) {
      // console.log('Refresh bonus with time: ', this.bonusConfig.timeRefresh)
      this.startTimer = true
      this.bonusRefreshEvent = this.scene.time.delayedCall(
        this.bonusConfig.timeRefresh,
        this.show,
        [],
        this
      )
    }
  }

  show() {
    // // this.world.add(this.body)
    // this.setActive(true)
    // this.setVisible(true)
    // this.image.setVisible(true)
    this.startTimer = false
    // // this.bonusRefreshEvent?.destroy()
  }

  removeTower() {
    // this.emitterPath.destroy()
    // this.world.remove(this.tower.body, true)
    this.world.remove(this.body, true)
    this.bonusRefreshEvent?.destroy()
    // this.tower.destroy(true)
    this.destroy(true)
  }
}
