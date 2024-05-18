import Phaser from 'phaser'
import {
  defineSystem,
  defineQuery,
  enterQuery,
  addComponent,
  exitQuery,
  removeEntity
} from 'bitecs'
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
  const containerBonus = scene.add.container(10, 25, [])
  // const border = scene.add.rectangle(0, 0, 120, 500, 0x000000, 0.5).setOrigin(0)

  const text = scene.add.text(10, 0, scene.lang.bonusBar, {
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 20,
    color: GameOptions.colors.lightColor,
    stroke: '#000000',
    strokeThickness: 2,
    align: 'left'
  })
  const containerBonusWrapper = scene.add
    .container(GameOptions.marginMarker * 2, GameOptions.marginMarker * 1.8 + 100, [
      text,
      containerBonus
    ])
    .setDepth(999999)
    .setVisible(false)
    .setScrollFactor(0)

  const query = defineQuery([Bonus])

  return defineSystem((world) => {
    const dt = scene.game.loop.delta

    const entities = query(world)

    const playerBonuses = entities.filter((x) => Bonus.entityId[x] === scene.idFollower)

    containerBonus.removeAll(true)

    if (!playerBonuses.length) {
      containerBonusWrapper.setVisible(false)
      return
    }

    containerBonusWrapper.setVisible(true)

    const items = []
    for (const id of playerBonuses) {
      const keyBonus = Object.keys(BonusType).find((key) => BonusType[key] === Bonus.type[id])

      const value = Bonus.value[id]

      const textNameBonus = scene.add
        .text(50, 5, scene.lang.options[keyBonus], {
          fontFamily: 'Arial',
          fontSize: 18,
          color: GameOptions.colors.lightColor,
          align: 'left'
        })
        .setOrigin(0)
      const progressBg = scene.add
        .rectangle(
          50,
          HEIGHT_ITEM - 20,
          WIDTH_ITEM - WIDTH_ITEM / 2,
          10,
          Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColorLight).color
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
        (Phaser.Math.Clamp(value, -Tank[keyMax][scene.idFollower], maxUpdateValue) * 100) /
        maximumOptionValue

      if (value == 0) {
        removeEntity(world, id)
      }

      const currentMaxValue = (Tank[keyMax][scene.idFollower] * 100) / maximumOptionValue
      const actualValue = currentMaxValue * (WIDTH_ITEM - WIDTH_ITEM / 2) * 0.01
      const currentActualProgress = scene.add
        .rectangle(50, HEIGHT_ITEM - 20, actualValue, 10, GameOptions.workshop.colorValueProgress)
        .setOrigin(0)
      const bonusProgressWidth = bonusValueProgress * (WIDTH_ITEM - WIDTH_ITEM / 2) * 0.01
      const bonusProgress =
        bonusProgressWidth >= 0
          ? scene.add
              .rectangle(
                actualValue + 52,
                HEIGHT_ITEM - 20,
                bonusProgressWidth,
                10,
                GameOptions.workshop.colorHighProgress
              )
              .setOrigin(0)
          : scene.add
              .rectangle(
                actualValue + 50,
                HEIGHT_ITEM - 10,
                Math.abs(bonusProgressWidth),
                10,
                GameOptions.workshop.colorLowProgress
              )
              .setOrigin(1)
      const text = scene.add
        .text(
          WIDTH_ITEM - 10,
          HEIGHT_ITEM - 5,
          Math.round(maxUpdateValue) == 0 && bonusProgressWidth >= 0
            ? 'MAX'
            : (bonusProgressWidth < 0 ? '' : '+') + bonusValueProgress.toFixed(1) + '%',
          {
            fontFamily: 'Arial',
            fontSize: 20,
            fontStyle: 'bold',
            color:
              Math.round(bonusValueProgress) == 0
                ? GameOptions.colors.success
                : GameOptions.colors.accent,
            align: 'center'
          }
        )
        .setOrigin(1)
      const bonusConfig = GameOptions.bonuses.find((x) => x.type === Bonus.type[id])
      const bg = scene.add.rectangle(0, 0, WIDTH_ITEM, HEIGHT_ITEM, 0x000000, 0.6).setOrigin(0)
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

      if (Bonus.duration[id] > 0) {
        Bonus.duration[id] -= dt
        const bonusConfig = GameOptions.bonuses.find((x) => x.type === Bonus.type[id])
        const valueProgress =
          ((Bonus.duration[id] * 100) / bonusConfig.duration) * WIDTH_ITEM * 0.01
        const durationProgress = scene.add
          .rectangle(0, 0, valueProgress, HEIGHT_ITEM, GameOptions.workshop.colorLowProgress, 0.3)
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
    containerBonus.add(gridBonuses)

    return world
  })
}
