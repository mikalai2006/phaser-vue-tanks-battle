import Phaser from 'phaser'
import { defineSystem, defineQuery } from 'bitecs'

import Velocity from '../components/Velocity'
import Rotation from '../components/Rotation'
import { Player } from '../components/Player'
import Input from '../components/Input'

export default function createInputSystem(
  scene: Phaser.Scene
  // cursors:
  //   | Phaser.Types.Input.Keyboard.CursorKeys
  //   | {
  //       up: Phaser.Input.Keyboard.Key
  //       down: Phaser.Input.Keyboard.Key
  //       left: Phaser.Input.Keyboard.Key
  //       right: Phaser.Input.Keyboard.Key
  //       space: Phaser.Input.Keyboard.Key
  //     }
) {
  const playerQuery = defineQuery([Player, Velocity, Rotation, Input])

  return defineSystem((world) => {
    const entities = playerQuery(world)

    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i]
      // set the left, right, up, down values
      Input.left[id] = scene.keys.a.isDown || scene.cursors.left.isDown ? 1 : 0
      Input.right[id] = scene.keys.d.isDown || scene.cursors.right.isDown ? 1 : 0
      Input.down[id] = scene.keys.s.isDown || scene.cursors.down.isDown ? 1 : 0
      Input.up[id] = scene.keys.w.isDown || scene.cursors.up.isDown ? 1 : 0
      Input.fire[id] = scene.cursors.space && scene.cursors.space.isDown ? 1 : 0
      //   if (cursors.left.isDown) {
      //     Input.direction[id] = Direction.Left
      //   } else if (cursors.right.isDown) {
      //     Input.direction[id] = Direction.Right
      //   } else if (cursors.up.isDown) {
      //     Input.direction[id] = Direction.Up
      //   } else if (cursors.down.isDown) {
      //     Input.direction[id] = Direction.Down
      //   } else {
      //     Input.direction[id] = Direction.None
      //   }
    }

    return world
  })
}
