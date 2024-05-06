import Phaser from 'phaser'

import { defineSystem, defineQuery, enterQuery, exitQuery, removeEntity } from 'bitecs'

import { Position } from '../components/Position'
import { Rotation } from '../components/Rotation'
import { Velocity } from '../components/Velocity'
import RotationTower from '../components/RotationTower'
import { TankObject } from '../objects/TankObject'
import { GameOptions, allCollision, defaultCategory, twoCategory } from '../options/gameOptions'
import { Entity } from '../components/Entity'
import { TowerObject } from '../objects/TowerObject'
import { Caterpillar } from '../objects/Caterpillar'
import { EntityBar } from '../components/EntityBar'
import { WeaponObject } from '../objects/WeaponObject'
import Input from '../components/Input'
import { MuzzleObject } from '../objects/MuzzleObject'
import { Tank } from '../components/Tank'
import { Player } from '../components/Player'
import { Weapon } from '../components/Weapon'

export const tanksById = new Map<number, TankObject>()
export const towersById = new Map<number, TowerObject>()
export const muzzlesById = new Map<number, MuzzleObject>()
export const caterpillarsById = new Map<
  number,
  {
    left: Caterpillar
    right: Caterpillar
  }
>()

export function createMatterSpriteSystem(scene: Phaser.Scene) {
  const query = defineQuery([Position, Tank])

  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)

  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)
    for (let i = 0; i < enterEntities.length; ++i) {
      const id = enterEntities[i]

      // const optionsTank = GameOptions.tanks.items[Tank.level[id]]
      // Tank.health[id] = optionsTank.game.health

      // Tank.speed[id] = optionsTank.game.speed
      // Tank.speedRotate[id] = optionsTank.game.speedRotate

      // const optionsTower = GameOptions.towers.items[Tank.levelTower[id]]
      // Tank.speedRotateTower[id] = optionsTower.game.speedRotateTower
      // Tank.accuracy[id] = optionsTower.game.accuracy

      const x = Position.x[id]
      const y = Position.y[id]

      const tank = new TankObject(id, scene.matter.world, x, y, Tank.level[id], {
        friction: 0,
        frictionAir: 0.2,
        density: 100,
        collisionFilter: {
          category: twoCategory
        }
      })
      // tank.detectorCollision.onCollideCallback = (d) => {
      //   // console.log('collise', d)
      //   Input.obstacle[id] = 1
      // }

      tanksById.set(id, tank)
      if (id === scene.idFollower) {
        scene.setFollower(id)
      }

      const muzzle = new MuzzleObject(id, world, scene.matter.world, x, y, Tank.levelMuzzle[id], {
        friction: 0,
        frictionAir: 0.2,
        density: 100,
        collisionFilter: {
          mask: defaultCategory & allCollision
        }
      })
      muzzlesById.set(id, muzzle)

      const tower = new TowerObject(id, scene.matter.world, x, y, Tank.levelTower[id], {
        friction: 0,
        frictionAir: 0.2,
        density: 10,
        collisionFilter: {
          mask: defaultCategory & allCollision
        }
      })
      towersById.set(id, tower)

      const caterpillarLeft = new Caterpillar(id, scene.matter.world, x, y - 50, 0, {
        friction: 0,
        frictionAir: 0.2,
        density: 10,
        collisionFilter: {
          category: twoCategory,
          mask: defaultCategory & allCollision
        }
      })
      const caterpillarRight = new Caterpillar(id, scene.matter.world, x, y + 50, 0, {
        friction: 0,
        frictionAir: 0.2,
        density: 10,
        collisionFilter: {
          category: twoCategory,
          mask: defaultCategory & allCollision
        }
      })
      caterpillarsById.set(id, {
        left: caterpillarLeft,
        right: caterpillarRight
      })

      scene.minimap?.ignore([tank, caterpillarLeft, caterpillarRight, muzzle])

      caterpillarLeft.setTint(GameOptions.colors.caterpillar)
      caterpillarRight.setTint(GameOptions.colors.caterpillar)
      tank.setTint(0xf0e68c) //0xf0e68c
      tower.setTint(0xf0e68c) //0x5a7733)
      muzzle.setTint(0x111111)

      scene.matter.add.constraint(tank.body, caterpillarLeft.body, 0, 0, {
        pointA: { x: 0, y: -GameOptions.tanks.items[Tank.level[id]].catYOffset }
      })
      scene.matter.add.constraint(tank.body, caterpillarRight.body, 0, 0, {
        pointA: { x: 0, y: GameOptions.tanks.items[Tank.level[id]].catYOffset }
      })
      scene.matter.add.constraint(tank.body, tower.body, 0, 0)

      scene.matter.body.setCentre(
        muzzle.body,
        GameOptions.muzzles.items[Tank.levelMuzzle[id]].center,
        true
      )
      scene.matter.add.constraint(tank.body, muzzle.body, 0, 0, {
        pointA: JSON.parse(
          JSON.stringify(GameOptions.muzzles.items[Tank.levelMuzzle[id]].centerConstraint)
        ),
        pointB: JSON.parse(
          JSON.stringify(GameOptions.muzzles.items[Tank.levelMuzzle[id]].centerConstraint)
        )
      })
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      // console.log('remove tank and tower: ', id)
      const tank = tanksById.get(id)
      const tower = towersById.get(id)
      const muzzle = muzzlesById.get(id)
      const caterpillars = caterpillarsById.get(id)
      tank.removeTank()
      tower.removeTower()
      muzzle.removeMuzzle()
      caterpillars.left.removeCatterpillar()
      caterpillars.right.removeCatterpillar()

      tanksById.delete(id)
      towersById.delete(id)
      caterpillarsById.delete(id)
      muzzlesById.delete(id)
      scene.onCheckWinTeam()
    }

    // const entities = query(world)
    // for (let i = 0; i < entities.length; ++i) {
    //   const id = entities[i]
    //   console.log(`${Position.x[id]}, ${Position.y[id]}`)
    // }

    return world
  })
}

export function createMatterPhysicsSyncSystem() {
  // create query
  const query = defineQuery([Position, Tank])

  return defineSystem((world) => {
    // sync simulated values back into components
    const entities = query(world)
    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      const tank = tanksById.get(id)
      const muzzle = muzzlesById.get(id)

      if (!tank) {
        continue
      }

      Position.x[id] = tank.x
      Position.y[id] = tank.y

      Rotation.angle[id] = tank.angle
      RotationTower.angle[id] = muzzle.angle
    }

    return world
  })
}

export function createMatterPhysicsSystem(scene) {
  // create query
  const query = defineQuery([Rotation, Velocity, Tank])
  const queryPlayers = defineQuery([Player])

  return defineSystem((world) => {
    const entities = query(world)
    const players = queryPlayers(world)

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      const tank = tanksById.get(id)
      const tower = towersById.get(id)
      const caterpillar = caterpillarsById.get(id)
      const muzzle = muzzlesById.get(id)

      if (!tank || !tower) {
        continue
      }

      // set the rotation
      // id == 0 && console.log('set angle1', id, tank.angle, Rotation.angle[id])
      // if (tank.angle != Rotation.angle[id]) {
      // id == 1 &&
      //   console.log(
      //     'set angle2',
      //     id,
      //     tank.angle,
      //     Rotation.angle[id],
      //     Rotation.force[id],
      //     tank.getAngularSpeed()
      //   )
      if (Rotation.force[id] || tank.getAngularSpeed()) {
        scene.matter.setAngularVelocity([tank.body], Rotation.force[id])
      }
      if (tank.angle !== caterpillar.left.angle) {
        caterpillar.left.setAngle(tank.angle)
        caterpillar.right.setAngle(tank.angle)
      }
      // if (!Phaser.Math.Fuzzy.Equal(tank.angle, Rotation.angle[id])) {
      // // tank.angle = Rotation.angle[id]
      // tank.setAngle(Rotation.angle[id])
      // caterpillar.left.setAngle(Rotation.angle[id])
      // caterpillar.right.setAngle(Rotation.angle[id])
      // // if (tank.angle > 180 || tank.angle < -180) {
      // //   console.log(id, tank.angle)
      // }
      // }
      // if (
      //   Phaser.Math.Fuzzy.Equal(tank.angle, Rotation.angle[id]) &&
      //   Rotation.angle[id] != tank.angle
      // ) {
      //   id == 0 && console.log('corrective', id, tank.angle, Rotation.angle[id])
      //   Rotation.angle[id] = tank.angle
      // }

      // set the rotation tower
      // if (players.includes(id)) {
      //   console.log(RotationTower.angleMuzzle[id], RotationTower.force[id])
      // }
      if (RotationTower.angleMuzzle[id] !== 0) {
        muzzle.setAngle(RotationTower.angleMuzzle[id])
      } else if (RotationTower.force[id]) {
        //  || (RotationTower.force[id] === 0 && tower.getAngularSpeed())
        // id === 0 && console.log(RotationTower.force[id], tower.getAngularVelocity())
        muzzle.setAngularVelocity(RotationTower.force[id])
        // muzzle.applyForceFrom(new Phaser.Math.Vector2({ x: Position.x[id], y: Position.y[id] }), RotationTower.force[id])
      }
      // muzzle.angle = RotationTower.angle[id]
      // if (tower.angle != RotationTower.angle[id]) {
      //   // Phaser.Physics.Matter.Rotate(tower.body, RotationTower.angle[id])
      //   tower.setAngle(RotationTower.angle[id])
      //   // scene.matter.setAngularVelocity([tower.body], 0.01)
      //   // tower.angle = RotationTower.angle[id]
      // }

      // set the velocity
      tank.setVelocity(Velocity.x[id], Velocity.y[id])

      // set angle for tower.
      tower.setAngle(muzzle.angle)

      // if (!!Input.fire[id] && !!EntityBar.weapon[id]) {
      //   Input.fire[id] = 0
      //   const time = Tank.timeBeforeShoot[id]
      //   Tank.timeBeforeShoot[id] = 0

      //   scene.time.delayedCall(
      //     !players.includes(id) ? time : 0,
      //     () => {
      //       Tank.timeBeforeShoot[id] = Phaser.Math.FloatBetween(
      //         GameOptions.towers.items[Tank.levelTower[id]].maxTimeBeforeShoot.min,
      //         GameOptions.towers.items[Tank.levelTower[id]].maxTimeBeforeShoot.max
      //       )

      //       const muzzleConfig = GameOptions.muzzles.items[Tank.levelMuzzle[id]]
      //       muzzleConfig.game.distanceShot = Tank.distanceShot[id]
      //       muzzleConfig.game.speedShot = Tank.speedShot[id]

      //       if (!muzzle.active) {
      //         return
      //       }

      //       // if (Weapon.count[] <= 0) {}

      //       if (!players.includes(id) && Entity.target[id] == -1) {
      //         return
      //       }

      //       tower.fire(GameOptions.maximum.timeRefreshWeapon - Tank.timeRefreshWeapon[id])
      //       const { x, y } = muzzle
      //       muzzle.fire(x, y, muzzle.rotation, muzzleConfig, 1)
      //       if (muzzleConfig.countShot > 1) {
      //         scene.time.delayedCall(
      //           250,
      //           () => {
      //             if (!muzzle?.body?.position) {
      //               return
      //             }
      //             muzzle.fire(muzzle.x, muzzle.y, muzzle.rotation, muzzleConfig, 2)
      //           },
      //           [],
      //           scene
      //         )
      //       }
      //     },
      //     [],
      //     this
      //   )
      // }
    }

    return world
  })
}
