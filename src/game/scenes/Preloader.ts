import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import { EventBus } from '../EventBus'

export class Preloader extends Scene {
  constructor() {
    super('Preloader')
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    //this.add.image(512, 384, 'background')
    // this.cameras.main.setBackgroundColor(0x050505)
    // this.add
    //   .sprite(GameOptions.screen.width / 2 + 180, GameOptions.screen.height / 2 + 40, 'logo')
    //   .setScale(0.2)
    //   .setOrigin(0.5)
    this.add
      .sprite(GameOptions.screen.width / 2, GameOptions.screen.height / 2 - 100, 'brand')
      .setScale(0.5)
      .setTint(0xffffff)
      .setOrigin(0.5)
    // bg.
    // this.add
    //   .image(GameOptions.screen.width / 2, GameOptions.screen.height / 2, 'bg')
    //   .setTint(GameOptions.ui.panelBgColor)

    //  A simple progress bar. This is the outline of the bar.
    this.add
      .rectangle(GameOptions.screen.width / 2, GameOptions.screen.height / 2, 468, 32)
      .setStrokeStyle(1, 0xffffff)

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      GameOptions.screen.width / 2 - 230,
      GameOptions.screen.height / 2,
      4,
      28,
      0xffffff
    )

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress
    })
  }

  preload() {
    if (window && window.onSdkGameLoadingStart) {
      window.onSdkGameLoadingStart()
    }
    this.load.setPath('assets')

    this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json')

    this.load.image('logo', 'logo.png')
    // this.load.image('pricel', 'img/pricel.png')

    this.load.spritesheet('smokeBoom', 'sprite/smokeBoom.png', {
      frameWidth: 128,
      frameHeight: 128
    })
    this.load.spritesheet('building', 'sprite/building.png', {
      frameWidth: 128,
      frameHeight: 128
    })
    this.load.spritesheet('tank', 'sprite/tank.png', {
      frameWidth: 128,
      frameHeight: 85
    })
    this.load.spritesheet('tower', 'sprite/tower.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('caterpillar', 'sprite/caterpillar.png', {
      frameWidth: 128,
      frameHeight: 30
    })
    this.load.spritesheet('mapObjects', 'tiles/tileMapObjects.png', {
      frameWidth: 128,
      frameHeight: 128
    })
    // this.load.spritesheet('tank_path', 'sprite/tank_pathR.png', {
    //   frameWidth: 10,
    //   frameHeight: 128
    // })
    this.load.spritesheet({
      key: 'explosion',
      url: 'sprite/explosion.png',
      frameConfig: { frameWidth: 64, frameHeight: 64, endFrame: 23 }
    })
    this.load.spritesheet({
      key: 'effects',
      url: 'tiles/effects.png',
      frameConfig: { frameWidth: 128, frameHeight: 128 }
    })
    this.load.spritesheet({
      key: 'muzzle',
      url: 'sprite/muzzle.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'bonuses',
      url: 'sprite/bonuses.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'marker',
      url: 'sprite/marker.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'gerb',
      url: 'sprite/gerb.png',
      frameConfig: { frameWidth: 85, frameHeight: 85 }
    })
    this.load.spritesheet({
      key: 'gerb',
      url: 'sprite/gerb.png',
      frameConfig: { frameWidth: 85, frameHeight: 85 }
    })
    this.load.spritesheet({
      key: 'rank',
      url: 'sprite/rank.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'buttons',
      url: 'sprite/ui/buttons.png',
      frameConfig: { frameWidth: 236, frameHeight: 101 }
    })
    this.load.spritesheet({
      key: 'clipart',
      url: 'sprite/ui/clipart.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'weapon',
      url: 'sprite/weapon.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'sound',
      url: 'sprite/ui/sound.png',
      frameConfig: { frameWidth: 256, frameHeight: 256 }
    })

    this.load.audio('click', ['audio/click.mp3'])
    this.load.audio('boom', ['audio/vystrel-tanka-2.mp3'])
    this.load.image('bullet', 'sprite/bullet.png')

    this.load.image('smoke-puff', 'sprite/smoke-puff.png')
    this.load.image('white', 'sprite/ui/white.png')
    this.load.image('weaponPlace', 'sprite/weaponPlace.png')
    this.load.image('weaponBg', 'sprite/weaponBg.png')
    this.load.image('coin', 'sprite/ui/coin.png')
    this.load.image('shopPanel', 'sprite/ui/shopPanel.png')
    this.load.image('shopPanel2', 'sprite/ui/shopPanel2.png')
    this.load.image('bg', 'bg/bg.png')
    this.load.image('minimapBg', 'sprite/minimapBg.png')
    this.load.image('tank_path', 'sprite/tank_path.png')
    this.load.image('bonusBg', 'sprite/bonusBg.png')
    this.load.image('areol', 'sprite/areol.png')
    this.load.image('arrow', 'sprite/arrow.png')
    // this.load.image('tank_bar', 'sprite/tank_bar.png')
    // this.load.image('tank_bar_bg', 'sprite/tank_bar_bg.png')
    this.load.image('tiles', 'tiles/tiles0.png')
    this.load.tilemapTiledJSON('map', 'map0.json')

    console.log('Preload')
  }

  create() {
    this.anims.create({
      key: 'muzzle1',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 0, end: 5, first: 0 }),
      frameRate: 40,
      repeat: 0
    })
    this.anims.create({
      key: 'muzzle2',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 6, end: 11, first: 6 }),
      frameRate: 40,
      repeat: 0
    })
    this.anims.create({
      key: 'muzzle3',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 12, end: 17, first: 12 }),
      frameRate: 35,
      repeat: 0
    })
    this.anims.create({
      key: 'muzzle4',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 18, end: 23, first: 18 }),
      frameRate: 35,
      repeat: 0
    })
    this.anims.create({
      key: 'muzzle6',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 30, end: 35, first: 30 }),
      frameRate: 35,
      repeat: 0
    })
    this.anims.create({
      key: 'muzzle62',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 24, end: 29, first: 24 }),
      frameRate: 35,
      repeat: 0
    })

    this.scene.start('Message')
    // // this.scene.start('Lang')
    // this.scene.start('GameOver')
    this.scene.start('Control')
    // this.scene.start('NextLevel')
    // this.scene.start('Game')
    // this.scene.start('Help')
    this.scene.start('Bank')
    this.scene.start('WorkShop')
    this.scene.start('Home')
    // this.scene.start('Record')
    console.log('Created game!')

    // Init SDK
    if (window && window.initSDK) {
      window?.initSDK()
    }

    if (window && window.onSdkGameLoadingStop) {
      window.onSdkGameLoadingStop()
    }
  }
}
