import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import AI, { StatusAI } from '../components/AI'
import Velocity from '../components/Velocity'
import Rotation from '../components/Rotation'
import Input from '../components/Input'
import { GameOptions } from '../options/gameOptions'

export default function createAIMoveRandomSystem(scene: Phaser.Scene) {
  const cpuQuery = defineQuery([AI, Velocity, Rotation, Input])

  return defineSystem((world) => {
    if (scene.isPauseAI) {
      return
    }

    const entities = cpuQuery(world)

    const dt = scene.game.loop.delta

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      if (AI.status[id] !== StatusAI.MoveRandom) {
        continue
      }

      AI.accumulatedTime[id] += dt

      if (!!Input.obstacle[id]) {
        AI.accumulatedTime[id] += AI.timeBetweenActions[id]
        Input.obstacle[id] = 0

        // Input.left[id] = 0
        // Input.right[id] = 0
        // Input.up[id] = 0
        // Input.down[id] = 0
        // Input.obstacle[id] = 0
      }
      // // check collisions.
      // const vec = new Phaser.Math.Vector2(Position.x[id], Position.y[id])
      // vec.setToPolar(Phaser.Math.DegToRad(Rotation.angle[id]), 0.00001)

      // const collisions = scene.matter.query.ray(
      //   scene.matter.world.getAllBodies(),
      //   scene.matter.vector.create(Position.x[id], Position.y[id]),
      //   scene.matter.vector.create(vec.x, vec.y)
      // )
      // const obstaclesCollisions = collisions.filter(
      //   (x) =>
      //     (!['caterpillar', 'muzzle', 'tower', 'tank'].includes(x.bodyA.gameObject?.key) ||
      //       !['caterpillar', 'muzzle', 'tower', 'tank'].includes(x.bodyB.gameObject?.key)) &&
      //     x.bodyA.gameObject &&
      //     x.bodyB.gameObject
      // )
      // console.log(obstaclesCollisions)
      // if (obstaclesCollisions.length > 2) {
      //   AI.accumulatedTime[id] += AI.timeBetweenActions[id]
      // }

      if (AI.accumulatedTime[id] < AI.timeBetweenActions[id]) {
        continue
      }

      Input.left[id] = 0
      Input.right[id] = 0
      Input.up[id] = 0
      Input.down[id] = 0

      AI.timeBetweenActions[id] = Phaser.Math.Between(
        GameOptions.ai.timeActions.min,
        GameOptions.ai.timeActions.max
      )
      AI.accumulatedTime[id] = 0
      Input.countRandom[id] += 1

      switch (Phaser.Math.Between(0, 15)) {
        // left
        case 0: {
          Input.left[id] = 1 //.direction[id] = Direction.Left
          break
        }

        // right
        case 1: {
          Input.right[id] = 1 //.direction[id] = Direction.Right
          break
        }

        // up
        case 2: {
          Input.up[id] = 1 //direction[id] = Direction.Up
          break
        }

        // down
        case 3: {
          Input.down[id] = 1 //.direction[id] = Direction.Down
          break
        }
        // down left
        case 4: {
          Input.down[id] = 1 //.direction[id] = Direction.Down
          Input.left[id] = 1
          break
        }
        // down right
        case 5: {
          Input.down[id] = 1 //.direction[id] = Direction.Down
          Input.right[id] = 1
          break
        }
        // up right
        case 6: {
          Input.up[id] = 1 //.direction[id] = Direction.Down
          Input.right[id] = 1
          break
        }
        // up left
        case 7: {
          Input.up[id] = 1 //.direction[id] = Direction.Down
          Input.left[id] = 1
          break
        }

        default: {
          // Input.direction[id] = Direction.None
          Input.left[id] = 0
          Input.right[id] = 0
          Input.up[id] = 0
          Input.down[id] = 0
          break
        }
      }
    }

    return world
  })
}
