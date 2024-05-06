import Phaser from 'phaser'

import { defineSystem, defineQuery, enterQuery, exitQuery, removeEntity } from 'bitecs'

import { Rotation } from '../components/Rotation'
import { Velocity } from '../components/Velocity'
import { GameOptions, WeaponType } from '../options/gameOptions'
import { Entity } from '../components/Entity'
import { EntityBar } from '../components/EntityBar'
import Input from '../components/Input'
import { Tank } from '../components/Tank'
import { Player } from '../components/Player'
import { Weapon } from '../components/Weapon'
import { muzzlesById, tanksById, towersById } from './matter'
import { replaceRegexByArray } from '../utils/utils'

export function createFireSystem(scene) {
  const query = defineQuery([Rotation, Velocity, Tank])
  const queryPlayers = defineQuery([Player])
  const queryWeapons = defineQuery([Weapon])

  return defineSystem((world) => {
    const entities = query(world)
    const players = queryPlayers(world)
    const weapons = queryWeapons(world)

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      const tank = tanksById.get(id)
      const tower = towersById.get(id)
      const muzzle = muzzlesById.get(id)

      if (!tank || !tower) {
        continue
      }

      const keyWeapon = Object.keys(WeaponType).find(
        (key) => WeaponType[key] === Tank.activeWeaponType[id]
      )
      const weaponByIdAndType = weapons.filter(
        (x) => Weapon.entityId[x] == id && Weapon.type[x] == Tank.activeWeaponType[id]
      )
      let totalWeapons = weaponByIdAndType.reduce((ac, el) => ac + Weapon.count[el], 0)
      if (totalWeapons <= 0) {
        Tank.activeWeaponType[id] = 0
      }
      // console.log(weaponByIdAndType)

      if (!!Input.fire[id] && !!EntityBar.weapon[id]) {
        Input.fire[id] = 0
        const time = Tank.timeBeforeShoot[id]
        Tank.timeBeforeShoot[id] = 0

        scene.time.delayedCall(
          !players.includes(id) ? time : 0,
          () => {
            Tank.timeBeforeShoot[id] = Phaser.Math.FloatBetween(
              GameOptions.towers.items[Tank.levelTower[id]].maxTimeBeforeShoot.min,
              GameOptions.towers.items[Tank.levelTower[id]].maxTimeBeforeShoot.max
            )

            const muzzleConfig = GameOptions.muzzles.items[Tank.levelMuzzle[id]]
            muzzleConfig.game.distanceShot = Tank.distanceShot[id]
            muzzleConfig.game.speedShot = Tank.speedShot[id]

            if (totalWeapons <= 0 && Tank.activeWeaponType[id] != 0) {
              return
            }

            if (!muzzle.active) {
              return
            }

            // if (Weapon.count[] <= 0) {}

            if (!players.includes(id) && Entity.target[id] == -1) {
              return
            }

            tower.fire(GameOptions.maximum.timeRefreshWeapon - Tank.timeRefreshWeapon[id])
            const { x, y } = muzzle
            muzzle.fire(x, y, muzzle.rotation, muzzleConfig, 1)
            if (Tank.activeWeaponType[id] != 0) {
              Weapon.count[weaponByIdAndType[0]] -= 1
              if (Weapon.count[weaponByIdAndType[0]] == 0) {
                // if (players.includes(id)) {
                //   scene.showToast(
                //     replaceRegexByArray(scene.lang.noneWeapon, [scene.lang.weapons[keyWeapon]]),
                //     GameOptions.workshop.colorLowProgress
                //   )
                // }
                removeEntity(world, weaponByIdAndType[0])
              }
            }

            if (muzzleConfig.countShot > 1) {
              scene.time.delayedCall(
                250,
                () => {
                  if (!muzzle?.body?.position) {
                    return
                  }
                  totalWeapons = weaponByIdAndType.reduce((ac, el) => ac + Weapon.count[el], 0)
                  if (totalWeapons <= 0 && Tank.activeWeaponType[id] != 0) {
                    return
                  }

                  muzzle.fire(muzzle.x, muzzle.y, muzzle.rotation, muzzleConfig, 2)
                  if (Tank.activeWeaponType[id] != 0) {
                    Weapon.count[weaponByIdAndType[0]] -= 1
                    if (Weapon.count[weaponByIdAndType[0]] == 0) {
                      removeEntity(world, weaponByIdAndType[0])
                    }
                  }
                },
                [],
                scene
              )
            }
          },
          [],
          this
        )
      }
    }

    return world
  })
}
