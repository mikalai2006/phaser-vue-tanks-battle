import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, IWorld, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { EntityBar } from '../components/EntityBar'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'
import { towersById } from './matter'

const WIDTH_BAR = 128

export const entityBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    healthImageBg: Phaser.GameObjects.Rectangle
    weaponImageBg: Phaser.GameObjects.Rectangle
    healthImage: Phaser.GameObjects.Rectangle
    weaponImage: Phaser.GameObjects.Rectangle
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

      const bg = scene.add.rectangle(0, 0, WIDTH_BAR + 4, 18, 0x333333).setOrigin(0, 0.5)
      const healthImage = scene.add.rectangle(2, -7, WIDTH_BAR, 6, 0x84cc16).setOrigin(0)
      const healthImageBg = scene.add.rectangle(2, -7, WIDTH_BAR, 6, 0x333333).setOrigin(0, 0)
      // // const bitMaskHealth = new Phaser.Display.Masks.BitmapMask(this, healthImage)
      // const healthProgress = scene.add.rectangle(0, 0, 100, 10, 0xff0000, 1).setOrigin(0, 0.5)
      // const barHealth = scene.add.container(0, 0, [healthProgress]).setDepth(99999)
      // // healthProgress.setMask(bitMaskHealth)

      const weaponImage = scene.add.rectangle(2, 4, WIDTH_BAR, 6, 0xf59e0b).setOrigin(0, 0.5)
      const weaponImageBg = scene.add.rectangle(2, 4, WIDTH_BAR, 6, 0x333333).setOrigin(0, 0.5)

      // const weaponProgress = scene.add.image(0, 10, 'tank_bar').setOrigin(0, 0.5)\
      const mask = scene.make.image({ x: 0, y: 0, key: 'tank_bar' }, false).setOrigin(0, 0.5)
      // const bitMaskWeapon = mask.createBitmapMask() // new Phaser.Display.Masks.BitmapMask(this, imageForMask)
      // const weaponProgress = scene.add.rectangle(0, 10, 50, 10, 0xffff00, 1).setOrigin(0, 0.5)
      // const barWeapon = scene.add.container(0, 0, [weaponProgress])
      weaponImage.setMask(mask.createBitmapMask())

      // const barWeapon = scene.add.container(0, 0, [weaponProgress])

      scene.minimap?.ignore([weaponImage, weaponImageBg])

      const bar = scene.add
        .container(Position.x[id], Position.y[id], [
          bg,
          healthImageBg,
          healthImage,
          weaponImageBg,
          weaponImage
        ])
        .setDepth(99999)

      entityBarById.set(id, {
        bar,
        healthImage,
        healthImageBg,
        weaponImage,
        weaponImageBg
      })
    }

    const exitEntities = onQueryExit(world)
    for (const id of exitEntities) {
      if (Entity.health[id] <= 0) {
        console.log('remove bar: ', id)
        const barObject = entityBarById.get(id)
        barObject.bar.destroy(true)
        entityBarById.delete(id)
      }
    }

    return world
  })
}

export function createEntityBarSyncSystem() {
  const query = defineQuery([EntityBar])

  return defineSystem((world) => {
    const entities = query(world)

    for (const id of entities) {
      entityBarById.get(id).bar.x = Position.x[id] - 64
      entityBarById.get(id).bar.y = Position.y[id] - 80

      const currentHealth =
        (WIDTH_BAR / GameOptions.tanks.items[Tank.level[id]].game.health) * Entity.health[id]
      // console.log(Entity.health[tankId], currentHealth)

      entityBarById.get(id).healthImage.displayWidth = currentHealth

      const tower = towersById.get(id)
      if (tower.weaponRefreshEvent) {
        const progress = tower.weaponRefreshEvent.getProgress()
        if (progress < 1) {
          EntityBar.weapon[id] = 0
          entityBarById.get(id).weaponImage.displayWidth = WIDTH_BAR * progress
        } else if (progress == 1) {
          EntityBar.weapon[id] = 1
        }
      }
    }

    return world
  })
}
