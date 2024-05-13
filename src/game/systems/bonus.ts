import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, exitQuery, addEntity, addComponent } from 'bitecs'
import { GameOptions, bonusCategory, tankAmunition, tankCategory } from '../options/gameOptions'
import { Bonus } from '../components/Bonus'
import Position from '../components/Position'
import { BonusObject } from '../objects/BonusObject'
import { Player } from '../components/Player'

export const bonusesById = new Map<number, Phaser.Physics.Matter.Sprite>()

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

    // const entities = query(world)
    // for (let i = 0; i < entities.length; ++i) {
    //   const id = entities[i]

    // }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      // console.log('remove bonus: ', id)
      // const tank = bonusesById.get(id)
      // const tower = towersById.get(id)
      // const caterpillars = caterpillarsById.get(id)
      // tank.removeTank()
      // tower.removeTower()
      // caterpillars.left.removeCatterpillar()
      // caterpillars.right.removeCatterpillar()

      bonusesById.delete(id)
      // towersById.delete(id)
      // caterpillarsById.delete(id)
    }

    return world
  })
}

export function createBonusSyncSystem(scene) {
  const query = defineQuery([Bonus])
  return defineSystem((world, dt) => {
    const entities = query(world)

    for (const id of entities) {
    }

    return world
  })
}
