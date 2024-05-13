import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { EntityBar } from '../components/EntityBar'
import { Entity } from '../components/Entity'
import { GameOptions } from '../options/gameOptions'
import { tanksById, towersById } from './matter'
import { Bonus } from '../components/Bonus'

const WIDTH_BAR = 100

export const bonusBarById = new Map<
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

export function createBattleBarSystem(scene: Phaser.Scene) {
  const containerBody = scene.add.container(0, 0, [])
  const border = scene.add.image(0, 0, 'buttons', 0)
  const containerWrapper = scene.add
    .container(GameOptions.screen.width - 200, 50, [border, containerBody])
    .setDepth(99999)
    .setScrollFactor(0)
  const query = defineQuery([Entity])
  return defineSystem((world) => {
    const entities = query(world)

    const idEnemy = entities.find((x) => Entity.target[x] === scene.idFollower)

    containerBody.removeAll(true)
    containerWrapper.setVisible(false)

    if (typeof idEnemy === 'undefined') {
      return
    }
    // console.log(entities, idEnemy, scene.idFollower, GameOptions.tanks.items[Tank.level[idEnemy]])

    const enemyObject = tanksById.get(idEnemy)

    const scale = 1
    const tank = scene.add
      .sprite(0, 0, 'tank', GameOptions.tanks.items[Tank.level[idEnemy]].frame)
      .setScale(scale)
    const tower = scene.add
      .sprite(0, 0, 'tower', GameOptions.towers.items[Tank.levelTower[idEnemy]].frame)
      .setScale(scale)
    const muzzle = scene.add
      .sprite(
        -GameOptions.muzzles.items[0].offset.xOffset *
          GameOptions.muzzles.items[0].vert[0].x *
          scale,
        0,
        'muzzle',
        GameOptions.muzzles.items[Tank.levelMuzzle[idEnemy]].frame
      )
      .setTint(0x111111)
      .setScale(scale)
    const tankContainer = scene.add.container(0, 0, [tank, tower, muzzle]).setAngle(-90)

    containerBody.add(tankContainer)
    containerWrapper.setVisible(true)
    return world
  })
}

export function createBattleBarSyncSystem(scene) {
  const query = defineQuery([EntityBar])

  return defineSystem((world) => {
    const entities = query(world)

    for (const id of entities) {
      const object = bonusBarById.get(id)
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
          Entity.weapon[id] = 0
        } else if (progress == 1) {
          Entity.weapon[id] = 1
        }
        object.weaponImage.displayWidth = WIDTH_BAR * progress
      }
    }

    return world
  })
}
