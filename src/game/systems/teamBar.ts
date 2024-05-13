import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, IWorld, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'

const OFFSET = 33

export const teamBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    healthImageBg: Phaser.GameObjects.Rectangle
    healthImage: Phaser.GameObjects.Rectangle
    allHealth: number
  }
>()

export interface ITeamBarData {
  allHealth: number
  ids: number[]
}

export function createTeamBarSystem(scene: Phaser.Scene) {
  const WIDTH_BAR = GameOptions.teamBarSize.width - OFFSET

  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)

  return defineSystem((world) => {
    if (scene.configRound.config.countTeams < 2) {
      return
    }

    const enterEntities = onQueryEnter(world)

    const teams: ITeamBarData[] = enterEntities.reduce((ac: ITeamBarData[], el: number) => {
      if (!ac[Entity.teamIndex[el]]) {
        ac[Entity.teamIndex[el]] = {
          allHealth: Tank.health[el],
          ids: [el]
        }
      } else {
        ac[Entity.teamIndex[el]].ids.push(el)
        ac[Entity.teamIndex[el]].allHealth = ac[Entity.teamIndex[el]].allHealth + Tank.health[el]
      }
      return ac
    }, [])

    // const teams = new Set(enterEntities.map((x) => Entity.teamId[x]))

    for (let i = 0; i < teams.length; i++) {
      const id = i
      const gerbId = Entity.gerbId[teams[i].ids[0]]

      const x3 = -GameOptions.teamBarSize.width / 2
      const y3 = -GameOptions.teamBarSize.height / 2
      const imageGerbBgOverlay = scene.add
        .rectangle(
          x3,
          y3,
          GameOptions.teamBarSize.width,
          GameOptions.teamBarSize.height,
          GameOptions.configTeams[id].color,
          1
        )
        .setOrigin(0)
      const imageGerbBgOverlay2 = scene.add
        .rectangle(
          x3 + 3,
          y3 + 3,
          GameOptions.teamBarSize.width - 6,
          GameOptions.teamBarSize.height - 6,
          0x111111,
          1
        )
        .setOrigin(0)

      const imageGerbBg = scene.add
        .image(x3, 0, 'marker', 0)
        .setScale(1.5)
        .setTint(GameOptions.configTeams[id].color)
        .setOrigin(0.5)
      //.circle(x3, 0, 50, 0x111111, 0.9).setOrigin(0.5)
      const imageGerb = scene.add
        .image(x3, 0, 'gerb', gerbId)
        .setScale(0.5)
        .setTint(0xffffff)
        .setOrigin(0.5)
      if (id === 0) {
        imageGerb.scaleX = -0.5
      }
      const textName = scene.add
        .text(150, -30, id === 0 ? scene.lang.yourTeam : scene.lang.enemyTeam, {
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: 20,
          color: GameOptions.ui.white,
          stroke: '#000000',
          strokeThickness: 2,
          align: 'left'
        })
        .setOrigin(id === 0 ? 0 : 1, 0.5)
      if (id === 0) {
        textName.scaleX = -1
      }
      const healthImage = scene.add
        .rectangle(x3 + 25, -10, WIDTH_BAR, 20, GameOptions.colors.health)
        .setOrigin(0)
      const healthImageBg = scene.add
        .rectangle(x3 + 25, -10, WIDTH_BAR, 20, 0x444444, 1)
        .setOrigin(0)

      const containerGerb = scene.add.container(-420, 35, [
        imageGerbBgOverlay,
        imageGerbBgOverlay2,
        healthImageBg,
        healthImage,
        imageGerbBg,
        textName,
        imageGerb
      ])

      if (id === 0) {
        containerGerb.scaleX = -1
      }

      // const textName = scene.add.text(50, 0, 'Mikala Parakhnevich')

      const bar = scene.add
        .container(-GameOptions.teamBarSize.width / 2, 0, [containerGerb])
        .setDepth(99999)
      scene.minimap?.ignore(bar)
      scene.teamBar.getTeamBar(id).add(bar)
      teamBarById.set(id, {
        bar,
        healthImage,
        healthImageBg,
        allHealth: teams[i].allHealth
      })
    }

    // const exitEntities = onQueryExit(world)
    // for (const id of exitEntities) {
    //   if (Tank.health[id] <= 0) {
    //     console.log('remove bar: ', id)
    //     const barObject = entityBarById.get(id)
    //     barObject.bar.destroy(true)
    //     // barObject.imgMaskHealth?.destroy(true)
    //     // barObject.imgMaskWeapon?.destroy(true)
    //     entityBarById.delete(id)
    //   }
    // }

    return world
  })
}

export function createTeamBarSyncSystem(scene) {
  const WIDTH_BAR = GameOptions.teamBarSize.width - OFFSET
  const query = defineQuery([Tank, Position])

  return defineSystem((world) => {
    const entities = query(world)

    const teams: ITeamBarData[] = entities.reduce((ac: ITeamBarData[], el: number) => {
      if (!ac[Entity.teamIndex[el]]) {
        ac[Entity.teamIndex[el]] = {
          allHealth: Tank.health[el],
          ids: [el]
        }
      } else {
        ac[Entity.teamIndex[el]].ids.push(el)
        ac[Entity.teamIndex[el]].allHealth = ac[Entity.teamIndex[el]].allHealth + Tank.health[el]
      }
      return ac
    }, [])

    for (let i = 0; i < teamBarById.size; i++) {
      const id = i
      const object = teamBarById.get(id)

      if (!object) continue
      // object.bar.x = Position.x[id] - 64
      // object.bar.y = Position.y[id] - 80

      // if (object.imgMaskHealth) {
      //   object.imgMaskHealth.setPosition(Position.x[id] - 20, Position.y[id] - 85)
      //   object.imgMaskWeapon.setPosition(Position.x[id] - 20, Position.y[id] - 75)
      // }
      const currentHealth = (WIDTH_BAR / object.allHealth) * (teams[id]?.allHealth || 0)
      // if (currentHealth) {
      // console.log(Tank.health[tankId], currentHealth)
      switch (true) {
        case object.allHealth < teams[id]?.allHealth * 0.1:
          object.healthImage.setFillStyle(GameOptions.workshop.colorLowProgress)
          break

        default:
          break
      }
      object.healthImage.displayWidth = currentHealth
      // }

      // const tower = towersById.get(id)
      // if (tower.weaponRefreshEvent) {
      //   const progress = tower.weaponRefreshEvent.getProgress()
      //   if (progress < 1) {
      //     Entity.weapon[id] = 0
      //   } else if (progress == 1) {
      //     Entity.weapon[id] = 1
      //   }
      // }
    }

    return world
  })
}
