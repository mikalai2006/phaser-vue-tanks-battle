import { Scene } from 'phaser'
import { GameOptions, SpriteKeys } from '../options/gameOptions'
import { EventBus } from '../EventBus'
import { KeyParticles, KeySound, TLang } from '../types'
import { toRaw } from 'vue'

const WIDTH_BAR = 400
const HEIGHT_BAR = 16
const OFFSET = 0
const BORDER_WIDTH = 0

export class Preloader extends Scene {
  constructor() {
    super('Preloader')
  }

  textStatus: Phaser.GameObjects.Text
  lang: TLang

  init() {
    this.lang = window.game.currentLang
    //  We loaded this image in our Boot Scene, so we can display it here
    //this.add.image(512, 384, 'background')
    // this.cameras.main.setBackgroundColor(0x050505)
    this.add
      .sprite(GameOptions.screen.width / 2, GameOptions.screen.height / 2 - 100, SpriteKeys.Logo)
      .setScale(0.5)
      .setOrigin(0.5)
    // this.add
    //   .sprite(GameOptions.screen.width / 2, GameOptions.screen.height / 2 - 100, SpriteKeys.Logo)
    //   .setScale(0.5)
    //   .setTint(0xffffff)
    //   .setOrigin(0.5)

    const bgBar = this.add
      .rectangle(
        GameOptions.screen.width / 2 - WIDTH_BAR / 2,
        GameOptions.screen.height / 2,
        WIDTH_BAR,
        HEIGHT_BAR,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color
      )
      .setStrokeStyle(BORDER_WIDTH, 0xffffff)
      .setOrigin(0)

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add
      .rectangle(
        bgBar.x + OFFSET + BORDER_WIDTH,
        bgBar.y + OFFSET + BORDER_WIDTH,
        bgBar.width - OFFSET * 2 - BORDER_WIDTH * 2,
        bgBar.height - OFFSET * 2 - BORDER_WIDTH * 2,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.buttonPrimary).color
      )
      .setOrigin(0)
    this.textStatus = this.add
      .text(
        GameOptions.screen.width / 2,
        GameOptions.screen.height / 2 + bgBar.height + 20,
        `${this.lang.loading} ...`,
        {
          fontSize: 25,
          fontFamily: 'Arial',
          color: GameOptions.colors.lightColor,
          align: 'center'
        }
      )
      .setOrigin(0.5)

    this.load.on('progress', (progress) => {
      bar.width = WIDTH_BAR - BORDER_WIDTH * 2 - OFFSET * 2 * progress
    })
  }

  preload() {
    this.textStatus.setText(`${this.lang.loadingAssets} ...`)

    if (window && window.onSdkGameLoadingStart) {
      window.onSdkGameLoadingStart()
    }

    this.load.setPath('assets')

    this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json')

    this.load.image('logo', 'logo.png')
    // this.load.image('pricel', 'img/pricel.png')

    this.load.spritesheet(KeyParticles.SmokeBoom, 'sprite/smokeBoom.png', {
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
      key: SpriteKeys.Gerb,
      url: 'sprite/gerb.png',
      frameConfig: { frameWidth: 85, frameHeight: 85 }
    })

    this.load.spritesheet({
      key: SpriteKeys.Ranks,
      url: 'sprite/rank.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'buttons',
      url: 'sprite/ui/buttons.png',
      frameConfig: { frameWidth: 236, frameHeight: 101 }
    })
    this.load.spritesheet({
      key: SpriteKeys.Clipart,
      url: 'sprite/ui/clipart.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: SpriteKeys.Weapon,
      url: 'sprite/weapon.png',
      frameConfig: { frameWidth: 64, frameHeight: 64 }
    })
    this.load.spritesheet({
      key: 'sound',
      url: 'sprite/ui/sound.png',
      frameConfig: { frameWidth: 256, frameHeight: 256 }
    })
    this.load.spritesheet({
      key: 'mobButtons',
      url: 'sprite/ui/mobButtons.png',
      frameConfig: { frameWidth: 128, frameHeight: 128 }
    })

    this.load.audio(KeySound.Click, ['audio/click.mp3'])
    this.load.audio(KeySound.Muzzle1, ['audio/muzzle1.mp3'])
    this.load.audio(KeySound.Muzzle2, ['audio/muzzle2.mp3'])
    this.load.audio(KeySound.Muzzle5, ['audio/muzzle5.mp3'])
    this.load.audio(KeySound.ExplodeBuild, ['audio/explode_build.mp3'])
    this.load.audio(KeySound.Move, ['audio/motor_run.mp3'])
    this.load.audio(KeySound.GetBonus, ['audio/get_bonus.mp3'])
    this.load.audio(KeySound.DestroyTank, ['audio/destroy_tank.mp3'])
    this.load.audio(KeySound.AddCoin, ['audio/add_coin.mp3'])
    this.load.audio(KeySound.NewRank, ['audio/new_rank.mp3'])
    this.load.audio(KeySound.CheckWeapon, ['audio/check_weapon.mp3'])
    this.load.audio(KeySound.Upgrade, ['audio/upgrade.mp3'])
    this.load.audio(KeySound.Clock, ['audio/clock.mp3'])
    this.load.audio(KeySound.CartWeapon, ['audio/cart_weapon.mp3'])
    this.load.audio(KeySound.CartTank, ['audio/cart_tank.mp3'])

    this.load.image('bullet', 'sprite/bullet.png')
    this.load.image('placeholder', 'sprite/ui/placeholder.png')
    this.load.image(KeyParticles.SmokePuff, 'sprite/smoke-puff.png')
    this.load.image('white', 'sprite/ui/white.png')
    this.load.image('weaponPlace', 'sprite/weaponPlace.png')
    this.load.image('weaponBg', 'sprite/weaponBg.png')
    this.load.image(SpriteKeys.Coin, 'sprite/ui/coin.png')
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
    this.load.tilemapTiledJSON('map1', 'map1_30x30.json')
    this.load.tilemapTiledJSON('map2', 'map2_30x30.json')
    this.load.tilemapTiledJSON('map3', 'map3_40x40.json')
    this.load.tilemapTiledJSON('map4', 'map4_40x40.json')
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
      key: 'muzzle5',
      frames: this.anims.generateFrameNumbers('muzzle', { start: 36, end: 41, first: 36 }),
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

    // Sound.
    this.sound.add(KeySound.Move, {
      loop: true,
      volume: 0
    })
    this.sound.add(KeySound.ExplodeBuild, {
      volume: 0.5
    })
    this.sound.add(KeySound.GetBonus, {
      volume: 0.2
    })
    this.sound.add(KeySound.Muzzle1, {
      volume: 1
    })
    this.sound.add(KeySound.Click, {
      volume: 1
    })
    this.sound.add(KeySound.DestroyTank, {
      volume: 0.1
    })

    this.onCreateGame()
  }

  async onCreateGame() {
    try {
      // Init player.
      if (window?.initPlayer) {
        this.textStatus.setText(`${this.lang.initPlayer} ...`)
        await window
          .initPlayer()
          .then((userData) => {
            // console.log('init player successfully')
            EventBus.emit('set-player-data', userData)
            return userData
          })
          .catch((e) => {
            throw e
          })
      }

      // Check ad blocker
      if (window.hasAdBlocker) {
        await window.hasAdBlocker().then((r) => {
          EventBus.emit('set-ad-blocker', r)
        })
      }

      // // Load player data.
      // this.textStatus.setText('Load player data ...')
      // if (window?.getPlayerData) {
      //   await window
      //     .getPlayerData()
      //     .then((data) => {
      //       EventBus.emit('set-player-data', data)
      //       return data
      //     })
      //     .catch((e) => {
      //       throw e
      //     })
      // } else {
      //   EventBus.emit('set-player-data', null)
      // }

      // Load game data.
      if (window?.loadGameData) {
        this.textStatus.setText(`${this.lang.loadingData} ...`)
        await window
          .loadGameData()
          .then((data) => {
            EventBus.emit('set-data', data)
            // console.log('set data: ', data)
            return data
          })
          .catch((e) => {
            throw e
          })
      } else {
        EventBus.emit('set-data', null)
      }

      // Init leaderboard.
      if (GameOptions.isLeaderBoard) {
        this.textStatus.setText(`${this.lang.loadingLB} ...`)
        if (window?.initLB) {
          await window
            .initLB()
            .then((r) => {
              // console.log('initLB: ', r)
            })
            .catch((e) => {
              throw e
            })
        }
      }

      // Load scenes.
      const data = {
        lang: toRaw(window.game.currentLang),
        gameData: toRaw(window.game.gameData),
        playerData: toRaw(window.game.playerData)
      }
      this.textStatus.setText(`${this.lang.loadingScenes} ...`)
      this.scene.start('Message', data)
      this.scene.start('Control', data)
      this.scene.start('Bank', data)
      this.scene.start('WorkShop', data)
      this.scene.start('Home', data)

      if (window && window.onSdkGameLoadingStop) {
        window.onSdkGameLoadingStop()
      }
    } catch (e) {
      console.error('Error init game: ', e)
    }
  }
}
