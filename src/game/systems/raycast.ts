import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import Velocity from '../components/Velocity'
import Rotation from '../components/Rotation'
import Input from '../components/Input'
import Position from '../components/Position'
import { Entity } from '../components/Entity'
import { Tank } from '../components/Tank'

export default function createRaycastSystem(scene: Phaser.Scene) {
  const debugGraphics = scene.add
    .graphics({
      lineStyle: {
        color: 0xffffff,
        width: 2
      },
      fillStyle: {
        color: 0xffff00
      }
    })
    .setDepth(99999)

  scene.minimap?.ignore(debugGraphics)

  const query = defineQuery([Velocity, Rotation, Input])

  return defineSystem((world) => {
    const entities = query(world)
    const entities2 = query(world)

    if (scene.isPauseAI) {
      return
    }

    if (debugGraphics) {
      debugGraphics.clear()
    }

    for (let p = 0; p < entities2.length; ++p) {
      const idPlayer = entities2[p]

      let target = null
      let minDistance = 100000000
      let nearId = -1
      const anotherTeams = entities.filter(
        (x) => Entity.teamIndex[x] !== Entity.teamIndex[idPlayer]
      )
      for (let i = 0; i < anotherTeams.length; ++i) {
        const id = anotherTeams[i]
        if (Entity.teamIndex[id] === Entity.teamIndex[idPlayer]) {
          continue
        }

        // calc coordinates.
        // const bodies = Array.from(tanksById, ([name, value]) => value.body).filter((x) => !!x)
        // if (!bodies.length) {
        //   continue
        // }
        // console.log(bodies)

        const distance = Phaser.Math.Distance.Between(
          Position.x[id],
          Position.y[id],
          Position.x[idPlayer],
          Position.y[idPlayer]
        )

        let far = true
        if (distance <= Tank.distanceView[idPlayer]) {
          // distance <= Tank.distanceView[id] ||
          // console.log('brak', distance, Tank.distanceView[id], Tank.distanceView[idPlayer])
          far = false
        }

        // idPlayer === scene.idPlayer &&
        //   console.log('far ', far, distance, Tank.distanceView[idPlayer])
        Entity.target[idPlayer] = -1
        if (far) {
          continue
        }

        // console.log('ray', distance, Tank.distanceView[id], Tank.distanceView[idPlayer])

        const collisions = scene.matter.query.ray(
          scene.matter.world.getAllBodies(),
          // bodies,
          scene.matter.vector.create(Position.x[id], Position.y[id]),
          scene.matter.vector.create(Position.x[idPlayer], Position.y[idPlayer])
        )

        const allowCollisions = collisions.filter(
          (x) =>
            ['tank'].includes(x.bodyA.gameObject?.key) || ['tank'].includes(x.bodyB.gameObject?.key)
        )
        const obstaclesCollisions = collisions.filter(
          (x) =>
            (!['caterpillar', 'muzzle', 'tower', 'tank', 'weapon', 'weaponMap', 'bonus'].includes(
              x.bodyA.gameObject?.key
            ) ||
              !['caterpillar', 'muzzle', 'tower', 'tank', 'weapon', 'weaponMap', 'bonus'].includes(
                x.bodyB.gameObject?.key
              )) &&
            x.bodyA.key != 'detector' &&
            x.bodyB.key != 'detector'
        )
        // console.log(
        //   collisions.filter(
        //     (x) =>
        //       !['caterpillar', 'muzzle', 'tower', 'tank'].includes(x.bodyA.gameObject?.key) ||
        //       !['caterpillar', 'muzzle', 'tower', 'tank'].includes(x.bodyB.gameObject?.key)
        //   )
        // )
        // console.log(collisions.map((x) => [x.bodyA.gameObject, x.bodyB.gameObject]))
        // idPlayer === scene.idPlayer &&
        //   console.log(obstaclesCollisions, Entity.teamIndex[id], Entity.teamIndex[idPlayer])

        if (
          // collisions.length >= 3 &&
          obstaclesCollisions.length == 0 &&
          distance < minDistance &&
          distance < Tank.distanceView[idPlayer] &&
          id != idPlayer &&
          Entity.teamIndex[id] != Entity.teamIndex[idPlayer]
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
      // for (let i = 0; i < anotherTeams.length; ++i) {
      //   const id = anotherTeams[i]
      //   Entity.target[id] = -1
      // }

      if (target) {
        if (nearId > -1 && nearId != idPlayer) {
          // Entity.target[nearId] = idPlayer
          Entity.target[idPlayer] = nearId
        }
        // debugGraphics.beginPath()
        // debugGraphics.moveTo(target.bodyA.position.x, target.bodyA.position.y)

        // const colorTeam =
        //   Entity.teamIndex[idPlayer] >= GameOptions.configTeams.length
        //     ? GameOptions.configTeams[1].colorAttackZone
        //     : GameOptions.configTeams[Entity.teamIndex[idPlayer]].colorAttackZone
        // debugGraphics.lineStyle(2, colorTeam, 0.5)
        // debugGraphics.lineTo(Position.x[idPlayer], Position.y[idPlayer])
        // // if (collisions.length > 6) {
        // //   debugGraphics.lineStyle(1, 0xd946ef, 1)
        // // } else {
        // //   debugGraphics.lineStyle(1, 0xffffff, 1)
        // // }
        // debugGraphics.closePath()
        // debugGraphics.strokePath()
      }
    }

    return world
  })
}
