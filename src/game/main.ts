import { Boot } from './scenes/Boot'
// import Game from './scenes/Game'
import Phaser from 'phaser'
import { Preloader } from './scenes/Preloader'
import { GameOptions } from './options/gameOptions'
import { Home } from './scenes/Home'
import { WorkShop } from './scenes/WorkShop'

import ToggleSwitchPlugin from 'phaser3-rex-plugins/plugins/toggleswitch-plugin.js'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'
import SliderPlugin from 'phaser3-rex-plugins/plugins/slider-plugin.js'

import { Message } from './scenes/Message'
import { Bank } from './scenes/Bank'
import { Control } from './scenes/Control'

// object to initialize the Scale Manager
const scaleObject: Phaser.Types.Core.ScaleConfig = {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  parent: 'game-container',
  width: GameOptions.screen.width,
  height: GameOptions.screen.height
}

// game configuration object
const configObject: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: GameOptions.ui.panelBgColor,
  scale: scaleObject,
  scene: [
    Boot,
    Preloader,
    // Game,
    Home,
    Bank,
    WorkShop,
    Control,
    Message
    // NextLevel,  GameOver, Help
  ],
  fps: {
    forceSetTimeOut: false
    // limit: 30
    // target: 30 // 30x per second
  },
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     gravity: { y: 0 },
  //     debug: true
  //   }
  // },
  physics: {
    default: 'matter',
    matter: {
      // enableSleeping: true,
      gravity: {
        y: 0
      },
      debug: true
      // {
      //   showBody: true,
      //   showStaticBody: true
      // }
    }
  },
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI'
      }
      // ...
    ],
    global: [
      {
        key: 'rexSlider',
        plugin: SliderPlugin,
        start: true
      },
      {
        key: 'rexToggleSwitchPlugin',
        plugin: ToggleSwitchPlugin,
        start: true
      }
    ]
  }
  // plugins: {
  //   global: [
  //     {
  //       key: 'rexVirtualJoystick',
  //       plugin: VirtualJoystickPlugin,
  //       start: true
  //     }
  //   ]
  // }

  // audio: {
  //   disableWebAudio: true
  // },
  // fx: {
  //   glow: {
  //     distance: 32,
  //     quality: 0.1
  //   }
  // }
}

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
// const config = {
//     type: Phaser.AUTO,
//     width: 1024,
//     height: 768,
//     parent: 'game-container',
//     backgroundColor: '#028af8',
//     scene: [
//         Boot,
//         Preloader,
//         MainMenu,
//         Game,
//         GameOver
//     ]
// };

const StartGame = (parent) => {
  return new Phaser.Game({ ...configObject, parent: parent })
}

export default StartGame
