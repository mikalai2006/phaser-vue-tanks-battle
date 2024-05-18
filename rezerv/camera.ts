import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'
import { tanksById } from './matter'
import { GameOptions } from '../options/gameOptions'
import { Tank } from '../components/Tank'
import { Player } from '../components/Player'

export function createCameraSystem(scene: Phaser.Scene) {
  const query = defineQuery([Tank])
  const queryPlayers = defineQuery([Player])
  return defineSystem((world) => {
    const entities = query(world)
    const players = queryPlayers(world)

    const idFollower = scene.idFollower

    const follower = tanksById.get(idFollower)
    if (follower) {
      //scene.cameras.main.startFollow(follower.tank)
      scene.cameras.main.scrollX = follower.body.position.x - GameOptions.screen.width / 2
      scene.cameras.main.scrollY = follower.body.position.y - GameOptions.screen.height / 2
      // if (scene.hasOwnProperty('minimap')) {
      //   scene.minimap.scrollX = Phaser.Math.Clamp(follower.x, 1300, 5100)
      //   scene.minimap.scrollY = Phaser.Math.Clamp(follower.y, 1300, 5100)
      // }
      // console.log(follower.body.position)
    }

    // for (const id of entities) {
    // }

    return world
  })
}
