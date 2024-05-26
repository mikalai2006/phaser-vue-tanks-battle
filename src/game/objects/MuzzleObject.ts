import { IWorld, removeEntity } from 'bitecs'
import { Entity } from '../components/Entity'
import { Tank } from '../components/Tank'
import { GameOptions } from '../options/gameOptions'
import { IMuzzleConfigItem, IWeaponObject, KeySound } from '../types'
import { WeaponObject } from './WeaponObject'
import { tanksById } from '../systems/matter'
import { replaceRegexByArray } from '../utils/utils'

export class MuzzleObject extends Phaser.Physics.Matter.Sprite {
  key = 'muzzle'
  ecsId: number
  level: number = 0
  tower: Phaser.Physics.Matter.Sprite | Phaser.GameObjects.GameObject | Phaser.Physics.Matter.Image
  // emitterPath: Phaser.GameObjects.Particles.ParticleEmitter
  // weaponRefreshEvent: Phaser.Time.TimerEvent
  emitter: Phaser.GameObjects.Particles.ParticleEmitter
  muzzleConfig: IMuzzleConfigItem
  rotateTween: Phaser.Tweens.Tween
  count: number
  indicatorWeapon: Phaser.GameObjects.Arc
  weaponConfig: IWeaponObject

  ecsWorld: IWorld

  constructor(
    ecsId: number,
    ecsWorld: IWorld,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    level: number,
    bodyOptions: Phaser.Types.Physics.Matter.MatterBodyConfig,
    weaponConfig: IWeaponObject
  ) {
    const options = GameOptions.muzzles
    super(world, x, y, options.key, options.items[level].frame, {
      ...bodyOptions,
      vertices: options.items[level].vert,
      render: {
        sprite: options.items[level].offset
      }
    })
    this.ecsWorld = ecsWorld

    // matter.body.setCentre(towerObject?.body, { x: -60, y: 0 }, true)
    this.ecsId = ecsId
    this.level = level
    // this.setFrictionAir(0)
    // this.setFixedRotation()
    // this.setActive(false)

    this.scene.add.existing(this)

    this.weaponConfig = weaponConfig
    this.indicatorWeapon = this.scene.add
      .arc(x, y, 6, 0, 360, false, this.weaponConfig.color, 1)
      .setDepth(12)

    this.setDepth(11)

    this.emitter = this.scene.add.particles(0, 0, 'flares').setDepth(3)
  }

  fire(
    x: number,
    y: number,
    angle: number,
    muzzleConfig: IMuzzleConfigItem,
    /**
     * номер выстрела в очередности
     */
    numberShot: number
  ) {
    this.muzzleConfig = muzzleConfig

    if (this.scene.cameras.main.cull([this]).length && this.scene.isMute) {
      this.scene.sound.play(this.muzzleConfig.sound, {
        volume: 1
      })
    }

    this.indicatorWeapon.setFillStyle(this.weaponConfig.color)

    this.play(`${this.muzzleConfig.keyAnimation}${numberShot > 1 ? numberShot : ''}`, true)

    // const vec = new Phaser.Math.Vector2(x, y)
    // vec.setToPolar(angle, -20)
    const angleDeg = Phaser.Math.RadToDeg(angle)
    this.emitter.setPosition(x, y) //(x + vec.x, y + vec.y)
    this.emitter
      .setConfig({
        frame: this.weaponConfig.frameParticleMuzzle,
        // color: [0x96e0da, 0x937ef3],
        lifespan: 100,
        angle: angleDeg, // { min: angleDeg, max: angleDeg + Math.sign(angleDeg) * 20 },
        scale: 0.5,
        speed: { min: 500, max: 1300 },
        // advance: 2000,
        blendMode: 'ADD',
        stopAfter: 10
      })
      .start()
    this.scene.minimap?.ignore([this, this.emitter])

    const bullet: WeaponObject = this.scene.bullets
      .get(this.weaponConfig.type)
      .find((bullet) => !bullet.active)
    if (bullet) {
      bullet.setEcsId(this.ecsId)

      if (this.ecsId == this.scene.idPlayer) {
        this.scene.scene.get('Control').showHelp('refreshWeapon', 2000)
      }

      bullet.fire(x, y, this.rotation, this.weaponConfig, muzzleConfig)
      bullet.setOnCollide((collisionData) => {
        if (!this.scene) {
          return
        }

        const bul: WeaponObject =
          collisionData.bodyB.gameObject?.key === 'weapon'
            ? collisionData.bodyB.gameObject
            : collisionData.bodyA.gameObject
        const enemyBody =
          collisionData.bodyB.gameObject?.key !== 'weapon'
            ? collisionData.bodyB
            : collisionData.bodyA
        const enemy: WeaponObject = enemyBody.gameObject
        // console.log(bul, enemyBody, collisionData)

        if (bul && !['bonus'].includes(enemy?.key) && !enemyBody.isSensor) {
          bul.boom()
          // bul.setActive(false)
          // bul.setVisible(false)
          // bul.world.remove(bul.body, true)
        }

        // if collision with their body
        if ((enemy && enemy.ecsId == this.ecsId) || !enemy) {
          return
        }
        // console.log(id, bul, enemy?.ecsId)
        // this.ecsId === 0 && console.log(Tank.health[enemy.ecsId])

        // if entity death
        if (!Tank.health[enemy.ecsId] || Tank.health[enemy.ecsId] <= 0 || bul.key == enemy.key) {
          return
        }

        const friendlyFire = Entity.teamIndex[enemy.ecsId] == Entity.teamIndex[this.ecsId]
        if (friendlyFire && !this.scene.gameData.settings.friendlyFire) {
          return
        }
        // #${Phaser.Display.Color.ComponentToHex(
        //   GameOptions.configTeams[Entity.teamIndex[id]].colorAttackZone
        // )}
        if (enemy && ['tank', 'caterpillar', 'tower', 'muzzle'].includes(enemy.key)) {
          // console.log(enemy.key)

          if (friendlyFire && this.ecsId == this.scene.idPlayer && !this.scene.scene.isPaused()) {
            this.scene.scene.get('Control').showHelp('friendly', 5000)
          }

          // const complexityDiff = (this.scene.configRound.playerLevel / 10) * GameOptions.complexity
          const damage = bullet.weaponConfig.damage * this.muzzleConfig.weaponKoof //Math.ceil( + 10 * (Tank.index[this.ecsId] / 4))
          //  Phaser.Math.Clamp(
          //   weaponConfig.damage * complexityDiff,
          //   weaponConfig.damage,
          //   weaponConfig.damage * complexityDiff
          // )

          if (enemy.ecsId == this.scene.idPlayer || this.ecsId == this.scene.idPlayer) {
            const text = this.scene.add
              .text(enemy.x, enemy.y, `-${damage}${this.scene.lang.options.health}`, {
                color: friendlyFire ? '#ff0000' : '#ffffff',
                fontFamily: 'Arial',
                fontSize: 20
              })
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
          }
          Tank.health[enemy.ecsId] -= damage
          tanksById.get(enemy.ecsId)?.onGetDamage()

          if (friendlyFire) {
            Entity.roundCoin[this.ecsId] -= damage
          } else {
            Entity.roundCoin[this.ecsId] += damage
          }
          if (this.ecsId == this.scene.idPlayer) {
            this.scene.roundCoin = Entity.roundCoin[this.ecsId]
          }
          // console.log('Damage tank ', enemy.ecsId, Tank.health[enemy.ecsId])

          if (Tank.health[enemy.ecsId] <= 0) {
            if (enemy.ecsId === this.scene.idFollower) {
              this.scene.setFollower(Entity.target[enemy.ecsId])
            }
            Entity.targetDeath[enemy.ecsId] = this.ecsId
            removeEntity(this.ecsWorld, enemy.ecsId)

            // add % cost for destroy
            if (
              (enemy.ecsId == this.scene.idPlayer || this.ecsId == this.scene.idPlayer) &&
              !friendlyFire
            ) {
              const coinByDestroy = Phaser.Math.Clamp(
                Math.ceil(GameOptions.complexTanks[Tank.index[enemy.ecsId]].cost * 0.01),
                50,
                1000
              )
              Entity.roundCoin[this.ecsId] += coinByDestroy
              const text = this.scene.add
                .text(5, 5, replaceRegexByArray(this.scene.lang.coinByDestroy, [coinByDestroy]), {
                  color: friendlyFire ? '#ff0000' : '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 20
                })
                .setOrigin(0)
              const bgText = this.scene.add
                .rectangle(
                  0,
                  0,
                  text.width + 10,
                  text.height + 10,
                  Phaser.Display.Color.ValueToColor(GameOptions.colors.success).color,
                  0.5
                )
                .setOrigin(0)
              const textContainer = this.scene.add
                .container(this.x - bgText.width / 2, this.y, [bgText, text])
                .setDepth(999999)

              this.scene.tweens.addCounter({
                from: 0,
                to: 2,
                duration: 3000,
                onUpdate: (tween) => {
                  const v = tween.getValue()
                  textContainer.y = textContainer.y - v
                },
                onComplete: () => {
                  textContainer.removeAll(true)
                  textContainer.destroy(true)
                }
              })
            }

            // enemy.setActive(false)
            // enemy.setVisible(false)
            // enemy.world.remove(enemy.body, true)
          }
        }
      })
    }
  }

  rotateFromTo(fromAngle: number, toAngle: number, duration: number) {
    if (this.count < 100) {
      this.count += 1
      return
    }
    if (this.rotateTween) this.rotateTween.remove()
    console.log('rotateFromTo: ', fromAngle, toAngle)

    this.rotateTween = this.scene.tweens.add({
      targets: this,
      duration,
      angle: { from: fromAngle, to: toAngle }
    })
    this.rotateTween.play()
    this.count = 0
  }

  removeObject() {
    // this.emitterPath.destroy()
    // this.world.remove(this.tower.body, true)
    this.world.remove(this.body, true)
    this.indicatorWeapon.destroy()
    // this.weaponRefreshEvent?.destroy()
    // this.tower.destroy(true)
    this.destroy(true)
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta)

    if (this.muzzleConfig) {
      const vec = new Phaser.Math.Vector2(this.x, this.y)
      vec.setToPolar(this.rotation, this.muzzleConfig.vert[0].x)
      const x2 = this.x + vec.x
      const y2 = this.y + vec.y

      this.emitter.setPosition(x2, y2)
    }

    if (this.indicatorWeapon) {
      if (this.weaponConfig.type != Tank.activeWeaponType[this.ecsId]) {
        this.weaponConfig = GameOptions.weaponObjects.find(
          (x) => x.type == Tank.activeWeaponType[this.ecsId]
        )
        this.indicatorWeapon.setFillStyle(this.weaponConfig.color)
      }

      // const vec = new Phaser.Math.Vector2(this.x, this.y)
      // vec.setToPolar(this.rotation, 20)
      // const x2 = this.body.position.x + vec.x
      // const y2 = this.body.position.y + vec.y

      // this.indicatorWeapon.x = x2
      // this.indicatorWeapon.y = y2
      // this.indicatorWeapon.angle = this.angle
    }
  }

  // destroy(fromScene?: boolean): void {
  //   super.destroy(fromScene)
  //   console.log('destroy Muzzle')
  // }
}
