import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import AI from '../components/AI'
import { Weapon } from '../components/Weapon'
import { Tank } from '../components/Tank'
import { GameOptions, WeaponType } from '../options/gameOptions'
import { getSupportWeapons } from '../utils/utils'

export default function createAIWeaponSystem(scene: Phaser.Scene) {
  const query = defineQuery([AI])
  const queryWeapons = defineQuery([Weapon])

  return defineSystem((world) => {
    const entities = query(world)
    const weapons = queryWeapons(world)

    for (const id of entities) {
      const tankConfig = GameOptions.complexTanks[Tank.index[id]]
      const supportWeapons = getSupportWeapons(tankConfig.id).map((x) => x.type)
      const weaponsIds = weapons
        .filter((x) => Weapon.entityId[x] == id && supportWeapons.includes(Weapon.type[x]))
        .sort((a, b) => +a - b)

      if (weaponsIds.length > 0) {
        Tank.activeWeaponType[id] = Weapon.type[weaponsIds[weaponsIds.length - 1]]
        // console.log(weaponsIds, Tank.activeWeaponType[id])
      } else {
        Tank.activeWeaponType[id] = WeaponType.default
      }
    }

    return world
  })
}
