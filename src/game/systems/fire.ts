import Phaser from 'phaser'

import { defineSystem, defineQuery, enterQuery, exitQuery, removeEntity } from 'bitecs'

import { Rotation } from '../components/Rotation'
import { Velocity } from '../components/Velocity'
import { GameOptions, WeaponType } from '../options/gameOptions'
import { Entity } from '../components/Entity'
import Input from '../components/Input'
import { Tank } from '../components/Tank'
import { Player } from '../components/Player'
import { Weapon } from '../components/Weapon'
import { muzzlesById, tanksById, towersById } from './matter'

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

      // const keyWeapon = Object.keys(WeaponType).find(
      //   (key) => WeaponType[key] === Tank.activeWeaponType[id]
      // )
      const weaponByIdAndType = weapons.filter(
        (x) => Weapon.entityId[x] == id && Weapon.type[x] == Tank.activeWeaponType[id]
      )
      let totalWeapons = weaponByIdAndType.reduce((ac, el) => ac + Weapon.count[el], 0)
      if (totalWeapons <= 0) {
        if (weaponByIdAndType[0] != 0) {
          removeEntity(world, weaponByIdAndType[0])
        }
        // console.log('totalWeapons < 0', id, Tank.activeWeaponType[id])

        Tank.activeWeaponType[id] = WeaponType.default
      }

      if (scene.idPlayer == id && scene.gameData.settings.autoCheckWeapon) {
        const weaponsIds = weapons
          .filter((x) => Weapon.entityId[x] == id)
          .sort((a, b) => Weapon.type[a] - Weapon.type[b])

        if (weaponsIds.length > 0) {
          Tank.activeWeaponType[id] = Weapon.type[weaponsIds[weaponsIds.length - 1]]
        } else {
          Tank.activeWeaponType[id] = WeaponType.default
        }
      }
      // console.log(weaponByIdAndType)

      if (!!Input.fire[id] && !!Entity.weapon[id]) {
        Input.fire[id] = 0
        const time = Tank.timeBeforeShoot[id]
        Tank.timeBeforeShoot[id] = 0

        scene.time.delayedCall(
          !players.includes(id) ? time : 0,
          () => {
            Tank.timeBeforeShoot[id] = Phaser.Math.FloatBetween(
              GameOptions.complexTanks[Tank.index[id]].maxTimeBeforeShoot.min,
              GameOptions.complexTanks[Tank.index[id]].maxTimeBeforeShoot.max
            )

            const configComplexTank = GameOptions.complexTanks[Tank.index[id]]
            const muzzleConfig = GameOptions.muzzles.items[configComplexTank.muzzle]
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
              const existWeaponValue = scene.gameData.weapons[Tank.activeWeaponType[id]]
              if (id == scene.idPlayer && existWeaponValue) {
                scene.gameData.weapons[Tank.activeWeaponType[id]] = Phaser.Math.Clamp(
                  existWeaponValue - 1,
                  0,
                  existWeaponValue
                )
              }

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
                    const existWeaponValue = scene.gameData.weapons[Tank.activeWeaponType[id]]
                    if (id == scene.idPlayer && existWeaponValue) {
                      scene.gameData.weapons[Tank.activeWeaponType[id]] = Phaser.Math.Clamp(
                        existWeaponValue - 1,
                        0,
                        existWeaponValue
                      )
                    }

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
