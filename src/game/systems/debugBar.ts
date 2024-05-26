import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, IWorld, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { EntityBar } from '../components/EntityBar'
import { Entity } from '../components/Entity'
import { replaceRegexByArray } from '../utils/utils'
import Input from '../components/Input'
import AI, { StatusAI } from '../components/AI'
import { pathEntityById } from './aiManager'

const WIDTH_BAR = 100

export const debugBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    text: Phaser.GameObjects.Text
  }
>()

export function createDebugBarSystem(scene: Phaser.Scene) {
  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)

    for (const id of enterEntities) {
      const bg = scene.add
        .rectangle(-WIDTH_BAR / 2, -WIDTH_BAR / 2, WIDTH_BAR, WIDTH_BAR, 0x000000)
        .setInteractive()
        .setOrigin(0)
      const text = scene.add
        .text(-WIDTH_BAR / 2, -WIDTH_BAR / 2, 'debug...', {
          fontFamily: 'Arial',
          // fontStyle: 'bold',
          fontSize: 15,
          color: '#ffffff',
          align: 'left',
          wordWrap: {
            width: WIDTH_BAR
          }
        })
        .setOrigin(0)

      const bar = scene.add
        .container(Position.x[id], Position.y[id], [bg, text])
        .setDepth(99999)
        .setAlpha(0.1)

      bg.on('pointerup', () => {
        bar.alpha == 0.1 ? bar.setAlpha(1) : bar.setAlpha(0.1)
      })
      debugBarById.set(id, {
        bar,
        text
      })
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      if (Tank.health[id] <= 0) {
        // console.log('remove debug bar: ', id)
        const barObject = debugBarById.get(id)
        if (barObject) {
          barObject.bar?.destroy(true)
        }
        debugBarById.delete(id)
      }
    }

    return world
  })
}

export function createDebugBarSyncSystem(scene) {
  const query = defineQuery([EntityBar])

  return defineSystem((world) => {
    const entities = query(world)

    for (const id of entities) {
      const bar = debugBarById.get(id)
      bar.bar.x = Position.x[id]
      bar.bar.y = Position.y[id]

      const keyStatus = Object.keys(StatusAI).find((key) => StatusAI[key] === AI.status[id])

      bar.text.setText(
        replaceRegexByArray(
          'status=%s\r\nrandCount=%s\r\nu:%s d:%s l:%s r:%s\r\nobstacle=%s\r\ntargetId=%s\r\npathL=%s',
          [
            keyStatus,
            Input.countRandom[id].toString(),
            Input.up[id],
            Input.down[id],
            Input.left[id],
            Input.right[id],
            Input.obstacle[id],
            Entity.target[id],
            pathEntityById.get(id)?.length
          ]
        )
      )
    }

    return world
  })
}
