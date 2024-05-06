import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import Velocity from '../components/Velocity'
import Rotation from '../components/Rotation'
import { Player } from '../components/Player'
import Input from '../components/Input'
import Position from '../components/Position'
import { GameOptions } from '../options/gameOptions'
import { Entity } from '../components/Entity'

export default function createDebugSystem(scene: Phaser.Scene) {
  const debugGraphics = scene.add
    .graphics({
      lineStyle: {
        color: 0xffffff
      },
      fillStyle: {
        color: 0xffff00
      }
    })
    .setDepth(99999)

  const query = defineQuery([Velocity, Rotation, Input])
  const queryPlayers = defineQuery([Velocity, Rotation, Input])

  return defineSystem((world) => {
    const entities = query(world)
    const players = queryPlayers(world)

    if (debugGraphics) {
      debugGraphics.clear()
    }

    for (let p = 0; p < players.length; ++p) {
      const idPlayer = players[p]

      let target = null
      let minDistance = 100000000
      let nearId = -1
      for (let i = 0; i < entities.length; ++i) {
        const id = entities[i]
        if (Entity.teamId[id] === Entity.teamId[idPlayer]) {
          continue
        }

        const collisions = scene.matter.query.ray(
          scene.matter.world.getAllBodies(),
          scene.matter.vector.create(Position.x[id], Position.y[id]),
          scene.matter.vector.create(Position.x[idPlayer], Position.y[idPlayer])
        )

        const distance = Phaser.Math.Distance.Between(
          Position.x[id],
          Position.y[id],
          Position.x[idPlayer],
          Position.y[idPlayer]
        )

        const allowCollisions = collisions.filter(
          (x) =>
            ['tank'].includes(x.bodyA.gameObject?.key) || ['tank'].includes(x.bodyB.gameObject?.key)
        )

        if (
          // collisions.length >= 3 &&
          distance < minDistance &&
          distance < GameOptions.minDistanceFollowPlayer &&
          id != idPlayer &&
          Entity.teamId[id] != Entity.teamId[idPlayer]
        ) {
          minDistance = distance
          target = allowCollisions[1]
          nearId = id
        }
        // console.log(Entity.target[0])

        // for (var x = 0; x < collisions.length; x++) {
        //   var collision = collisions[x]

        //   debugGraphics.fillRect(
        //     collision.bodyA.position.x - 4.5,
        //     collision.bodyA.position.y - 4.5,
        //     8,
        //     8
        //   )
        // }
        // debugGraphics.fill()
      }

      Entity.target[idPlayer] = -1
      for (let i = 0; i < entities.length; ++i) {
        const id = entities[i]
        Entity.target[id] = -1
      }

      if (target) {
        if (nearId > -1 && nearId != idPlayer) {
          Entity.target[nearId] = idPlayer
          Entity.target[idPlayer] = nearId
        }
        debugGraphics.beginPath()
        debugGraphics.moveTo(target.bodyA.position.x, target.bodyA.position.y)
        debugGraphics.lineTo(Position.x[idPlayer], Position.y[idPlayer])
        // if (collisions.length > 6) {
        //   debugGraphics.lineStyle(1, 0xd946ef, 1)
        // } else {
        //   debugGraphics.lineStyle(1, 0xffffff, 1)
        // }
        debugGraphics.closePath()
        debugGraphics.strokePath()
      }
    }

    return world
  })
}
