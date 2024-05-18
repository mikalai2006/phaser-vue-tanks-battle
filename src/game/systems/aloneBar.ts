import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, IWorld, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'
import { replaceRegexByArray } from '../utils/utils'

export const aloneBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    text: Phaser.GameObjects.Text
  }
>()

export function createAloneBarSystem(scene: Phaser.Scene) {
  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)

  return defineSystem((world) => {
    if (scene.configRound.config.countTeams > 1) {
      return
    }

    const enterEntities = onQueryEnter(world)

    if (enterEntities.length > 0) {
      const text = scene.add
        .text(150, -30, 'aloneBar', {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 40,
          color: GameOptions.colors.lightColor,
          stroke: '#000000',
          strokeThickness: 2,
          align: 'left'
        })
        .setOrigin(0)

      const bar = scene.add.container(0, 100, [text]).setDepth(99999).setScrollFactor(0)

      scene.minimap?.ignore(bar)

      aloneBarById.set(0, {
        bar,
        text
      })
    }

    return world
  })
}

export function createAloneBarSyncSystem(scene) {
  const query = defineQuery([Tank, Position])

  return defineSystem((world) => {
    if (scene.configRound.config.countTeams > 1) {
      return
    }

    const entities = query(world)

    const barObj = aloneBarById.get(0)
    if (!barObj || !entities.length) {
      return
    }

    barObj.text?.setText(replaceRegexByArray(scene.lang.aloneTextBar, [entities.length]))

    return world
  })
}
