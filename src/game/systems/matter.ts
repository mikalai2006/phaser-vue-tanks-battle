import Phaser from 'phaser'

import { defineSystem, defineQuery, enterQuery, exitQuery, removeComponent } from 'bitecs'

import { Position } from '../components/Position'
import { Rotation } from '../components/Rotation'
import { Velocity } from '../components/Velocity'
import RotationTower from '../components/RotationTower'
import { TankObject } from '../objects/TankObject'
import {
  GameOptions,
  mapObjectCategory,
  tankCategory,
  tankAmunition,
  weaponCategory,
  bonusCategory,
  caterpillarCategory
} from '../options/gameOptions'
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
import { entityBarById } from './entityBar'
import { KeyParticles, KeySound, TypeRound } from '../types'

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

// export const destroyMap = () => {
//   tanksById.forEach((value, key) => {
//     tanksById.delete(key)
//   })
//   towersById.forEach((value, key) => {
//     towersById.delete(key)
//   })
//   muzzlesById.forEach((value, key) => {
//     muzzlesById.delete(key)
//   })
//   caterpillarsById.forEach((value, key) => {
//     caterpillarsById.delete(key)
//   })
//   console.log('destroyMap: ', tanksById.size, towersById.size, muzzlesById.size)
// }

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

      const configComplexTank = GameOptions.complexTanks[Tank.index[id]]
      const configTank = GameOptions.tanks.items[configComplexTank.tank]

      const tank = new TankObject(id, scene.matter.world, x, y, configComplexTank.tank, {
        friction: 0,
        frictionAir: 0.2,
        density: 100,
        collisionFilter: {
          category: tankCategory,
          mask: mapObjectCategory | weaponCategory | bonusCategory | tankCategory
        }
      })
      // tank.detectorCollision.onCollideCallback = (d) => {
      //   // console.log('collise', d)
      //   Input.obstacle[id] = 1
      // }
      // console.log('tanksById size=', tanksById.size)

      tanksById.set(id, tank)
      if (id === scene.idFollower) {
        scene.setFollower(id)
      }

      const weaponConfig = GameOptions.weaponObjects.find(
        (x) => x.type == Tank.activeWeaponType[id]
      )
      const muzzle = new MuzzleObject(
        id,
        world,
        scene.matter.world,
        x,
        y,
        configComplexTank.muzzle,
        {
          friction: 0,
          frictionAir: 0.2,
          density: 100,
          collisionFilter: {
            category: tankAmunition,
            mask: mapObjectCategory | weaponCategory | bonusCategory
          }
        },
        weaponConfig
      )
      muzzlesById.set(id, muzzle)

      const tower = new TowerObject(id, scene.matter.world, x, y, configComplexTank.tower, {
        friction: 0,
        frictionAir: 0.2,
        density: 10
        // collisionFilter: {
        //   mask: mapObjectCategory | tankAmunition
        // }
      })
      towersById.set(id, tower)

      const caterpillarLeft = new Caterpillar(id, scene.matter.world, x, y - 50, 0, {
        friction: 0,
        frictionAir: 0.2,
        density: 10,
        collisionFilter: {
          category: caterpillarCategory,
          mask: 0
        }
      })
      const caterpillarRight = new Caterpillar(id, scene.matter.world, x, y + 50, 0, {
        friction: 0,
        frictionAir: 0.2,
        density: 10,
        collisionFilter: {
          category: caterpillarCategory,
          mask: 0
        }
      })
      caterpillarsById.set(id, {
        left: caterpillarLeft,
        right: caterpillarRight
      })

      scene.minimap?.ignore([tank, caterpillarLeft, caterpillarRight, muzzle])

      caterpillarLeft.setTint(GameOptions.colors.caterpillar)
      caterpillarRight.setTint(GameOptions.colors.caterpillar)

      const colorTank =
        scene.configRound.config.type == TypeRound.teams
          ? GameOptions.configTeams[Entity.teamIndex[id]].color
          : Phaser.Display.Color.ValueToColor(configComplexTank.color).color
      tank.setTint(colorTank) //0xf0e68c
      tower.setTint(colorTank) //0x5a7733)
      muzzle.setTint(GameOptions.colors.caterpillar)

      scene.matter.add.constraint(tank.body, caterpillarLeft.body, 0, 0, {
        pointA: { x: 0, y: -configTank.catYOffset }
      })
      scene.matter.add.constraint(tank.body, caterpillarRight.body, 0, 0, {
        pointA: { x: 0, y: configTank.catYOffset }
      })
      scene.matter.add.constraint(tank.body, tower.body, 0, 0)

      scene.matter.body.setCentre(
        muzzle.body,
        GameOptions.muzzles.items[configComplexTank.muzzle].center,
        true
      )
      scene.matter.add.constraint(tank.body, muzzle.body, 0, 0, {
        pointA: JSON.parse(
          JSON.stringify(GameOptions.muzzles.items[configComplexTank.muzzle].centerConstraint)
        ),
        pointB: JSON.parse(
          JSON.stringify(GameOptions.muzzles.items[configComplexTank.muzzle].centerConstraint)
        )
      })
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      const tank = tanksById.get(id)
      const tower = towersById.get(id)
      const muzzle = muzzlesById.get(id)
      const caterpillars = caterpillarsById.get(id)
      // for (let i = 0; i < 10; i++) {
      //   const vec = new Phaser.Math.Vector2(tank.x, tank.y)
      //   const azimut = Phaser.Math.FloatBetween(-Math.PI, Math.PI)
      //   vec.setToPolar(azimut, 100)
      //   const x2 = tank.x + vec.x
      //   const y2 = tank.y + vec.y

      //   const xVals = [tank.x, x2]
      //   const yVals = [tank.y, y2]
      //   scene.createEntityWithEffect(xVals, yVals, () => {})
      // }
      if (scene.cameras.main.cull([tank]).length && scene.isMute) {
        // scene.sys.game.device.os.desktop &&
        scene.emitterDestroyTank.explode(16, tank.x, tank.y)

        !scene.isRoundEnd && scene.sound.play(KeySound.DestroyTank, { volume: 0.4 })
      }

      tank.removeTank()
      tower.removeTower()
      muzzle.removeObject()
      caterpillars.left.removeCatterpillar()
      caterpillars.right.removeCatterpillar()

      tanksById.delete(id)
      towersById.delete(id)
      caterpillarsById.delete(id)
      muzzlesById.delete(id)

      // console.log('remove tank and tower: ', id, tanksById.size)
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

export function createMatterPhysicsSyncSystem(scene: Phaser.Scene) {
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

      const vec = new Phaser.Math.Vector2(muzzle.x, muzzle.y)
      vec.setToPolar(muzzle.rotation, 20)
      const x2 = muzzle.x + vec.x
      const y2 = muzzle.y + vec.y
      muzzle.indicatorWeapon.setPosition(x2, y2)
      muzzle.indicatorWeapon.setAngle(muzzle.angle)

      // muzzle.angle = RotationTower.angle[id]
      // if (tower.angle != RotationTower.angle[id]) {
      //   // Phaser.Physics.Matter.Rotate(tower.body, RotationTower.angle[id])
      //   tower.setAngle(RotationTower.angle[id])
      //   // scene.matter.setAngularVelocity([tower.body], 0.01)
      //   // tower.angle = RotationTower.angle[id]
      // }

      // set the velocity
      tank.setVelocity(Velocity.x[id], Velocity.y[id])
      tank.areol.setPosition(tank.x, tank.y)
      tank.arrow.setPosition(tank.x, tank.y)
      tank.arrow.setAngle(tank.angle)

      // const object = entityBarById.get(id)
      // object.bar.x = tank.x
      // object.bar.y = tank.y

      // set angle for tower.
      tower.setAngle(muzzle.angle)
      tower.gerbImage.setPosition(tower.x, tower.y)
      tower.gerbImage.setAngle(muzzle.angle)

      const isMove = !!Input.down[id] || !!Input.left[id] || !!Input.right[id] || !!Input.up[id]
      if (isMove) {
        tank.startMove()
        caterpillar.left.toggleEmitter(true, !!Input.up[id])
        caterpillar.right.toggleEmitter(true, !!Input.up[id])
      } else {
        tank.stopMove()
        caterpillar.left.toggleEmitter(false, !!Input.up[id])
        caterpillar.right.toggleEmitter(false, !!Input.up[id])
      }
    }

    return world
  })
}
