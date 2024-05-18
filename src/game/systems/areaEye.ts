import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addEntity, addComponent, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { AreaEye } from '../components/AreaEye'
import { GameOptions } from '../options/gameOptions'
import { muzzlesById } from './matter'
import { Entity } from '../components/Entity'
import RotationTower from '../components/RotationTower'
import { Player } from '../components/Player'

export const areaEyeById = new Map<number, Phaser.GameObjects.Graphics>()

export function createAreaEyeSystem(scene: Phaser.Scene) {
  const query = defineQuery([Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const entities = onQueryEnter(world)

    for (const idTank of entities) {
      // const areaId = addEntity(world)

      addComponent(world, AreaEye, idTank)
      // AreaEye.idTank[areaId] = idTank

      // addComponent(world, Position, idTank)
      // Position.x[areaId] = Position.x[idTank]
      // Position.y[areaId] = Position.y[idTank]

      // const circle = scene.add
      //   .circle(Position.x[areaId], Position.y[areaId], Tower.distanseEye[areaId], 0x000000, 0.05)
      //   .setDepth(0)
      const graphics = scene.add
        .graphics({
          lineStyle: {
            color: 0xffffff,
            alpha: 0.2,
            width: 3
          }
        })
        .setDepth(1)
      scene.minimap?.ignore(graphics)
      areaEyeById.set(idTank, graphics)
    }

    const entitiesExit = onQueryExit(world)

    for (const idTank of entitiesExit) {
      // console.log('Remove areaEye', idTank)
      const removeAreaEye = areaEyeById.get(idTank)
      if (removeAreaEye) {
        Entity.target[Entity.target[idTank]] = -1

        removeAreaEye.clear()
        removeAreaEye.destroy()
        areaEyeById.delete(idTank)
      }
    }

    return world
  })
}

export function createAreaEyeSyncSystem(scene) {
  const query = defineQuery([AreaEye])
  const queryPlayer = defineQuery([Player])

  return defineSystem((world) => {
    const entities = query(world)
    const players = queryPlayer(world)

    for (const id of entities) {
      const area = areaEyeById.get(id)

      // Position.x[areaId] = Position.x[tankId]
      // Position.y[areaId] = Position.y[tankId]

      // areaEyeById.get(areaId).x = Position.x[areaId]
      // areaEyeById.get(areaId).y = Position.y[areaId]
      // areaEyeById.get(areaId).fillColor = 0xff0000

      // const towerConfig = Tower
      const isPlayer = players.includes(id)
      const playerId = players[0]
      area.clear()
      if (
        isPlayer ||
        Entity.target[id] == scene.idPlayer ||
        (Entity.teamIndex[id] !== Entity.teamIndex[playerId] &&
          scene.gameData.settings.showAllEnemyEye)
      ) {
        if (Entity.target[id] != -1) {
          const colorTeamAttackZone =
            Entity.teamIndex[id] >= GameOptions.configTeams.length
              ? GameOptions.configTeams[1].colorAttackZone
              : GameOptions.configTeams[Entity.teamIndex[id]].colorAttackZone
          const colorTeamDistanceView =
            Entity.teamIndex[id] >= GameOptions.configTeams.length
              ? GameOptions.configTeams[1].colorDistanceView
              : GameOptions.configTeams[Entity.teamIndex[id]].colorDistanceView

          area.lineStyle(GameOptions.widthLineArea, colorTeamDistanceView, 0.3)
          area.strokeCircle(Position.x[id], Position.y[id], Tank.distanceView[id])

          // draw fire area.
          const configComplexTank = GameOptions.complexTanks[Tank.index[id]]
          const muzzleConfig = GameOptions.muzzles.items[configComplexTank.muzzle]
          const muzzleObject = muzzlesById.get(id)
          const vec = new Phaser.Math.Vector2(muzzleObject.x, muzzleObject.y)
          vec.setToPolar(muzzleObject.rotation, muzzleConfig.vert[0].x)
          const x2 = Position.x[id] + vec.x
          const y2 = Position.y[id] + vec.y

          area.lineStyle(GameOptions.widthLineArea, colorTeamAttackZone, 0.2)
          let maxAccuracity =
            GameOptions.maxAccuracityTower -
            Tank.accuracy[id] * GameOptions.maxAccuracityTower * 0.01

          if (maxAccuracity === 0) {
            maxAccuracity = GameOptions.minAngleArc
          }

          area.fillStyle(colorTeamAttackZone, 0.3)
          area.slice(
            x2,
            y2,
            Tank.distanceShot[id] + GameOptions.offsetAttackZone,
            Phaser.Math.DegToRad(RotationTower.angle[id] + maxAccuracity),
            Phaser.Math.DegToRad(RotationTower.angle[id] - maxAccuracity),
            true
          )
          area.fillPath()

          area.fillStyle(colorTeamAttackZone, 0.05)
          area.strokeCircle(x2, y2, Tank.distanceShot[id] + GameOptions.offsetAttackZone)
          area.fillCircle(x2, y2, Tank.distanceShot[id] + GameOptions.offsetAttackZone)

          if (id == scene.idPlayer && !scene.scene.isPaused()) {
            scene.scene.get('Control').showHelp('distanceViewMy', 1000)
          }
          if (id == scene.idPlayer && !scene.scene.isPaused()) {
            scene.scene.get('Control').showHelp('distanceShotMy', 1000)
          }

          if (Entity.target[id] == scene.idPlayer && !scene.scene.isPaused()) {
            scene.scene.get('Control').showHelp('distanceView', 1000)
          }
          if (Entity.target[id] == scene.idPlayer && !scene.scene.isPaused()) {
            scene.scene.get('Control').showHelp('distanceShot', 1000)
          }
        }
      }

      //   lightById.get(areaId).x = Position.x[areaId]
      //   lightById.get(areaId).y = Position.y[areaId]
    }

    return world
  })
}
