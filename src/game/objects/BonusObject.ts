import { IWorld, addComponent, addEntity, defineQuery, removeEntity } from 'bitecs'
import { Bonus } from '../components/Bonus'
import { Tank } from '../components/Tank'
import { BonusType, GameOptions, bonusCategory } from '../options/gameOptions'
import { IBonusConfig } from '../types'
import Position from '../components/Position'
import { isProbability } from '../utils/utils'
import { tanksById } from '../systems/matter'

export class BonusObject extends Phaser.Physics.Matter.Sprite {
  key = 'bonus'
  ecsId: number
  image: Phaser.GameObjects.Image
  bonusConfig: IBonusConfig
  bonusRefreshEvent: Phaser.Time.TimerEvent
  startTimer: boolean = false
  emitter: Phaser.GameObjects.Particles.ParticleEmitter
  explodeSound:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.WebAudioSound

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
      isSensor: true,
      collisionFilter: {
        category: bonusCategory
      }
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
      .setTint(
        Bonus.value[this.ecsId] >= -1
          ? bonusConfig.color
          : GameOptions.ui.dangerText.replace('#', '0x')
      )

    this.scene.add.existing(this)
    this.scene.minimap?.ignore([this, this.image])

    this.explodeSound = this.scene.sound.add('get_bonus', {
      volume: 0.2
    })

    this.emitter = this.scene.add
      .particles(0, 0, 'smokeBoom', {
        frame: 7,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        //lifespan: 2000,
        // angle: { min: -100, max: -80 },
        color: [0x666666, this.bonusConfig.color, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 1, end: 0, ease: 'sine.out' },
        speed: 150,
        emitting: false
      })
      .on('complete', () => {
        this.setActive(false)
      })
      .setDepth(100)
      .startFollow(this)

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
        collisionData.bodyB.gameObject != this
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      // console.log(bonusObject, targetObject)

      if (!targetObject || bonusObject.startTimer) {
        return
      }

      const ecsId = targetObject.ecsId
      if (ecsId === undefined || ['weapon'].includes(targetObject.key)) {
        return
      }

      if (bonusObject.startTimer) {
        return
      } else {
        bonusObject.startTimer = true
      }

      bonusObject.hide()

      const tankObject = tanksById.get(ecsId)
      if (!tankObject) {
        return
      }

      // const tankConfigGame = GameOptions.tanks.items[Tank.level[ecsId]].game

      // const tankConfigOptions = {
      //   ...GameOptions.tanks.items[Tank.level[ecsId]].game,
      //   ...GameOptions.towers.items[Tank.levelTower[ecsId]].game,
      //   ...GameOptions.muzzles.items[Tank.levelMuzzle[ecsId]].game
      // }

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

      const query = defineQuery([Bonus])
      const entities = query(ecsWorld)
      const bonusExistId = entities.find(
        (x) => Bonus.entityId[x] == ecsId && Bonus.type[x] == this.bonusConfig.type
      )

      if (Bonus.value[this.ecsId] === -1) {
        // console.log('Full restore ', keyBonus, Tank[keyBonus][ecsId])
        Tank[keyBonus][ecsId] = max

        removeEntity(ecsWorld, this.ecsId)

        switch (bonusObject.bonusConfig.type) {
          case BonusType.health: {
            tankObject.onHealth()
            break
          }
        }
      } else {
        let newValue = 0
        if (bonusExistId) {
          Bonus.value[bonusExistId] = Bonus.value[bonusExistId] + Bonus.value[this.ecsId]
          removeEntity(ecsWorld, this.ecsId)

          if (Bonus.value[bonusExistId] == 0) {
            removeEntity(ecsWorld, bonusExistId)
          }

          newValue = Phaser.Math.Clamp(Tank[keyBonus][ecsId] + Bonus.value[this.ecsId], 0, max)
        } else {
          Bonus.entityId[this.ecsId] = ecsId
          // console.log('Add bonus ', keyBonus)
          newValue = Phaser.Math.Clamp(
            Tank[keyBonus][ecsId] + Bonus.value[this.ecsId],
            0,
            //GameOptions.maximum[keyBonus]
            max
          )
          if (Bonus.value[this.ecsId] == 0) {
            removeEntity(ecsWorld, this.ecsId)
          }
          // console.log(keyBonus, Tank[keyBonus][ecsId], newValue, max)
        }
        // ecsId === this.scene.idPlayer && console.log(keyBonus, newValue)
        Tank[keyBonus][ecsId] = newValue
      }

      if (Bonus.duration[this.ecsId] > 0) {
        this.scene.time.delayedCall(
          bonusObject.bonusConfig.duration,
          () => {
            // console.log('Refresh bonus', keyBonus, Bonus.duration[bonusExistId || this.ecsId])
            // Bonus.value[this.ecsId] = 0
            Tank[keyBonus][ecsId] =
              Tank[`max${keyBonus.charAt(0).toUpperCase() + keyBonus.slice(1)}`][ecsId] //max //tankConfigGame.speed
            // console.log('Return default value', keyBonus, Bonus.duration[this.ecsId])
            removeEntity(ecsWorld, bonusExistId || this.ecsId)
          },
          [],
          this.scene
        )
      }

      if (bonusObject.bonusConfig.timeRefresh > 0) {
        this.scene.time.delayedCall(
          bonusObject.bonusConfig.timeRefresh,
          () => {
            const bonus = GameOptions.bonuses.find((x) => bonusConfig.type == x.type)

            const bonusId = addEntity(ecsWorld)

            addComponent(ecsWorld, Bonus, bonusId)
            Bonus.type[bonusId] = bonus.type
            Bonus.value[bonusId] =
              isProbability(0.5) || bonus.value == -1 ? bonus.value : -bonus.value
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

      const procent = ((Bonus.value[this.ecsId] * 100) / max).toFixed(1)
      if (ecsId == this.scene.idPlayer || this.scene.gameData.settings.showToast) {
        const bgText = this.scene.add
          .rectangle(
            0,
            0,
            400,
            50,
            Bonus.value[this.ecsId] >= 0 || Bonus.value[this.ecsId] === -1
              ? GameOptions.workshop.colorHighProgress
              : GameOptions.workshop.colorLowProgress,
            0.7
          )
          .setOrigin(0.5)
        const text = this.scene.add
          .text(
            0,
            0,
            Bonus.value[this.ecsId] === -1
              ? `${this.scene.lang.repair} ${this.scene.lang.options[keyBonus]}`
              : `${this.scene.lang.options[keyBonus]} ${procent >= 0 ? '+' : ''}${procent}%`,
            {
              color: '#ffffff',
              fontFamily: 'Arial',
              fontSize: 25
            }
          )
          .setOrigin(0.5)
        const textContainer = this.scene.add
          .container(targetObject.x, targetObject.y, [bgText, text])
          .setDepth(999999)
        this.scene.tweens.addCounter({
          from: 0,
          to: 2,
          duration: 3000,
          onUpdate: (tween) => {
            const v = tween.getValue()
            textContainer.y = textContainer.y - v
            textContainer.alpha -= v * 0.005
          },
          onComplete: () => {
            textContainer.destroy()
          }
        })
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

  hide() {
    if (this.scene.cameras.main.cull([this]).length && this.scene.isMute) {
      this.emitter.explode(16)
      this.explodeSound.play()
    }
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
    // this.world.remove(this.tower.body, true)
    this.world.remove(this.body, true)
    this.bonusRefreshEvent?.destroy()
    // this.tower.destroy(true)
    this.destroy(true)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    this.image.setPosition(this.x, this.y)
    this.image.setAngle(this.angle)
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene)

    this.explodeSound.stop()
  }
}
