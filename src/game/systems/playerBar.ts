import Phaser from 'phaser'
import { defineSystem, defineQuery, enterQuery, exitQuery } from 'bitecs'
import { Tank } from '../components/Tank'
import Position from '../components/Position'
import { Entity } from '../components/Entity'
import { GameOptions, SpriteKeys } from '../options/gameOptions'
import { towersById } from './matter'
import { Player } from '../components/Player'

const WIDTH_BAR = 400
const HEIGHT_BAR = 110
const WIDTH_PROGRESS = 220
const HEIGHT_PROGRESS = 20

export const playerBarById = new Map<
  number,
  {
    bar: Phaser.GameObjects.Container
    healthImageBg: Phaser.GameObjects.Rectangle
    weaponImageBg: Phaser.GameObjects.Rectangle
    healthImage: Phaser.GameObjects.Rectangle
    weaponImage: Phaser.GameObjects.Rectangle
    bg: Phaser.GameObjects.Rectangle
    // imageBrandBg: Phaser.GameObjects.Arc
    imageGerb: Phaser.GameObjects.Image
    imageRank: Phaser.GameObjects.Image
    // imgMaskHealth: Phaser.GameObjects.Image
    // imgMaskWeapon: Phaser.GameObjects.Image
    textName: Phaser.GameObjects.Text
    textCoin: Phaser.GameObjects.Text
  }
>()

export function createPlayerBarSystem(scene: Phaser.Scene) {
  const bg = scene.add
    .rectangle(0, -HEIGHT_BAR / 2, WIDTH_BAR, HEIGHT_BAR, 0xffffff)
    .setOrigin(0, 0)
  const bg2 = scene.add
    .rectangle(0, -HEIGHT_BAR / 2 + 5, WIDTH_BAR, HEIGHT_BAR - 10, 0x000000, 0.8)
    .setOrigin(0, 0)
  // const imageBrandBg = scene.add.circle(50, 0, 50, 0x000000, 0.5)
  const imageGerb = scene.add.image(50, 3, SpriteKeys.Gerb, 0).setTint(0xffffff).setScale(1)

  const imageRank = scene.add
    .image(WIDTH_BAR - 80, -20, SpriteKeys.Ranks, 3)
    .setTint(0xffffff)
    .setOrigin(0)
    .setScale(1)
  const textName = scene.add.text(100, -45, '', {
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 20,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
    align: 'left'
  })
  const healthImage = scene.add
    .rectangle(100, -15, WIDTH_PROGRESS, HEIGHT_PROGRESS, GameOptions.colors.health)
    .setOrigin(0)
  const healthImageBg = scene.add
    .rectangle(100, -15, WIDTH_PROGRESS, HEIGHT_PROGRESS, 0x444444)
    .setOrigin(0, 0)
  const weaponImage = scene.add
    .rectangle(
      100,
      healthImage.y + HEIGHT_PROGRESS * 2 - 5,
      WIDTH_PROGRESS,
      HEIGHT_PROGRESS,
      0xf59e0b
    )
    .setOrigin(0, 0.5)
  const weaponImageBg = scene.add
    .rectangle(
      100,
      healthImage.y + HEIGHT_PROGRESS * 2 - 5,
      WIDTH_PROGRESS,
      HEIGHT_PROGRESS,
      0x444444
    )
    .setOrigin(0, 0.5)
  const coinImage = scene.add.image(670, 0, SpriteKeys.Clipart, 3).setScale(1)
  const textCoin = scene.add.text(coinImage.x + 40, -20, '234234234', {
    fontFamily: 'Arial',
    fontStyle: 'bold',
    fontSize: 40,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
    align: 'left'
  })
  const bar = scene.add
    .container(GameOptions.screen.width / 2 - WIDTH_BAR / 2, GameOptions.marginMarker * 2 + 50, [
      bg,
      bg2,
      textName,
      coinImage,
      textCoin,
      // imageBrandBg,
      imageGerb,
      healthImageBg,
      healthImage,
      weaponImageBg,
      weaponImage,
      imageRank
    ])
    .setDepth(999999)
    .setScrollFactor(0)
  scene.minimap?.ignore(bar)

  playerBarById.set(0, {
    bg,
    textName,
    imageGerb,
    bar,
    healthImage,
    textCoin,
    healthImageBg,
    weaponImage,
    weaponImageBg,
    imageRank
    // imageBrandBg
    // imgMaskHealth,
    // imgMaskWeapon
  })

  const query = defineQuery([Position, Tank])
  const onQueryEnter = enterQuery(query)
  const onQueryExit = exitQuery(query)
  return defineSystem((world) => {
    const enterEntities = onQueryEnter(world)

    return world
  })
}

export function createPlayerBarSyncSystem(scene) {
  const query = defineQuery([Player])

  return defineSystem((world) => {
    const entities = query(world)
    const id = scene.idFollower

    const colorTeam =
      Entity.teamIndex[id] >= GameOptions.configTeams.length
        ? GameOptions.configTeams[1].color
        : GameOptions.configTeams[Entity.teamIndex[id]].color

    const object = playerBarById.get(0)

    // if (!entities.length) {
    //   object.bar.removeAll(true)
    //   playerBarById.delete(0)
    //   // console.log('Remove player Bar', playerBarById.size)
    //   return
    // }

    const currentHealth = (WIDTH_PROGRESS / Tank.maxHealth[id]) * Tank.health[id]

    object.healthImage.displayWidth = currentHealth
    object.bg.setFillStyle(colorTeam, 1)
    // object.imageBrandBg.setFillStyle(GameOptions.configTeams[Entity.teamIndex[id]].color, 1)
    object.imageGerb.setTexture(SpriteKeys.Gerb, Entity.gerbId[id])
    scene.names.get(id) && object.textName.setText(scene.names.get(id))
    object.imageRank.setFrame(Entity.rank[id])
    object.textCoin.setText(Entity.roundCoin[id].toString())

    const tower = towersById.get(id)
    if (tower?.weaponRefreshEvent) {
      const progress = tower.weaponRefreshEvent.getProgress()
      if (progress < 1) {
        Entity.weapon[id] = 0
      } else if (progress == 1) {
        Entity.weapon[id] = 1
      }
      object.weaponImage.displayWidth = WIDTH_PROGRESS * progress
    }

    return world
  })
}
