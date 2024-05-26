import Phaser from 'phaser'
import PF from 'pathfinding'
import { defineSystem, defineQuery, exitQuery } from 'bitecs'

import AI, { StatusAI } from '../components/AI'
import Input from '../components/Input'
import { Entity } from '../components/Entity'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { tanksById } from './matter'

export const pathEntityById = new Map<number, number[][]>()

export const destroyMap = () => {
  pathEntityById.forEach((value, key) => {
    pathEntityById.delete(key)
  })
}

export default function createAIManagerSystem(scene: Phaser.Scene) {
  const cpuQuery = defineQuery([AI])
  const queryEntities = defineQuery([Tank, Position])
  const onQueryExit = exitQuery(cpuQuery)

  return defineSystem((world) => {
    if (scene.isPauseAI) {
      return
    }
    const minTanksForFollow = 5

    const aiExits = onQueryExit(world)
    const entities = cpuQuery(world)
    const tanks = queryEntities(world)

    for (let i = 0; i < aiExits.length; ++i) {
      const id = aiExits[i]
      pathEntityById.delete(id)
      // console.log('Remove AI manager ', id)
    }

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      const enemyTanks = tanks.filter((x) => Entity.teamIndex[x] != Entity.teamIndex[id])
      let entityPath = pathEntityById.get(id)
      // console.log(allowNodes)

      if (Input.fire[id] || Entity.target[id] != -1 || AI.accumulatedPathTime[id] > 5000) {
        if (scene.matter.world.drawDebug) {
          pathEntityById.get(id)?.forEach((element, index) => {
            const [x, y] = element
            if (index > 0) {
              scene.groundTilesLayer.setTint(0xffffff, x, y, 1, 1)
            }
          })
        }
        pathEntityById.delete(id)
        Entity.targetGridX[id] = -1
        Entity.targetGridY[id] = -1
        AI.accumulatedPathTime[id] = 0
        AI.status[id] = StatusAI.MoveRandom
        // console.log(id, ' set status Random')
      }
      //  else if (AI.accumulatedPathTime[id] > 5000) {
      //   console.log(id, ' accumulatedPathTime=', AI.accumulatedPathTime[id])

      //   pathEntityById.delete(id)
      //   Entity.targetGridX[id] = -1
      //   Entity.targetGridY[id] = -1
      //   AI.accumulatedPathTime[id] = 0
      //   AI.status[id] = StatusAI.MoveRandom
      // }
      else if (
        ((AI.status[id] === StatusAI.Idle ||
          Input.countRandom[id] > 5 ||
          Tank.health[id] < 50 ||
          enemyTanks.length < minTanksForFollow) &&
          (!entityPath || entityPath.length === 0)) ||
        Entity.targetGridX[id] != -1
      ) {
        const gridBackup: PF.Grid = scene.grid.clone()
        var finder = new PF.AStarFinder({
          allowDiagonal: true,
          dontCrossCorners: true
        })

        Input.countRandom[id] = 0

        // if (Entity.targetGridX[id] != -1 && Entity.targetGridY[id] != -1) {
        //   const xTarget = Entity.targetGridX[id]
        //   const yTarget = Entity.targetGridY[id]
        //   Entity.targetGridX[id] = -1
        //   Entity.targetGridY[id] = -1
        // } else if (enemyTanks.length < 0 && Tank.health[id] > 50) {

        // } else  {

        // }

        // if (
        //   !entityPath ||
        //   entityPath.length === 0 ||
        //   // AI.accumulatedPathTime[id] > 5000 ||
        //   (Entity.targetGridX[id] != -1 && Entity.targetGridY[id] != -1)
        // ) {
        // const t0 = performance.now()

        let xTarget = 0
        let yTarget = 0

        if (Entity.targetGridX[id] != -1 && Entity.targetGridY[id] != -1) {
          xTarget = Entity.targetGridX[id]
          yTarget = Entity.targetGridY[id]
          Entity.targetGridX[id] = -1
          Entity.targetGridY[id] = -1
          // console.log(id, ' check bonus point: ', xTarget, yTarget)
        } else if (enemyTanks.length < minTanksForFollow && Tank.health[id] > 50) {
          const randomTarget = enemyTanks[Phaser.Math.Between(0, enemyTanks.length - 1)]
          const tankObject = tanksById.get(randomTarget)

          if (!tankObject) {
            continue
          }
          const tile = scene.groundTilesLayer.getTileAtWorldXY(tankObject.x, tankObject.y)
          xTarget = tile.x
          yTarget = tile.y
          // console.log(id, ' check tank point: ', xTarget, yTarget)
        } else {
          const allowNodes = gridBackup.nodes.reduce((ac, el) => {
            if (!ac.length) ac = []
            const aa = ac.concat(
              el.filter((z) => z.walkable && z.x !== Position.x[id] && z.y !== Position.y[id])
            )
            return aa
          }, [])
          const randomNodeTarget = allowNodes[Phaser.Math.Between(0, allowNodes.length - 1)]
          // console.log(randomNodeTarget)

          xTarget = randomNodeTarget.x
          yTarget = randomNodeTarget.y
          // console.log(id, ' check random point: ', xTarget, yTarget)
        }

        if (!xTarget || !yTarget) {
          continue
        }

        // console.log(id, xTarget, yTarget)
        // const tileCurrentEntity = scene.groundTilesLayer.getTileAtWorldXY(
        //   Position.x[id],
        //   Position.y[id]
        // )
        const path = finder.findPath(
          // tileCurrentEntity.x,
          // tileCurrentEntity.y,
          Entity.gridX[id],
          Entity.gridY[id],
          xTarget,
          yTarget,
          gridBackup
        )

        // const t1 = performance.now()
        // console.log(`Call to doSomething took ${t1 - t0} milliseconds.`)
        // path.shift()
        pathEntityById.set(id, path)
        // console.log(id, Entity.teamIndex[id], xTarget, yTarget, pathEntityById.get(id).length)

        // Entity.targetGridX[id] = -1
        // Entity.targetGridY[id] = -1
        // console.log(id, ' set status moveTo')
        // }

        if (scene.matter.world.drawDebug) {
          pathEntityById.get(id).forEach((element, index) => {
            const [x, y] = element
            if (index > 0) {
              scene.groundTilesLayer.setTint(0x0000ff, x, y, 1, 1)
            }
          })
        }
        AI.status[id] = StatusAI.MoveTo //Phaser.Math.Between(1, Object.keys(StatusAI).length / 2 - 1)
      }
      // else if (
      //   AI.status[id] === StatusAI.MoveRandom &&
      //   Entity.target[id] === -1 &&
      //   Input.countRandom[id] > 5
      // ) {
      //   AI.status[id] = StatusAI.MoveTo

      //   Input.countRandom[id] = 0
      // }
      // else if (Tank.health[id] < 50) {
      //   Input.countRandom[id] = 0

      //   // TODO: find point with health
      //   AI.status[id] = StatusAI.MoveTo
      // }

      // console.log(id, AI.status[id])
    }

    return world
  })
}
