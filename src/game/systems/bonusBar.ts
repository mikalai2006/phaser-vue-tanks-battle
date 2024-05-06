import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, addComponent, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { EntityBar } from '../components/EntityBar'
import { Entity } from '../components/Entity'
import { BonusType, GameOptions } from '../options/gameOptions'
import { towersById } from './matter'
import { Bonus } from '../components/Bonus'
import { groupBy } from 'lodash'

const WIDTH_ITEM = 300
const HEIGHT_ITEM = 50

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

export function createEntityBarBonusesSystem(scene: Phaser.Scene) {
  const containerBonus = scene.add.container(10, 10, [])
  // const border = scene.add.rectangle(0, 0, 120, 500, 0x000000, 0.5).setOrigin(0)
  const containerBonusWrapper = scene.add
    .container(GameOptions.marginMarker * 2, GameOptions.marginMarker * 1.8 + 100, [containerBonus])
    .setDepth(99999)
    .setScrollFactor(0)

  const query = defineQuery([Bonus])

  return defineSystem((world) => {
    const dt = scene.game.loop.delta

    const entities = query(world)

    const activeEntityBonuses = entities.filter((x) => Bonus.entityId[x] === scene.idFollower)

    const groupBonuses = groupBy(activeEntityBonuses, (v) => Bonus.type[v])
    // console.log(groupBonuses)

    const items = []
    for (const id in groupBonuses) {
      const idFirst = groupBonuses[id][0]
      const count = groupBonuses[id].length
      if (count == -1) {
        continue
      }

      const keyBonus = Object.keys(BonusType).find((key) => BonusType[key] === Bonus.type[idFirst])
      const value = groupBonuses[id].reduce((ac, el) => {
        const newValue = ac + Bonus.value[el]
        return newValue
      }, 0)
      const textNameBonus = scene.add
        .text(50, 5, scene.lang.options[keyBonus], {
          fontFamily: 'Arial',
          fontSize: 18,
          color: GameOptions.ui.primaryColor,
          align: 'left'
        })
        .setOrigin(0)
      const progressBg = scene.add
        .rectangle(
          50,
          HEIGHT_ITEM - 20,
          WIDTH_ITEM - WIDTH_ITEM / 2,
          10,
          GameOptions.ui.progressBgColor
        )
        .setOrigin(0)
      const maximumOptionValue = GameOptions.maximum[keyBonus]
      // Math.max.apply(
      //   Math,
      //   [...GameOptions.tanks.items, ...GameOptions.towers.items, ...GameOptions.muzzles.items]
      //     .filter((x) => !!x.game[keyBonus])
      //     .map(function (o) {
      //       return o.game[keyBonus]
      //     })
      // )
      const keyMax = `max${keyBonus.charAt(0).toUpperCase() + keyBonus.slice(1)}`
      const maxUpdateValue = maximumOptionValue - Tank[keyMax][scene.idFollower]
      const bonusValueProgress =
        (Phaser.Math.Clamp(value, 0, maxUpdateValue) * 100) / maximumOptionValue
      const currentMaxValue = (Tank[keyMax][scene.idFollower] * 100) / maximumOptionValue
      const actualValue = currentMaxValue * (WIDTH_ITEM - WIDTH_ITEM / 2) * 0.01
      const currentActualProgress = scene.add
        .rectangle(50, HEIGHT_ITEM - 20, actualValue, 10, GameOptions.workshop.colorValueProgress)
        .setOrigin(0)
      const bonusProgress = scene.add
        .rectangle(
          actualValue + 52,
          HEIGHT_ITEM - 20,
          bonusValueProgress * (WIDTH_ITEM - WIDTH_ITEM / 2) * 0.01,
          10,
          GameOptions.workshop.colorHighProgress
        )
        .setOrigin(0)
      const text = scene.add
        .text(
          WIDTH_ITEM - 10,
          HEIGHT_ITEM - 5,
          Math.round(bonusValueProgress) == 0 ? 'MAX' : '+' + bonusValueProgress.toFixed(1) + '%',
          {
            fontFamily: 'Arial',
            fontSize: 20,
            fontStyle: 'bold',
            color:
              Math.round(bonusValueProgress) == 0
                ? GameOptions.ui.successColor
                : GameOptions.ui.accent,
            align: 'center'
          }
        )
        .setOrigin(1)
      const bonusConfig = GameOptions.bonuses.find((x) => x.type === Bonus.type[idFirst])
      const bg = scene.add.rectangle(0, 0, WIDTH_ITEM, HEIGHT_ITEM, 0x000000, 0.5).setOrigin(0)
      //circle(0, 0, 25, GameOptions.ui.panelBgColor, 0.5).setOrigin(0)
      const imgBonus = scene.add.image(25, 25, 'bonuses', bonusConfig.frame).setScale(0.7)
      const itemContainer = scene.add.container(0, 0, [
        bg,
        imgBonus,
        text,
        textNameBonus,
        progressBg,
        currentActualProgress,
        bonusProgress
      ])

      if (Bonus.duration[idFirst] > 0) {
        Bonus.duration[idFirst] -= dt
        const bonusConfig = GameOptions.bonuses.find((x) => x.type === Bonus.type[idFirst])
        const durationProgress = scene.add
          .rectangle(
            0,
            0,
            ((Bonus.duration[idFirst] * 100) / bonusConfig.duration) * WIDTH_ITEM * 0.01,
            HEIGHT_ITEM,
            GameOptions.workshop.colorLowProgress,
            0.3
          )
          .setOrigin(0)
        itemContainer.add(durationProgress)
      }

      items.push(itemContainer)
    }

    const gridBonuses = Phaser.Actions.GridAlign(items, {
      width: 1,
      height: 10,
      cellWidth: WIDTH_ITEM,
      cellHeight: HEIGHT_ITEM,
      x: 0,
      y: 0
    })

    if (!items.length) {
      containerBonusWrapper.setVisible(false)
    } else {
      containerBonus.removeAll(true)
      containerBonus.add(gridBonuses)
      containerBonusWrapper.setVisible(true)
    }
    return world
  })
}

export function createBonusBarSyncSystem(scene) {
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

      const currentHealth = (WIDTH_ITEM / Tank.maxHealth[id]) * Tank.health[id]
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
        object.weaponImage.displayWidth = WIDTH_ITEM * progress
      }
    }

    return world
  })
}
