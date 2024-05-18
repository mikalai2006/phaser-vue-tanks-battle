import Phaser from 'phaser'
import { defineSystem, defineQuery, exitQuery } from 'bitecs'

import AI, { StatusAI } from '../components/AI'
import Rotation from '../components/Rotation'
import Input from '../components/Input'
import { Entity } from '../components/Entity'
import Position from '../components/Position'
import { pathEntityById } from './aiManager'
import { GameOptions } from '../options/gameOptions'

export default function createAIMoveToSystem(scene: Phaser.Scene) {
  const query = defineQuery([AI])

  return defineSystem((world) => {
    if (scene.isPauseAI) {
      return
    }

    const entities = query(world)
    const onQueryExit = exitQuery(query)

    const dt = scene.game.loop.delta

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      if (AI.status[id] !== StatusAI.MoveTo) {
        continue
      }

      AI.accumulatedPathTime[id] += dt
      // Input.left[id] = 0
      // Input.right[id] = 0
      // Input.up[id] = 0
      // Input.down[id] = 0

      // check time wait.
      // detect obstacle.
      // if (Input.obstacle[id]) {
      //   AI.status[id] = StatusAI.Idle
      //   pathEntityById.delete(id)
      //   Input.obstacle[id] = 0
      //   AI.accumulatedPathTime[id] = 0
      //   Input.up[id] = 0
      //   Input.down[id] = 0
      //   Input.left[id] = 0
      //   Input.right[id] = 0
      //   // AI.accumulatedTime[id] += dt
      //   // if (AI.accumulatedTime[id] < AI.timeBetweenActions[id]) {
      //   //   continue
      //   // } else {
      //   //   Input.obstacle[id] = 0
      //   //   AI.timeBetweenActions[id] = Phaser.Math.Between(
      //   //     GameOptions.ai.timeActions.min,
      //   //     GameOptions.ai.timeActions.max
      //   //   )
      //   //   AI.accumulatedTime[id] = 0
      //   continue
      // }

      //   continue
      // }
      // if (Entity.targetGridX[id] != -1 && Entity.targetGridY[id] != -1) {
      //   pathEntityById.delete(id)

      //   // console.log(entityPath?.length)
      // }
      // if (Input.obstacle[id]) {
      //   // AI.accumulatedPathTime[id] = AI.timeBetweenActions[id]
      //   Input.left[id] = 0
      //   Input.right[id] = 0
      //   Input.up[id] = 0
      //   Input.down[id] = 0
      //   Input.obstacle[id] = 0
      //   pathEntityById.delete(id)
      //   Input.obstacle[id] == 1
      //   AI.status[id] = StatusAI.MoveRandom
      //   continue
      // }

      const entityPath = pathEntityById.get(id)

      Input.up[id] = 0
      Input.down[id] = 0
      Input.left[id] = 0
      Input.right[id] = 0

      if (!entityPath?.length) {
        AI.status[id] = StatusAI.Idle
        continue
      }

      if (entityPath.length > 0) {
        const [x, y] = entityPath[0]
        const toTile = scene.groundTilesLayer.getTileAt(x, y)

        // console.log(toTile)
        // const diffX = Entity.gridX[id] - x
        // const diffY = Entity.gridY[id] - y

        const angleToPointer = Phaser.Math.RadToDeg(
          Phaser.Math.Angle.Between(
            Position.x[id],
            Position.y[id],
            toTile.getCenterX(),
            toTile.getCenterY()
          )
        )
        let ang = Rotation.angle[id]
        // if (ang < -180) {
        //   ang = 180 + (Rotation.angle[id] + 180)
        // }
        // if (id === 1) console.log(ang, angleToPointer, Rotation.angle[id])
        const angleDelta = Phaser.Math.Angle.ShortestBetween(ang, angleToPointer)

        // if (!Phaser.Math.Fuzzy.Equal(angleToPointer, Rotation.angle[id] - 90, 1)) {
        //   Rotation.angle[id] = Rotation.angle[id] + Math.sign(angleDelta) * 0.5
        // } else {
        //   console.log('Boom!!!')
        // }

        // console.log(
        //   Math.sign(angleDelta),
        //   angleToPointer,
        //   Rotation.angle[id] - 90,
        //   Phaser.Math.Fuzzy.Equal(angleToPointer, Rotation.angle[id] - 90, 1.0)
        // )
        // console.log(Input.up[id], Math.sign(angleDelta))

        // const a = angleToPointer > ang ? angleToPointer : ang
        // const b = angleToPointer < ang ? angleToPointer : ang
        // id == 1 &&
        //   console.log(
        //     angleToPointer,
        //     ang,
        //     b,
        //     a,
        //     Phaser.Math.Fuzzy.GreaterThan(b, a, 15),
        //     Math.sign(angleDelta),
        //     angleDelta
        //   )

        if (Math.abs(angleDelta) > 15) {
          Input.up[id] = 0
          switch (Math.sign(angleDelta)) {
            case 1: {
              Input.right[id] = 1
              break
            }
            case -1: {
              Input.left[id] = 1
              break
            }
            default: {
              // Input.left[id] = 0
              // Input.right[id] = 0
              break
            }
          }
        }
        if (Math.abs(angleDelta) < 40) {
          // if (Phaser.Math.Fuzzy.Equal(angleToPointer, ang, 40)) {
          // Input.left[id] = 0
          // Input.right[id] = 0
          const currentTile = scene.map.findTile((t) =>
            t.containsPoint(Position.x[id], Position.y[id])
          )
          if (currentTile.x == x && currentTile.y == y) {
            Entity.gridX[id] = currentTile.x
            Entity.gridY[id] = currentTile.y

            //Input.up[id] = 0
            if (scene.matter.world.drawDebug) {
              scene.groundTilesLayer.setTint(0xffffff, currentTile.x, currentTile.y, 1, 1)
            }
            AI.accumulatedPathTime[id] = 0

            entityPath.shift()
          } else {
            Input.up[id] = 1
          }
        }
      }
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      const path = pathEntityById.get(id)

      if (path) {
        if (scene.matter.world.drawDebug) {
          for (const point of path) {
            const [x, y] = point
            scene.groundTilesLayer.setTint(0xffffff, x, y, 1, 1)
          }
        }

        pathEntityById.delete(id)
      }
      // console.log('exit path: ', id)
    }

    return world
  })
}
