import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addEntity, addComponent, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { Light } from '../components/Light'

export const lightById = new Map<number, Phaser.GameObjects.Light>()

export function createLightSystem(scene: Phaser.Scene) {
  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const entities = onQueryEnter(world)
    const exitEntities = onQueryExit(world)

    for (const id of entities) {
      // const areaId = addEntity(world)

      addComponent(world, Light, id)
      // Light.idTank[id] = id

      // addComponent(world, Position, areaId)
      // Position.x[areaId] = Position.x[id]
      // Position.y[areaId] = Position.y[id]

      const light = scene.lights.addLight(0, 0, Tank.distanceView[id] + 200, 0xffffff, 1)
      lightById.set(id, light)
    }

    for (const id of exitEntities) {
      const light = lightById.get(id)
      if (!light) {
        continue
      }
      scene.lights.removeLight(light)
      lightById.delete(id)
      // console.log('Remove light')
    }
    return world
  })
}

export function createLightSyncSystem() {
  const query = defineQuery([Light])

  return defineSystem((world) => {
    const entities = query(world)

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]

      lightById.get(id).x = Position.x[id]
      lightById.get(id).y = Position.y[id]
    }

    return world
  })
}
