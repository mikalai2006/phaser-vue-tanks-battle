import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, exitQuery, Not } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { GameOptions } from '../options/gameOptions'
import { Entity } from '../components/Entity'
import { Player } from '../components/Player'

const HEIGHT_BAR = 30

export const markersId = new Map<
  number,
  {
    // mask: Phaser.GameObjects.Image
    imgBg: Phaser.GameObjects.Image
    container: Phaser.GameObjects.Container
    progress: Phaser.GameObjects.Rectangle
  }
>()

export function createMarkersSystem(scene: Phaser.Scene) {
  const query = defineQuery([Tank, Not(Player)])

  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const entities = onQueryEnter(world)

    for (const id of entities) {
      const colorTeam =
        Entity.teamIndex[id] >= GameOptions.configTeams.length
          ? GameOptions.configTeams[1].color
          : GameOptions.configTeams[Entity.teamIndex[id]].color

      const img = scene.add
        .sprite(0, 0, 'marker', 0) //Entity.teamId[id] === Entity.teamId[players[0]] ? 1 : 0
        .setScale(1.2)
        .setTint(colorTeam)
      const progressBg = scene.add
        .rectangle(-HEIGHT_BAR / 2, -15, HEIGHT_BAR, 5, 0x333333)
        .setOrigin(0)
      const progress = scene.add
        .rectangle(-HEIGHT_BAR / 2, -15, HEIGHT_BAR, 5, GameOptions.colors.health)
        .setOrigin(0)
      // let imgMask = null
      // if ( scene.sys.game.device.os.desktop) {
      //   imgMask = scene.add
      //     .sprite(0, 0, 'marker', 1) //Entity.teamId[id] === Entity.teamId[players[0]] ? 1 : 0
      //     .setScale(1)
      //     .setDepth(99999)
      //   const mask = imgMask.createBitmapMask()
      //   progress.setMask(mask)
      // }
      const imageGerb = scene.add
        .image(0, 3, 'gerb', Entity.gerbId[id])
        .setTint(0xffffff)
        .setScale(0.3)
      const container = scene.add
        .container(0, 0, [img, imageGerb, progressBg, progress])
        .setDepth(99999)

      scene.minimap?.ignore(container)

      markersId.set(id, {
        container,
        // mask: imgMask,
        imgBg: img,
        progress
      })
    }

    const entitiesExit = onQueryExit(world)

    for (const id of entitiesExit) {
      // console.log('Remove marker ', id)
      const marker = markersId.get(id)
      if (marker) {
        marker.container.destroy(true)
        // marker.mask?.destroy()
        marker.imgBg.destroy(true)
        markersId.delete(id)
      }
    }

    return world
  })
}

export function createMarkersSyncSystem(scene) {
  const query = defineQuery([Tank, Not(Player)])
  const queryPlayer = defineQuery([Player])

  return defineSystem((world) => {
    // const player = queryPlayer(world)[0]
    const activeEntityId = scene.idFollower
    const entities = query(world)

    // if (player === undefined) {
    if (activeEntityId === undefined || activeEntityId === -1) {
      return
    }

    const area = new Phaser.Geom.Rectangle(
      scene.cameras.main.worldView.x + GameOptions.marginMarker,
      scene.cameras.main.worldView.y + GameOptions.marginMarker,
      GameOptions.screen.width - GameOptions.marginMarker * 2,
      GameOptions.screen.height - GameOptions.marginMarker * 2
    )
    for (const id of entities) {
      const container = markersId.get(id)
      if (!container) {
        continue
      }

      const line = new Phaser.Geom.Line(
        Position.x[activeEntityId],
        Position.y[activeEntityId],
        Position.x[id],
        Position.y[id]
      )

      const intersects = Phaser.Geom.Intersects.GetLineToRectangle(line, area)

      if (intersects.length) {
        container.container.setVisible(true)
        container.container.setActive(true)
        container.container.setPosition(intersects[0].x, intersects[0].y)
        // container.imgBg.setPosition(intersects[0].x, intersects[0].y)
        // if (container.mask) {
        //   container.mask.setPosition(intersects[0].x, intersects[0].y)
        // }

        const currentHealth = (HEIGHT_BAR / Tank.maxHealth[id]) * Tank.health[id]
        // console.log(Tank.health[tankId], currentHealth)

        container.progress.displayWidth = currentHealth
      } else {
        container.container.setVisible(false)
        container.container.setActive(false)
        // if (container.mask) {
        //   container.mask.setActive(false)
        //   container.mask.setVisible(false)
        // }
      }
    }

    return world
  })
}
