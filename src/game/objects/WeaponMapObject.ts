import { IWorld, addComponent, addEntity, defineQuery, removeEntity } from 'bitecs'
import { IWeaponObject } from '../types'
import { GameOptions, WeaponType } from '../options/gameOptions'
import Position from '../components/Position'
import { Weapon } from '../components/Weapon'

export class WeaponMapObject extends Phaser.Physics.Matter.Sprite {
  key = 'weaponMap'
  ecsId: number
  config: IWeaponObject
  weaponRefreshEvent: Phaser.Time.TimerEvent
  status: boolean = true
  container: Phaser.GameObjects.Container
  startTimer: boolean = false

  constructor(
    ecsId: number,
    ecsWorld: IWorld,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    config: IWeaponObject,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, 'weaponBg', 0, {
      ...bodyOptions,
      vertices: config.vert,
      isSensor: true
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
    this.setScale(1).setTint(0xffffff)
    const bgImage = this.scene.add.circle(
      0,
      0,
      20,
      GameOptions.ui.colorWeaponBg.replace('#', '0x'),
      1
    )
    const image = this.scene.add
      .image(0, 0, config.texture, config.frame)
      .setOrigin(0.5)
      .setScale(0.6)
    this.container = this.scene.add.container(x, y, [bgImage, image]).setDepth(6)
    // .setTint(bonusConfig.color)
    // matter.body.setCentre(towerObject?.body, { x: -60, y: 0 }, true)
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.world.remove(this.body, true)
    // this.setActive(false)

    this.scene.add.existing(this)
    this.scene.minimap?.ignore([this])
    this.scene.minimap?.ignore([this, this.container])

    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
      bgImage.setPipeline('Light2D')
      image.setPipeline('Light2D')
    }

    // const rotates = [0, 90, 180]
    // this.setAngle(rotates[Phaser.Math.Between(0, rotates.length - 1)])
    this.setDepth(2)

    this.setOnCollide((collisionData) => {
      const weaponObject: WeaponMapObject =
        collisionData.bodyB.gameObject == this
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      const targetObject =
        collisionData.bodyB.gameObject?.key === 'tank'
          ? collisionData.bodyB.gameObject
          : collisionData.bodyA.gameObject
      // console.log(bonusObject, targetObject)

      if (!targetObject || weaponObject.startTimer) {
        return
      }

      const ecsId = targetObject.ecsId
      if (ecsId === undefined) {
        return
      }

      if (weaponObject.startTimer) {
        return
      } else {
        weaponObject.startTimer = true
      }

      const query = defineQuery([Weapon])
      const entities = query(ecsWorld)

      const weaponExistId = entities.find(
        (x) => Weapon.entityId[x] == ecsId && Weapon.type[x] == config.type
      )

      if (weaponExistId) {
        // ecsId == 0 &&
        //   console.log(
        //     ecsId,
        //     weaponExistId,
        //     config.type,
        //     Weapon.count[weaponExistId],
        //     Weapon.count[this.ecsId]
        //   )
        Weapon.count[weaponExistId] += Weapon.count[this.ecsId]
        removeEntity(ecsWorld, this.ecsId)
      } else {
        Weapon.entityId[this.ecsId] = ecsId
      }

      if (weaponObject.config.timeRefresh > 0) {
        this.scene.time.delayedCall(
          weaponObject.config.timeRefresh,
          () => {
            const weaponId = addEntity(ecsWorld)
            addComponent(ecsWorld, Weapon, weaponId)
            Weapon.type[weaponId] = this.config.type
            Weapon.count[weaponId] = this.config.count
            Weapon.entityId[weaponId] = -1

            addComponent(ecsWorld, Position, weaponId)
            Position.x[weaponId] = Position.x[this.ecsId]
            Position.y[weaponId] = Position.y[this.ecsId]
          },
          [],
          this.scene
        )
      }

      const keyWeapon = Object.keys(WeaponType).find(
        (key) => WeaponType[key] === weaponObject.config.type
      )

      weaponObject.hide()

      const text = this.scene.add
        .text(
          targetObject.x,
          targetObject.y,
          weaponObject.config.count === -1
            ? `${this.scene.lang.repair} ${this.scene.lang.weapons[keyWeapon]} ${this.scene.lang.weapon}`
            : `${this.scene.lang.weapons[keyWeapon]} ${this.scene.lang.weapon} +${weaponObject.config.count}`,
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

      // if (Bonus.duration[this.ecsId] > 0) {
      //   // console.log('Refresh bonus', keyBonus, Bonus.duration[id])
      //   this.scene.time.delayedCall(
      //     Bonus.duration[this.ecsId],
      //     () => {
      //       Bonus.value[this.ecsId] = 0
      //       Tank[keyBonus][ecsId] =
      //         Tank[`max${keyBonus.charAt(0).toUpperCase() + keyBonus.slice(1)}`][ecsId] //max //tankConfigGame.speed
      //       removeEntity(ecsWorld, this.ecsId)
      //       // console.log('Return default value', keyBonus, Bonus.duration[id])
      //     },
      //     [],
      //     this.scene
      //   )
      // }
    })
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    this.container.setPosition(this.x, this.y)
    this.container.setAngle(this.angle)
  }

  hide() {
    this.setActive(false)
    this.setVisible(false)
    this.world.remove(this.body, true)
    this.container.setVisible(false)

    // console.log('hide: ', this.startTimer, this.bonusConfig.timeRefresh)

    // if (this.bonusConfig.timeRefresh > 0 && !this.startTimer) {
    //   // console.log('Refresh bonus with time: ', this.bonusConfig.timeRefresh)
    //   this.startTimer = true
    //   this.bonusRefreshEvent = this.scene.time.delayedCall(
    //     this.bonusConfig.timeRefresh,
    //     this.show,
    //     [],
    //     this
    //   )
    // }
  }

  show() {
    // // this.world.add(this.body)
    // this.setActive(true)
    // this.setVisible(true)
    // this.image.setVisible(true)
    this.startTimer = false
    // // this.bonusRefreshEvent?.destroy()
  }

  setDestroy() {
    // this.setFrame(this.config.frameEnd)
    this.setActive(false)
    this.world.remove(this.body, true)
  }

  removeObject() {
    this.world.remove(this.body, true)
    this.destroy(true)
  }
}
