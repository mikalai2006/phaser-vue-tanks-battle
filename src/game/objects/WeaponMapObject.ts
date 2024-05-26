import { IWorld, addComponent, addEntity, defineQuery, removeEntity } from 'bitecs'
import { IWeaponObject, KeyParticles, KeySound } from '../types'
import { GameOptions, WeaponType } from '../options/gameOptions'
import Position from '../components/Position'
import { Weapon } from '../components/Weapon'
import { Tank } from '../components/Tank'

export class WeaponMapObject extends Phaser.Physics.Matter.Sprite {
  key = 'weaponMap'
  ecsId: number
  config: IWeaponObject
  weaponRefreshEvent: Phaser.Time.TimerEvent
  status: boolean = true
  container: Phaser.GameObjects.Container
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

    this.explodeSound = this.scene.sound.get(KeySound.GetBonus)

    const bgImage = this.scene.add.circle(
      0,
      0,
      20,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.colorWeaponBg).color,
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
    if (!Weapon.isRefresh[this.ecsId]) {
      this.world.remove(this.body, true)
      this.setVisible(false)
      this.container.setVisible(false)
    }

    this.scene.add.existing(this)
    this.scene.minimap?.ignore([this])
    this.scene.minimap?.ignore([this, this.container])

    if (this.scene.configRound.night) {
      this.setPipeline('Light2D')
      bgImage.setPipeline('Light2D')
      image.setPipeline('Light2D')
    }

    this.emitter = this.scene.add
      .particles(0, 0, KeyParticles.SmokeBoom, {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        //lifespan: 2000,
        // angle: { min: -100, max: -80 },
        color: [0x666666, this.config.color, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 1, end: 0, ease: 'sine.out' },
        speed: 150,
        emitting: false
      })
      .on('complete', () => {
        // console.log('complete destroy')
        this.setActive(false)
      })
      .setDepth(100)
      .startFollow(this)

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

      if (targetObject.ecsId == this.scene.idPlayer) {
        const controlScene = this.scene.scene.get('Control')
        controlScene.showHelp('weapon', 2000).then((r) => {
          controlScene.showHelp('checkWeapon', 2000)
        })
      }

      const ecsId = targetObject.ecsId
      if (ecsId === undefined || ['weapon'].includes(targetObject.key)) {
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
      let idWeapon = this.ecsId

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
        idWeapon = weaponExistId
        removeEntity(ecsWorld, this.ecsId)
      } else {
        Weapon.entityId[this.ecsId] = ecsId
      }

      if (this.scene.idPlayer == ecsId && this.scene.gameData.settings.autoCheckWeapon) {
        const weaponsIds = entities
          .filter((x) => Weapon.entityId[x] == ecsId)
          .sort((a, b) => Weapon.type[a] - Weapon.type[b])
        // console.log(
        //   weaponsIds.reduce((ac, el) => {
        //     const a = ac || []
        //     a.push(Weapon.type[el])
        //     return a
        //   }, [])
        // )

        if (weaponsIds.length > 0) {
          Tank.activeWeaponType[ecsId] = Weapon.type[weaponsIds[weaponsIds.length - 1]]
        } else {
          Tank.activeWeaponType[ecsId] = WeaponType.default
        }
      }

      // if save finded shells
      if (ecsId == this.scene.idPlayer && GameOptions.saveWeapons) {
        const playerWeapons = this.scene.gameData.weapons
        const existWeaponValue = playerWeapons[this.config.type] || 0
        this.scene.gameData.weapons[this.config.type] = existWeaponValue + Weapon.count[this.ecsId]
      }

      if (Weapon.isRefresh[this.ecsId]) {
        this.scene.time.delayedCall(
          weaponObject.config.timeRefresh,
          () => {
            const weaponId = addEntity(ecsWorld)
            if (weaponId) {
              addComponent(ecsWorld, Weapon, weaponId)
              Weapon.type[weaponId] = this.config.type
              Weapon.count[weaponId] = this.config.count
              Weapon.entityId[weaponId] = -1
              Weapon.isRefresh[weaponId] = this.config.timeRefresh > 0 ? 1 : 0

              addComponent(ecsWorld, Position, weaponId)
              Position.x[weaponId] = Position.x[this.ecsId]
              Position.y[weaponId] = Position.y[this.ecsId]
            } else {
              console.error(`Not found ecsId: `, weaponId)
            }
          },
          [],
          this.scene
        )
      }

      const keyWeapon = Object.keys(WeaponType).find(
        (key) => WeaponType[key] === weaponObject.config.type
      )

      weaponObject.hide()

      if (ecsId == this.scene.idPlayer || this.scene.gameData.settings.showToast) {
        const text = this.scene.add
          .text(
            5,
            5,
            Weapon.count[this.ecsId] === -1
              ? `${this.scene.lang.repair} ${this.scene.lang.weapons[keyWeapon]} ${this.scene.lang.weapon}`
              : `${this.scene.lang.weapons[keyWeapon]} ${this.scene.lang.weapon} +${Weapon.count[this.ecsId]}`,
            {
              color: '#ffffff',
              fontFamily: 'Arial',
              fontSize: 20
            }
          )
          .setOrigin(0)
        const bgText = this.scene.add
          .rectangle(0, 0, text.width + 10, text.height + 10, this.config.color, 0.5)
          .setOrigin(0)
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
    if (this.scene.cameras.main.cull([this]).length) {
      this.emitter.explode(16)

      if (this.scene.isMute) {
        this.explodeSound.play()
      }
    }

    this.world.remove(this.body, true)
    this.setVisible(false)
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

  // setDestroy() {
  //   // this.setFrame(this.config.frameEnd)
  //   this.setActive(false)
  //   this.world.remove(this.body, true)
  // }

  removeObject() {
    this.setActive(false)
    this.world.remove(this.body, true)
    this.container.setVisible(false)

    this.destroy(true)
  }

  // destroy(fromScene?: boolean): void {
  //   super.destroy(fromScene)
  //   console.log('Destroy weaponMapObject')
  // }
}
