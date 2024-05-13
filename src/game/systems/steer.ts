import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'
import { Rotation } from '../components/Rotation'
import { Velocity } from '../components/Velocity'
import { Input } from '../components/Input'
import RotationTower from '../components/RotationTower'
import { tanksById, caterpillarsById } from './matter'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'
import { Player } from '../components/Player'
import { Tank } from '../components/Tank'

export function createSteeringSystem(scene) {
  const query = defineQuery([Input, Rotation, Velocity])
  const queryPlayer = defineQuery([Player])
  return defineSystem((world, dt) => {
    const entities = query(world)
    const players = queryPlayer(world)

    for (const id of entities) {
      // know if moving
      const isUp = !!Input.up[id]
      const isDown = !!Input.down[id]
      const isMoving = isUp || isDown

      const isLeft = !!Input.left[id]
      const isRight = !!Input.right[id]
      // if (!isMoving && !isLeft && !isRight) {
      //   continue
      // }

      const caterpillars = caterpillarsById.get(id)

      if (isUp) {
        caterpillars.left.play('up', true)
        caterpillars.right.play('up', true)
      } else if (isDown) {
        caterpillars.left.play('down', true)
        caterpillars.right.play('down', true)
      } else if (isRight) {
        caterpillars.left.play('up', true)
        caterpillars.right.play('down', true)
      } else if (isLeft) {
        caterpillars.left.play('down', true)
        caterpillars.right.play('up', true)
      } else {
        caterpillars.left.stop()
        caterpillars.right.stop()
      }

      RotationTower.force[id] = 0
      RotationTower.angleMuzzle[id] = 0

      if (Entity.target[id] > -1) {
        const targetObject = tanksById.get(Entity.target[id])
        if (targetObject) {
          const currentObject = tanksById.get(id)
          const angleToPointer = Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(
              currentObject.x,
              currentObject.y,
              targetObject.x,
              targetObject.y
            )
          )
          // if (players.includes(id)) {
          //   console.log(angleToPointer, Rotation.angle[id])
          // }

          const angleDelta = Phaser.Math.Angle.ShortestBetween(
            RotationTower.angle[id],
            angleToPointer
          )
          // if (!Phaser.Math.Fuzzy.Equal(angleToPointer, RotationTower.angle[id], 1)) {
          const maxAccuracity =
            GameOptions.maxAccuracityTower -
            Tank.accuracy[id] * GameOptions.maxAccuracityTower * 0.01

          // if (players.includes(id)) {
          //   console.log(
          //     Tank.accuracy[id],
          //     angleDelta,
          //     maxAccuracity,
          //     Phaser.Math.FloatBetween(0.1 * maxAccuracity, maxAccuracity)
          //   )
          // }
          if (Math.round(Math.abs(angleDelta)) > maxAccuracity) {
            const speedRotateTower = Tank.speedRotateTower[id]
            const deltaRotateTower = (((speedRotateTower * dt) / 1000) * Math.PI) / 180

            if (Math.abs(angleDelta) < 20) {
              RotationTower.angleMuzzle[id] =
                RotationTower.angle[id] + Math.sign(angleDelta) * deltaRotateTower * 10 // Math.sign(angleDelta) * 0.5
              // if (players.includes(id)) {
              //   console.log('delta=', Math.sign(angleDelta) * deltaRotateTower * 10)
              // }
            } else {
              // RotationTower.angleMuzzle[id] = 0
              //  && Math.abs(angleDelta) > 2
              // Phaser.Math.FloatBetween(0.1 * maxAccuracity, maxAccuracity)

              // RotationTower.angle[id] = RotationTower.angle[id] + Math.sign(angleDelta) * 0.5
              // console.log(angleDelta, Math.sign(angleDelta) * deltaRotateTower)

              // if (
              //   Math.abs(Number(RotationTower.force[id].toFixed(3))) !=
              //   Math.abs(Number(deltaRotateTower.toFixed(3)))
              // ) {
              // if (players.includes(id)) {
              //   console.log(RotationTower.force[id], Math.sign(angleDelta) * deltaRotateTower)
              // }
              RotationTower.force[id] = Math.sign(angleDelta) * deltaRotateTower
              // if (players.includes(id)) {
              //   console.log(
              //     Math.sign(angleDelta) * deltaRotateTower,
              //     Number(Math.sign(angleDelta) * deltaRotateTower).toFixed(2)
              //   )
              // }
              // }
            }
          } else if (!Input.fire[id] && Tank.timeBeforeShoot[id] > 0) {
            // console.log('Boom!!!')
            // const isFire = Phaser.Math.Between(0, 100)
            if (!players.includes(id) || scene.gameData.settings.autoShot) {
              Input.fire[id] = 1 //isFire > 50 ? 1 : 0
            }
          }
        }
      } else if (scene.gameData.settings.towerForward && players.includes(id)) {
        const angleDelta = Phaser.Math.Angle.ShortestBetween(
          RotationTower.angle[id],
          Rotation.angle[id]
        )
        if (Math.round(Math.abs(angleDelta)) > 0) {
          const speedRotateTower = Tank.speedRotateTower[id]
          const deltaRotateTower = (((speedRotateTower * dt) / 1000) * Math.PI) / 180
          RotationTower.angleMuzzle[id] =
            RotationTower.angle[id] + Math.sign(angleDelta) * deltaRotateTower * 10
        }
      }

      Rotation.force[id] = 0
      const speed = Tank.speed[id]
      const deltaSpeed = (speed * dt) / 1000
      const speedRotate = Tank.speedRotate[id]
      const deltaRotate = (((speedRotate * dt) / 1000) * Math.PI) / 180
      // if (id == scene.idPlayer) console.log(deltaSpeed, deltaRotate)
      // if moving...
      if (isMoving) {
        const moveDir = isUp ? 1 : -1

        let angle = Rotation.angle[id]
        let force = 0
        if (isLeft) {
          force = -deltaRotate * moveDir
        } else if (isRight) {
          force = deltaRotate * moveDir
        }
        Rotation.force[id] = force

        // if (isLeft) {
        //   angle -= deltaRotate * moveDir
        // } else if (isRight) {
        //   angle += deltaRotate * moveDir
        // }

        // Rotation.angle[id] = angle //> 180 ? -180 + (angle - 180) : angle <= -180 ? 180 + (angle + 180) : angle

        const rotation = Phaser.Math.DegToRad(angle)
        const vec = new Phaser.Math.Vector2()
        vec.setToPolar(rotation, 1)

        // const bb = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(-70), 1)
        // const aa = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(70), 1)

        // console.log(Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), aa, bb, Math.sign(-180))
        // id == 1 && console.log(angle, vec)

        Velocity.x[id] = vec.x * deltaSpeed * moveDir // * Math.sign(angle)
        Velocity.y[id] = vec.y * deltaSpeed * moveDir // * Math.sign(angle)
      } else {
        let force = 0
        if (isLeft) {
          force = -deltaRotate
        } else if (isRight) {
          force = deltaRotate
        }
        Rotation.force[id] = force
        // let angle = Rotation.angle[id]

        // if (isLeft) {
        //   angle -= deltaRotate
        // } else if (isRight) {
        //   angle += deltaRotate
        // }

        // Rotation.angle[id] =
        //   angle > 180 ? -180 + (angle - 180) : angle < -180 ? 180 + (angle + 180) : angle

        Velocity.x[id] = 0
        Velocity.y[id] = 0
      }
    }

    return world
  })
}
