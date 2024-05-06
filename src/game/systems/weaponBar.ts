import Phaser from 'phaser'

import { defineSystem, defineQuery } from 'bitecs'

import { Weapon } from '../components/Weapon'
import { GameOptions, WeaponType } from '../options/gameOptions'
import { Player } from '../components/Player'
import { groupBy } from 'lodash'
import { Tank } from '../components/Tank'
import { replaceRegexByArray } from '../utils/utils'

const WIDTH_CELL = 120
const HEIGHT_CELL = 100

export function createWeaponBarSystem(scene: Phaser.Scene) {
  const query = defineQuery([Weapon])
  // const queryPlayer = defineQuery([Player])

  const arrayKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']

  const buttons = new Map<
    number,
    {
      container: Phaser.GameObjects.Container
      button: Phaser.GameObjects.Rectangle
      text: Phaser.GameObjects.Text
    }
  >()
  const weaponsBar = scene.add
    .container(GameOptions.screen.width - WIDTH_CELL, 300, [])
    .setDepth(999999)
    .setScrollFactor(0)

  const cells = []
  for (let i = 0; i < GameOptions.weaponObjects.length; i++) {
    const weapon = GameOptions.weaponObjects[i]
    const text = scene.add
      .text(25, 0, '-', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 25,
        color: GameOptions.ui.buttonTextColor,
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      })
      .setOrigin(0.5)
    const button = scene.add
      .rectangle(0, 0, WIDTH_CELL, HEIGHT_CELL, 0x000000, 0.7)
      .setInteractive({ useHandCursor: true })
      .setDepth(99999)
      .setScrollFactor(0)
    const funcCallback = () => {
      const keyWeapon = Object.keys(WeaponType).find((key) => WeaponType[key] === weapon.type)
      if (Number(text.text) <= 0) {
        // scene.showToast(
        //   replaceRegexByArray(scene.lang.noneWeapon, [scene.lang.weapons[keyWeapon]]),
        //   GameOptions.workshop.colorLowProgress
        // )
      } else {
        Tank.activeWeaponType[scene.idFollower] = weapon.type
        scene.showToast(
          replaceRegexByArray(scene.lang.activeWeapon, [scene.lang.weapons[keyWeapon]]),
          GameOptions.ui.panelBgColor
        )
      }
    }
    button.on('pointerup', funcCallback)
    var keyboardKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[arrayKeys[i]])
    keyboardKey.on('up', funcCallback)
    // new Button(scene, 0, 0, WIDTH_CELL, HEIGHT_CELL, 0x000000, '', {}, () => {
    //   console.log('Check ', weapon.type)
    // }).setDepth(99999)
    const image = scene.add.image(0, 0, weapon.texture, weapon.frame).setOrigin(0.5)
    const container = scene.add.container(0, 0, [button, image, text]).setAlpha(i == 0 ? 1 : 0.5)
    cells.push(container)
    // if (i != 0) {
    buttons.set(weapon.type, { container, button, text })
    // }
  }
  const gridWeapons = Phaser.Actions.GridAlign(cells, {
    width: 1,
    height: 10,
    cellWidth: WIDTH_CELL,
    cellHeight: HEIGHT_CELL,
    x: 0,
    y: 0
  })
  weaponsBar.add(gridWeapons)

  return defineSystem((world) => {
    const entities = query(world)
    // const players = queryPlayer(world)

    // weaponsBar.removeAll(true)
    const idPlayer = scene.idFollower

    // for (const idPlayer of players) {
    const entitiesPlayer = entities.filter((x) => Weapon.entityId[x] == idPlayer)

    const groupWeapons = groupBy(entitiesPlayer, (v) => Weapon.type[v])

    // const cells = []
    // for (const weaponKey in groupWeapons) {
    //   // const idFirst = groupWeapons[weaponKey][0]
    //   // const keyWeapon = Object.keys(WeaponType).find((key) => WeaponType[key] === Weapon.type[idFirst])
    //   const weapon = GameOptions.weaponObjects.find((x) => x.type.toString() == weaponKey)
    //   const weaponCount = groupWeapons[weaponKey].reduce((ac, el) => {
    //     const value = ac + Weapon.count[el]
    //     return value
    //   }, 0)
    //   const button = new Button(scene, 0, 0, WIDTH_CELL, HEIGHT_CELL, 0xff0000, '', {}, () => {
    //     console.log('Check ', weapon.type)
    //   }).setDepth(99999)
    //   const countText = scene.add.text(WIDTH_CELL - 15, 0, weaponCount.toString(), {
    //     fontFamily: 'Arial',
    //     fontStyle: 'bold',
    //     fontSize: 25,
    //     color: GameOptions.ui.buttonTextColor,
    //     stroke: '#000000',
    //     strokeThickness: 3,
    //     align: 'center'
    //   })
    //   const image = scene.add.image(0, 0, weapon.texture, weapon.frame)

    //   const container = scene.add.container(0, 0, [button, image, countText]) //.setAlpha(i == 0 ? 1 : 0.5)
    //   cells.push(container)
    //   // if (i != 0) {
    //   //   buttons.set(weapon.type, container)
    //   // }
    // }
    // const gridWeapons = Phaser.Actions.GridAlign(cells, {
    //   width: 10,
    //   height: 1,
    //   cellWidth: WIDTH_CELL,
    //   cellHeight: HEIGHT_CELL,
    //   x: -(WIDTH_CELL * GameOptions.weaponObjects.length) / 3,
    //   y: 0
    // })

    // weaponsBar.add(gridWeapons)

    const typeActiveWeapon = Tank.activeWeaponType[idPlayer]

    buttons.forEach((value, key, map) => {
      const button = buttons.get(key)
      if (groupWeapons[key]) {
        const weaponCount = groupWeapons[key].reduce((ac, el) => {
          const value = ac + Weapon.count[el]
          return value
        }, 0)
        button.container.setAlpha(1)
        // button.container.setVisible(true)
        button.text.setText(key == WeaponType.default ? '--' : weaponCount.toString())
      } else {
        if (key != WeaponType.default) {
          button.container.setAlpha(0.5)
          // button.container.setVisible(false)
        }
        button.text.setText(key == WeaponType.default ? '--' : '0')
      }
      if (typeActiveWeapon == key) {
        button.button.fillColor = GameOptions.ui.accent.replace('#', '0x')
        button.container.setAlpha(1)
      } else {
        button.button.fillColor = 0x000000
      }
    })
    // }

    // const exitEntities = onQueryExit(world)
    // for (const id of exitEntities) {
    // }

    return world
  })
}
