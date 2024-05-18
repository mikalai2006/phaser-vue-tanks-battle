import Phaser from 'phaser'
import { defineSystem, defineQuery, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { GameOptions, SpriteKeys } from '../options/gameOptions'
import { Entity } from '../components/Entity'

// export const aloneBarById = new Map<
//   number,
//   {
//     bar: Phaser.GameObjects.Container
//     text: Phaser.GameObjects.Text
//   }
// >()
export interface IDataHint {
  id: number
  idKiller: number
  name: string
  nameKiller: string
  team: number
  teamKiller: number
  gerbId: number
  gerbIdKiller: number
}
const WIDTH_ITEM = 400
const HEIGHT_ITEM = 40
const PROGRESS_HEIGHT = 5

const hints = new Map<number, IDataHint>()
const timers = new Map<number, Phaser.Time.TimerEvent>()
const progress = new Map<number, Phaser.GameObjects.Rectangle>()

export function removeAllMap() {
  hints.forEach((value, key) => {
    hints.delete(key)
  })
  progress.forEach((value, key) => {
    progress.delete(key)
  })
  timers.forEach((value, key) => {
    timers.delete(key)
  })
}

export function createHintSystem(scene: Phaser.Scene) {
  const container = scene.add.container(50, 500, []).setScrollFactor(0).setDepth(999999)

  const query = defineQuery([Position, Tank])
  const onQueryEnter = exitQuery(query)

  return defineSystem((world) => {
    if (!scene.gameData.settings.showHintKill) {
      return
    }

    const exitEntities = onQueryEnter(world)
    const entities = query(world)

    if (entities.length < 2 || scene.isRoundEnd) {
      removeAllMap()
      createContainerHints(scene)
      container.removeAll(true)
      return
    }

    if (exitEntities.length > 0) {
      for (const id of exitEntities) {
        const data: IDataHint = {
          id,
          idKiller: Entity.targetDeath[id],
          name: scene.names.get(id),
          nameKiller: scene.names.get(Entity.targetDeath[id]),
          team: Entity.teamIndex[id],
          teamKiller: Entity.teamIndex[Entity.targetDeath[id]],
          gerbId: Entity.gerbId[id],
          gerbIdKiller: Entity.gerbId[Entity.targetDeath[id]]
        }

        // console.log('Hint: exit ', data)
        // const hint = addHint(scene, data)
        // container.add(hint)

        const timer = scene.time.delayedCall(
          GameOptions.timeShowHints,
          () => {
            hints.delete(id)
            timers.delete(id)
            progress.delete(id)

            const elements = createContainerHints(scene)
            container.removeAll(true)
            container.add(elements)
          },
          [],
          this
        )
        timers.set(id, timer)
        hints.set(id, data)
        const elements = createContainerHints(scene)
        container.removeAll(true)
        container.add(elements)
      }
      // const text = scene.add
      //   .text(150, -30, 'aloneBar', {
      //     fontFamily: 'Arial',
      //     fontStyle: 'bold',
      //     fontSize: 40,
      //     color: GameOptions.colors.lightColor,
      //     stroke: '#000000',
      //     strokeThickness: 2,
      //     align: 'left'
      //   })
      //   .setOrigin(0)

      // const bar = scene.add.container(0, 100, [text]).setDepth(99999).setScrollFactor(0)

      // scene.minimap?.ignore(bar)

      // aloneBarById.set(0, {
      //   bar,
      //   text
      // })
    }

    return world
  })
}

export function createHintSyncSystem(scene: Phaser.Scene) {
  return defineSystem((world) => {
    if (progress.size > 0) {
      progress.forEach((value, key) => {
        const timer = timers.get(key)
        const width = value.width
        value.displayWidth = width - width * timer.getProgress()
      })
    }

    return world
  })
}

const createContainerHints = (scene) => {
  const items = []
  const queueReverse = [...hints].reverse()

  queueReverse.forEach((value) => {
    const [id, data] = value
    const item = createHint(scene, hints.get(id))
    items.push(item)
  })

  const grid = Phaser.Actions.GridAlign(items, {
    width: 1,
    height: 10,
    cellWidth: WIDTH_ITEM,
    cellHeight: HEIGHT_ITEM + 5,
    x: 0,
    y: 0
  })

  return grid
}

const createHint = (scene: Phaser.Scene, data: IDataHint) => {
  const imageTeamKiller = scene.add
    .image(0, 0, SpriteKeys.Gerb, Entity.gerbId[data.idKiller])
    .setOrigin(0)
    .setScale(0.3)
  const nameKiller = scene.add
    .text(imageTeamKiller.width * imageTeamKiller.scale, 5, data.nameKiller, {
      fontFamily: 'Arial',
      fontSize: 18,
      align: 'left'
    })
    .setOrigin(0)
  const textKill = scene.add
    .text(
      imageTeamKiller.width * imageTeamKiller.scale + nameKiller.width,
      5,
      ` ${scene.lang.kills} >`,
      {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'left',
        color: GameOptions.colors.lightColor
      }
    )
    .setOrigin(0)
    .setAlpha(0.6)
  const imageTeam = scene.add
    .image(
      imageTeamKiller.width * imageTeamKiller.scale + nameKiller.width + textKill.width,
      0,
      SpriteKeys.Gerb,
      Entity.gerbId[data.id]
    )
    .setOrigin(0)
    .setScale(0.3)
  const name = scene.add
    .text(
      imageTeamKiller.width * imageTeamKiller.scale +
        nameKiller.width +
        imageTeam.width * imageTeam.scale +
        textKill.width,
      5,
      data.name,
      {
        fontFamily: 'Arial',
        fontSize: 18,
        align: 'left'
      }
    )
    .setOrigin(0)
  const width =
    imageTeamKiller.width * imageTeamKiller.scale +
    nameKiller.width +
    imageTeam.width * imageTeam.scale +
    textKill.width +
    name.width +
    15
  const bg = scene.add.rectangle(0, 0, width, HEIGHT_ITEM, 0x000000, 0.6).setOrigin(0)
  const containerInfo = scene.add.container(5, 5, [
    imageTeam,
    imageTeamKiller,
    name,
    textKill,
    nameKiller
  ])
  const progressItem = scene.add
    .rectangle(
      0,
      bg.height - PROGRESS_HEIGHT,
      width,
      PROGRESS_HEIGHT,
      Phaser.Display.Color.ValueToColor(GameOptions.colors.accent).color,
      0.5
    )
    .setOrigin(0)
  progress.set(data.id, progressItem)
  const container = scene.add.container(0, 0, [bg, progressItem, containerInfo])
  return container
}
