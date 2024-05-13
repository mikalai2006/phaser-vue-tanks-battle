import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import { Weapon } from '../components/Weapon'
import { Tank } from '../components/Tank'
import { WeaponType } from '../options/gameOptions'
import { Player } from '../components/Player'

export default function createPlayerWeaponSystem(scene: Phaser.Scene) {
  const query = defineQuery([Player])
  const queryWeapons = defineQuery([Weapon])

  return defineSystem((world) => {
    const entities = query(world)
    const weapons = queryWeapons(world)

    for (const id of entities) {
      const weaponsIds = weapons.filter((x) => Weapon.entityId[x] == id)

      if (weaponsIds.length > 0) {
        Tank.activeWeaponType[id] = Weapon.type[weaponsIds[weaponsIds.length - 1]]
      } else {
        Tank.activeWeaponType[id] = WeaponType.default
      }
    }

    return world
  })
}
