import Phaser from 'phaser'

import {
  defineSystem,
  defineQuery,
  enterQuery,
  exitQuery,
  removeEntity,
  addEntity,
  addComponent
} from 'bitecs'

import { Position } from '../components/Position'
import { GameOptions, tankAmunition, tankCategory, weaponCategory } from '../options/gameOptions'
import { Weapon } from '../components/Weapon'
import { WeaponMapObject } from '../objects/WeaponMapObject'
import { Tank } from '../components/Tank'

export const weaponById = new Map<number, WeaponMapObject>()

export function createWeaponSystem(scene: Phaser.Scene) {
  const query = defineQuery([Weapon])
  const queryTank = defineQuery([Position, Tank])

  const onQueryExitTank = exitQuery(queryTank)
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)

  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)
    for (let i = 0; i < enterEntities.length; ++i) {
      const id = enterEntities[i]

      const x = Position.x[id]
      const y = Position.y[id]

      const configObject = GameOptions.weaponObjects.find((x) => x.type === Weapon.type[id])

      const obj = new WeaponMapObject(id, world, scene.matter.world, x, y, configObject, {
        isStatic: true,
        density: 1000,
        collisionFilter: {
          category: weaponCategory,
          mask: tankCategory | tankAmunition
        }
      })
      // console.log('Add weapon', id)
      weaponById.set(id, obj)
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      weaponById.get(id).removeObject()
      weaponById.delete(id)
      // console.log('Delete weapon', id)
    }

    const weapons = query(world)
    const exitTanks = onQueryExitTank(world)
    for (const id of exitTanks) {
      const allWeapons = weapons.filter((x) => Weapon.entityId[x] == id)
      // console.log('allWeapons: ', allWeapons)

      for (let i = 0; i < allWeapons.length; i++) {
        const idWeapon = allWeapons[i]
        // const x = Position.x[id]
        // const y = Position.y[id]
        // const vec = new Phaser.Math.Vector2(x, y)
        // const azimut = Phaser.Math.FloatBetween(-Math.PI, Math.PI)
        // vec.setToPolar(azimut, 120)
        // const x2 = x + vec.x
        // const y2 = y + vec.y

        // const xVals = [x, x2]
        // const yVals = [y, y2]
        // scene.createEntityWithEffect(xVals, yVals, () => {
        //   const recreateWeaponId = addEntity(world)
        //   addComponent(world, Weapon, recreateWeaponId)

        //   Position.x[recreateWeaponId] = x2
        //   Position.y[recreateWeaponId] = y2
        //   // console.log(idWeapon, Weapon.type[idWeapon], Weapon.count[idWeapon])

        //   Weapon.type[recreateWeaponId] = Weapon.type[idWeapon]
        //   Weapon.entityId[recreateWeaponId] = -1
        //   Weapon.count[recreateWeaponId] = Weapon.count[idWeapon]
        //   Weapon.isRefresh[recreateWeaponId] = 0

        //   removeEntity(world, idWeapon)
        // })
        removeEntity(world, idWeapon)
      }
    }

    // const entities = query(world)
    // for (let i = 0; i < entities.length; ++i) {
    //   const id = entities[i]
    //   console.log(`${Position.x[id]}, ${Position.y[id]}`)
    // }

    return world
  })
}
