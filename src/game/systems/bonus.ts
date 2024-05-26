import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, exitQuery, removeEntity } from 'bitecs'
import { GameOptions, bonusCategory, tankAmunition, tankCategory } from '../options/gameOptions'
import { Bonus } from '../components/Bonus'
import Position from '../components/Position'
import { BonusObject } from '../objects/BonusObject'
import { Player } from '../components/Player'
import { Tank } from '../components/Tank'

export const bonusesById = new Map<number, BonusObject>()

export function createBonusSystem(scene: Phaser.Scene) {
  const query = defineQuery([Bonus])
  const queryPlayers = defineQuery([Player])

  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)

  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)
    for (let i = 0; i < enterEntities.length; ++i) {
      const id = enterEntities[i]

      const bonusConfig = GameOptions.bonuses.find((x) => x.type == Bonus.type[id])

      const x = Position.x[id]
      const y = Position.y[id]
      // console.log('create bonus', bonusConfig.type, id, x, y)

      const bonus = new BonusObject(id, world, scene.matter.world, x, y, bonusConfig, {
        friction: 0,
        frictionAir: 0.2,
        density: 100,
        collisionFilter: {
          category: bonusCategory,
          mask: tankCategory | tankAmunition
        }
      })

      bonusesById.set(id, bonus)
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      bonusesById.get(id).removeObject()
      bonusesById.delete(id)

      // console.log('Remove bonus: ', id, bonusesById.size)
    }

    return world
  })
}

export function createBonusSyncSystem(scene) {
  const query = defineQuery([Bonus])
  const queryTanks = defineQuery([Position, Tank])
  const onQueryExitTank = exitQuery(queryTanks)

  return defineSystem((world, dt) => {
    const bonusIds = query(world)
    const exitTanks = onQueryExitTank(world)
    for (const id of exitTanks) {
      const allBonusIds = bonusIds.filter((x) => Bonus.entityId[x] == id)
      // console.log('allBonusIds: ', allBonusIds)

      for (let i = 0; i < allBonusIds.length; i++) {
        const idBonus = allBonusIds[i]
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
        //   addComponent(world, Bonus, recreateWeaponId)

        //   Position.x[recreateWeaponId] = x2
        //   Position.y[recreateWeaponId] = y2
        //   // console.log(idWeapon, Weapon.type[idWeapon], Weapon.count[idWeapon])

        //   Bonus.type[recreateWeaponId] = Bonus.type[idBonus]
        //   Bonus.entityId[recreateWeaponId] = -1
        //   Bonus.value[recreateWeaponId] = Bonus.value[idBonus]
        //   Bonus.duration[recreateWeaponId] = Bonus.duration[idBonus]

        //   removeEntity(world, idBonus)
        // })
        removeEntity(world, idBonus)
      }
    }

    return world
  })
}
