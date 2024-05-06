import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, IWorld, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { EntityBar } from '../components/EntityBar'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'
import { towersById } from './matter'
import { generateName } from '../utils/utils'

const WIDTH_BAR = 100

export const entityBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    healthImageBg: Phaser.GameObjects.Rectangle
    weaponImageBg: Phaser.GameObjects.Rectangle
    healthImage: Phaser.GameObjects.Rectangle
    weaponImage: Phaser.GameObjects.Rectangle
    // imgMaskHealth: Phaser.GameObjects.Image
    // imgMaskWeapon: Phaser.GameObjects.Image
  }
>()

export function createEntityBarSystem(scene: Phaser.Scene) {
  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)

    for (const id of enterEntities) {
      addComponent(world, EntityBar, id)
      EntityBar.weapon[id] = 1
      // addComponent(world, Position, barId)
      // Position.x[barId] = Position.x[idTank]
      // Position.y[barId] = Position.y[idTank]

      // addComponent(world, EntityBar, barId)
      // EntityBar.idTank[barId] = idTank

      const bg1 = scene.add
        .rectangle(0, 0, WIDTH_BAR + 10, 30, GameOptions.configTeams[Entity.teamIndex[id]].color)
        .setOrigin(0, 0.5)
      const imageBrandBg = scene.add
        .image(-17, 0, 'marker', 0)
        .setTint(GameOptions.configTeams[Entity.teamIndex[id]].color)
      const imageGerb = scene.add
        .image(-16, 3, 'gerb', Entity.gerbId[id])
        .setTint(0xffffff)
        .setScale(0.3)

      const imageRankBg = scene.add.rectangle(WIDTH_BAR + 20, 2, 28, 30, 0x111111)
      const imageRank = scene.add
        .image(WIDTH_BAR + 20, 3, 'rank', Entity.rank[id])
        .setTint(0xffffff)
        .setScale(0.7)
      const bg = scene.add.rectangle(3, 0, WIDTH_BAR + 4, 22, 0x111111).setOrigin(0, 0.5)
      const textName = scene.add.text(
        -40,
        -45,

        scene.names.get(id)?.substring(0, GameOptions.maxNameUser),
        {
          fontFamily: 'Arial',
          // fontStyle: 'bold',
          fontSize: 20,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'left'
        }
      )
      const healthImage = scene.add
        .rectangle(5, -8, WIDTH_BAR, 6, GameOptions.colors.health)
        .setOrigin(0)
      const healthImageBg = scene.add.rectangle(5, -8, WIDTH_BAR, 6, 0x444444).setOrigin(0, 0)
      const weaponImage = scene.add.rectangle(5, 4, WIDTH_BAR, 6, 0xf59e0b).setOrigin(0, 0.5)
      const weaponImageBg = scene.add.rectangle(5, 4, WIDTH_BAR, 6, 0x444444).setOrigin(0, 0.5)

      let imgMaskHealth = null,
        imgMaskWeapon = null
      // if (scene.sys.game.device.os.desktop) {
      //   imgMaskWeapon = scene.add
      //     .image(0, 0, 'tank_bar')
      //     // .setScale(1)
      //     .setDepth(99999)
      //   const maskWeapon = imgMaskWeapon.createBitmapMask()
      //   imgMaskHealth = scene.add
      //     .image(0, 0, 'tank_bar')
      //     // .setScale(1)
      //     .setDepth(99999)
      //   const mask = imgMaskHealth.createBitmapMask()
      //   weaponImage.setMask(maskWeapon)
      //   weaponImageBg.setMask(maskWeapon)
      //   healthImage.setMask(mask)
      //   healthImageBg.setMask(mask)
      // }

      // // const bitMaskWeapon = new Phaser.Display.Masks.BitmapMask(this, weaponImage)
      // const weaponProgress = scene.add.rectangle(0, 10, 50, 10, 0xffff00, 1).setOrigin(0, 0.5)
      // const barWeapon = scene.add.container(0, 0, [weaponProgress])
      // // weaponProgress.setMask(bitMaskWeapon)
      // // const weaponProgress = scene.add.image(0, 10, 'tank_bar').setOrigin(0, 0.5)
      // // const barWeapon = scene.add.container(0, 0, [weaponProgress])

      const bar = scene.add
        .container(Position.x[id], Position.y[id], [
          bg1,
          bg,
          textName,
          imageBrandBg,
          imageGerb,
          healthImageBg,
          healthImage,
          weaponImageBg,
          weaponImage,
          imageRankBg,
          imageRank
        ])
        .setDepth(99999)
      scene.minimap?.ignore(bar)

      entityBarById.set(id, {
        bar,
        healthImage,
        healthImageBg,
        weaponImage,
        weaponImageBg
        // imgMaskHealth,
        // imgMaskWeapon
      })
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      if (Tank.health[id] <= 0) {
        // console.log('remove bar: ', id)
        const barObject = entityBarById.get(id)
        barObject.bar.destroy(true)
        // barObject.imgMaskHealth?.destroy(true)
        // barObject.imgMaskWeapon?.destroy(true)
        entityBarById.delete(id)
      }
    }

    return world
  })
}

export function createEntityBarSyncSystem(scene) {
  const query = defineQuery([EntityBar])

  return defineSystem((world) => {
    const entities = query(world)

    for (const id of entities) {
      const object = entityBarById.get(id)
      object.bar.x = Position.x[id] - 64
      object.bar.y = Position.y[id] - 80

      // if (object.imgMaskHealth) {
      //   object.imgMaskHealth.setPosition(Position.x[id] - 20, Position.y[id] - 85)
      //   object.imgMaskWeapon.setPosition(Position.x[id] - 20, Position.y[id] - 75)
      // }

      const currentHealth = (WIDTH_BAR / Tank.maxHealth[id]) * Tank.health[id]
      // (WIDTH_BAR / GameOptions.tanks.items[Tank.level[id]].game.health) * Tank.health[id]
      // console.log(Tank.health[id], currentHealth)

      object.healthImage.displayWidth = currentHealth

      const tower = towersById.get(id)
      if (tower.weaponRefreshEvent) {
        const progress = tower.weaponRefreshEvent.getProgress()
        if (progress < 1) {
          EntityBar.weapon[id] = 0
        } else if (progress == 1) {
          EntityBar.weapon[id] = 1
        }
        object.weaponImage.displayWidth = WIDTH_BAR * progress
      }
    }

    return world
  })
}
