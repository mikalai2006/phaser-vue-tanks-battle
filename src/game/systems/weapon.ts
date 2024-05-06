import Phaser from 'phaser'

import { defineSystem, defineQuery, enterQuery, exitQuery } from 'bitecs'

import { Position } from '../components/Position'
import { GameOptions, allCollision } from '../options/gameOptions'
import { Weapon } from '../components/Weapon'
import { WeaponMapObject } from '../objects/WeaponMapObject'

export const weaponById = new Map<number, Phaser.Physics.Matter.Sprite>()

export function createWeaponSystem(scene: Phaser.Scene) {
  const query = defineQuery([Weapon])

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
          category: allCollision
        }
      })

      weaponById.set(id, obj)
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      weaponById.delete(id)
    }

    // const entities = query(world)
    // for (let i = 0; i < entities.length; ++i) {
    //   const id = entities[i]
    //   console.log(`${Position.x[id]}, ${Position.y[id]}`)
    // }

    return world
  })
}

// export function createMatterStaticSpriteSystem() {
//   // create query
//   const query = defineQuery([MatterSprite, MatterStaticSprite])

//   // create enter query
//   const onQueryEnter = enterQuery(query)
//   const onQueryExit = exitQuery(query)

//   return defineSystem((world) => {
//     // loop through enter query entities
//     const enterEntities = onQueryEnter(world)
//     for (const id of enterEntities) {
//       const sprite = matterSpritesById.get(id)

//       if (!sprite) {
//         continue
//       }

//       const { tank, tower } = sprite

//       tank.setStatic(true)
//       // tower.setStatic(true)
//     }

//     const exitEntities = onQueryExit(world)
//     for (const id of exitEntities) {
//       const sprite = matterSpritesById.get(id)

//       if (!sprite) {
//         continue
//       }

//       const { tank } = sprite

//       tank.setStatic(false)
//     }

//     return world
//   })
// }
