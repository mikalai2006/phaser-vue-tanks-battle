import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import Planck from 'planck'
import { getRandomInt, toMeters, toPixels } from '../utils/planckUtils'
import _ from 'lodash'

import { createWorld, addEntity, addComponent, defineComponent, Types, IWorld } from 'bitecs'

const Position = defineComponent({
  x: Types.f32,
  y: Types.f32
})
const Sprite = defineComponent({
  texture: Types.ui8
})

import { IGameData, TLang } from '@/App.vue'
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick'
import { Bullet } from '../objects/Bullet'

var defaultCategory = 0x0001,
  twoCategory = 0x0002

enum gameState {
  IDLE,
  MOVING,
  BOMBING,
  MOVEBOMB,
  ROTATION,
  GAMEOVER
}

// Turning speed in deg/s.
// At 60 steps/s, this is 1.5 deg/step.
const ROTATION_SPEED = 2

// The angle tolerance in degrees.
const TOLERANCE = 3

export default class Game extends Scene {
  constructor() {
    super({
      key: 'Game'
    })
  }

  world: IWorld

  lang: TLang
  gameData: IGameData

  joystikMove: VirtualJoyStick
  cursorKeysMove: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }

  joystikRotateTower: VirtualJoyStick
  cursorKeysRotateTower: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }
  testText: Phaser.GameObjects.Text

  bullets: Bullet[] = []

  cursors: Phaser.Types.Input.Keyboard.CursorKeys

  cursorObject: Phaser.GameObjects.Sprite
  tank: Phaser.GameObjects.Container
  tankTower: Phaser.GameObjects.Container

  player: Phaser.GameObjects.GameObject
  playerTower: Phaser.GameObjects.GameObject
  map: Phaser.Tilemaps.Tilemap

  groundTilesLayer: Phaser.Tilemaps.TilemapLayer

  // gameOverBody: Planck.Body[] = []
  // debounceFunction: (contact: any) => {}

  // world: Planck.World // physics world
  // contactManagement: any[] // array to store all contacts
  // config: any // configuration object
  // ballsAdded: number // amount of balls added
  // currentBallValue: number // current ball value
  // score: number // score
  // nextBallValue: number // next ball value
  // ids: number[] // array with all ball ids
  // emitters: Phaser.GameObjects.Particles.ParticleEmitter[] // array with all particle emitters
  // dummyBalls: Phaser.GameObjects.Container[] // array with all dummy balls
  // nextBallValueSprites: Phaser.GameObjects.Container[] // array with all sprites showing 'next' ball
  // currentState: gameState // current game state
  // scoreText: Phaser.GameObjects.Text
  // currentScoreText: Phaser.GameObjects.Text
  // objectPool: any[] // object pool

  // progressScore: Phaser.GameObjects.Rectangle
  // progressBarNewBall: Phaser.GameObjects.Rectangle
  // progressNewBallContainer: Phaser.GameObjects.Container
  // triggerTimerNewBall: Phaser.Time.TimerEvent
  // rectGameArea: Phaser.GameObjects.Rectangle
  // rectGameAreaForEvent: Phaser.GameObjects.Rectangle
  // textPool: any[] = []
  // textEffectPool: any[] = []
  // newBallPath: Phaser.GameObjects.Graphics = null
  // graphics: Phaser.GameObjects.Graphics = null
  // newBallPathLine: Phaser.Geom.Line = null
  // newBallNormalLine: Phaser.Geom.Line = null
  // configTimerNewBall: Phaser.Types.Time.TimerEventConfig
  // maxTimeWait: number
  // levelText: Phaser.GameObjects.Text
  // jobText: Phaser.GameObjects.Text
  // jobContainer: Phaser.GameObjects.Container
  // tweenProgressScore: Phaser.Tweens.Tween
  // shipContainer: Phaser.GameObjects.Container
  // ship: Phaser.GameObjects.Sprite
  // shipFace: Phaser.GameObjects.Sprite
  // shipFaceBg: Phaser.GameObjects.Sprite
  // rotator: Phaser.GameObjects.Container
  // buttonRotate: Phaser.GameObjects.Container
  // polygon2D: Planck.Body

  // bomb: Phaser.GameObjects.Particles.ParticleEmitter
  // bombCircle: Planck.CircleShape
  // buttonBombBg: Phaser.GameObjects.NineSlice
  // buttonBombContainer: Phaser.GameObjects.Container
  // buttonBombCounterContainer: Phaser.GameObjects.Container
  // buttonBombCounterText: Phaser.GameObjects.Text

  // lastDateDestroyLastBall: Date
  // countSeriaDestroy: number = 0
  // // lastDateAddBomb: Date
  // // diffTimeAddBomb: number
  // diffTimeDestroyLastBall: number

  // floor: Planck.Body
  // floorY: number
  // triggerChangeFloor: Phaser.Time.TimerEvent
  // configTimerFloor: Phaser.Types.Time.TimerEventConfig

  // configJob: { job: [number, number]; position: { x: number; y: number } }[]
  // // bombTest: Phaser.GameObjects.Arc

  // // progressRotation: Phaser.GameObjects.Rectangle
  // // progressRotation: Phaser.GameObjects.Rectangle

  // baseStartX: number
  // baseStartY: number
  // baseEndY: number
  // baseEndX: number

  // audio_ball_start:
  //   | Phaser.Sound.HTML5AudioSound
  //   | Phaser.Sound.NoAudioSound
  //   | Phaser.Sound.WebAudioSound
  // audio_ball_destroy:
  //   | Phaser.Sound.HTML5AudioSound
  //   | Phaser.Sound.NoAudioSound
  //   | Phaser.Sound.WebAudioSound
  // gojob: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  // click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  // fire: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  // method to be called once the instance has been created
  create(): void {
    this.matter.world.disableGravity()

    this.testText = this.add
      .text(50, 50, 'qweqwe', {
        fontSize: 25,
        color: 'black',
        align: 'left'
      })
      .setOrigin(0, 0.5)
      .setDepth(99999)

    this.world = createWorld()

    for (let i = 0; i < 64; i++) {
      const bullet = new Bullet(this.matter.world, 0, 0, 'bullet', GameOptions.wrapBounds)

      bullet.setScale(2).setCollisionCategory(defaultCategory)
      // bullet.setCollidesWith([ this.enemiesCollisionCategory, this.asteroidsCollisionCategory ]);
      // bullet.setOnCollide(this.bulletVsEnemy);

      this.bullets.push(bullet)
    }

    const baseGameObject = this.add.circle(0, 0, 200, 0xffffff, 0.3)
    const thumbGameObject = this.add.circle(0, 0, 100, 0xffffff, 1)
    this.joystikMove = new VirtualJoyStick(this, {
      x: 200,
      y: GameOptions.screen.height - 150,
      radius: 200,
      base: baseGameObject,
      thumb: thumbGameObject,
      // dir: '8dir',
      // forceMin: 16,w
      fixed: true,
      enable: true
    })
    this.cursorKeysMove = this.joystikMove.createCursorKeys()

    const baseGameObjectRotateTower = this.add.circle(0, 0, 200, 0xffffff, 0.3)
    const thumbGameObjectRotateTower = this.add.circle(0, 0, 100, 0xffffff, 1)
    this.joystikRotateTower = new VirtualJoyStick(this, {
      x: GameOptions.screen.width - 200,
      y: GameOptions.screen.height - 150,
      radius: 200,
      base: baseGameObjectRotateTower,
      thumb: thumbGameObjectRotateTower,
      // dir: '8dir',
      // forceMin: 16,
      fixed: true,
      enable: true
    })
    this.cursorKeysRotateTower = this.joystikRotateTower.createCursorKeys()

    // const tank = this.add.sprite(0, 0, 'tank')
    // this.tank = this.add.container(500, 500, [tank])
    this.map = this.make.tilemap({ key: 'map' })

    const groundTiles = this.map.addTilesetImage('tiles', 'tiles', 128, 128)
    this.groundTilesLayer = this.map.createLayer('Level1', groundTiles).setDepth(-1)
    // this.groundTilesLayer.setCollision([41, 42, 43, 44, 45, 46])

    const tank = this.add.sprite(0, 0, 'tank', 0)
    this.tank = this.add.container(0, 0, [tank]).setRotation(Math.PI / 2)
    // .setScale(0.5)
    // this.matter.add.collider(this.player, this.groundTilesLayer)
    const container = this.add.container(500, 500, [this.tank])
    container.setSize(128, 101).setScale(0.5)
    this.player = this.matter.add.gameObject(container, {
      friction: 0,
      // parts: [this.playerTower],
      frictionAir: 0.2,
      density: 10,
      collisionFilter: {
        category: twoCategory
      }
    })

    const tank_tower = this.add.sprite(0, -20, 'tank_tower', 0)
    this.tankTower = this.add.container(0, 0, [tank_tower]).setRotation(Math.PI / 2)
    const containerTower = this.add.container(500, 500, [this.tankTower])
    containerTower.setSize(120, 30).setScale(0.5)
    this.playerTower = this.matter.add.gameObject(containerTower, {
      friction: 0,
      frictionAir: 0.2,
      density: 10,

      collisionFilter: {
        mask: defaultCategory
      }
    })
    this.matter.body.setCentre(this.playerTower.body, { x: -30, y: 0 }, true)
    this.matter.add.constraint(this.player, this.playerTower, 0, 0)

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.cameras.main.startFollow(this.player)

    this.cursors = this.input.keyboard.createCursorKeys()

    const blockB = this.matter.add.sprite(700, 300, 'mapObjects', 2, {
      isStatic: true,
      frictionStatic: 1
    })
    const blockBV = this.matter.add.sprite(700, 500, 'mapObjects', 3, {
      friction: 1,
      density: 10,
      frictionAir: 0.2
    })

    // this.input.keyboard.on('keyup-W', () => this.onGoForward())
    // this.input.keyboard.on('keyup-S', () => this.onGoBack())
    this.cursorObject = this.add.sprite(0, 0, 'pricel')
    this.input.on('pointermove', (pointer) => {
      this.cursorObject.x = this.input.activePointer.worldX
      this.cursorObject.y = this.input.activePointer.worldY
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      const bullet = this.bullets.find((bullet) => !bullet.active)
      const { x, y } = this.playerTower.body.position
      const x2 = x + Math.cos(this.playerTower.body.angle) * 100
      const y2 = y + Math.sin(this.playerTower.body.angle) * 100
      console.log(x2, y2)

      if (bullet) {
        bullet.fire(x2, y2, this.playerTower.rotation, 5)
      }
    })

    // EventBus.emit('start-game', null)
    EventBus.emit('current-scene-ready', this)
  }

  drawTestText() {
    this.testText.setText(`rotate: ${this.player.rotation}`)
  }

  update(time, delta) {
    this.drawTestText()
    //this.player.setVelocity(0)

    const isUp = !!this.cursors.up.isDown || !!this.cursorKeysMove.up.isDown
    const isDown = !!this.cursors.down.isDown || !!this.cursorKeysMove.down.isDown
    const isLeft = !!this.cursors.left.isDown || !!this.cursorKeysMove.left.isDown
    const isRight = !!this.cursors.right.isDown || !!this.cursorKeysMove.right.isDown
    const isMoving = isDown || isUp

    if (isMoving) {
      const moveDir = isUp ? 1 : -1

      let angle = this.player.angle
      if (isLeft) {
        angle -= 1 * moveDir
      } else if (isRight) {
        angle += 1 * moveDir
      }

      this.player.angle = angle

      const rotation = Phaser.Math.DegToRad(angle)
      const vec = new Phaser.Math.Vector2()
      vec.setToPolar(rotation, 1)

      this.player.setVelocityX(vec.x * 5 * moveDir)
      this.player.setVelocityY(vec.y * 5 * moveDir)
      this.playerTower.setVelocityX(vec.x * 5 * moveDir)
      this.playerTower.setVelocityY(vec.y * 5 * moveDir)
    } else {
      let angle = this.player.angle
      if (isLeft) {
        angle -= 2
      } else if (isRight) {
        angle += 2
      }

      this.player.angle = angle
      this.player.setVelocityX(0)
      this.player.setVelocityY(0)
      this.playerTower.setVelocityX(0)
      this.playerTower.setVelocityY(0)
    }

    const { worldX, worldY } = this.input.activePointer
    const angleToPointer = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.Between(
        this.playerTower.x,
        this.playerTower.y,
        this.cursorObject.x,
        this.cursorObject.y
      )
    )
    // const { worldX, worldY } = this.input.activePointer
    // const angleToPointer = Phaser.Math.RadToDeg(
    //   Phaser.Math.Angle.Between(this.playerTower.x, this.playerTower.y, worldX, worldY)
    // )
    const angleDelta = Phaser.Math.Angle.ShortestBetween(this.playerTower.angle, angleToPointer)

    // if (Phaser.Math.Fuzzy.Equal(angleDelta, 0, TOLERANCE)) {
    //   this.playerTower.setAngularVelocity(0)
    // } else {
    //   this.playerTower.setAngularVelocity(Math.sign(angleDelta) * ROTATION_SPEED)
    // }

    // console.log(angleToPointer, this.playerTower.angle, angleDelta)
    if (!Phaser.Math.Fuzzy.Equal(angleToPointer, this.playerTower.angle, TOLERANCE)) {
      this.playerTower.setAngle(this.playerTower.angle + Math.sign(angleDelta) * 1)
    }

    if (this.cursorKeysRotateTower.down.isDown) {
      this.cursorObject.y += 2
    } else if (this.cursorKeysRotateTower.up.isDown) {
      this.cursorObject.y -= 2
    } else if (this.cursorKeysRotateTower.left.isDown) {
      this.cursorObject.x -= 2
    } else if (this.cursorKeysRotateTower.right.isDown) {
      this.cursorObject.x += 2
    }

    // // Horizontal movement
    // if (this.cursors.left.isDown) {
    //   this.player.setVelocityX(-10)
    // } else if (this.cursors.right.isDown) {
    //   this.player.setVelocityX(10)
    // }

    // // Vertical movement
    // if (this.cursors.up.isDown) {
    //   this.player.setVelocityY(-10)
    // } else if (this.cursors.down.isDown) {
    //   this.player.setVelocityY(10)
    // }

    // Update the animation last and give left/right animations precedence over up/down animations
    // if (this.cursors.left.isDown) {
    //   this.player.anims.play('left', true)
    // } else if (this.cursors.right.isDown) {
    //   this.player.anims.play('right', true)
    // } else if (this.cursors.up.isDown) {
    //   this.player.anims.play('up', true)
    // } else if (this.cursors.down.isDown) {
    //   this.player.anims.play('down', true)
    // } else {
    //   this.player.anims.stop()
    // }
  }

  onSetGameData(data: IGameData) {
    // console.log('onSetGameData: ', data)
    this.gameData = JSON.parse(JSON.stringify(data))
    // if (!this.gameData?.bestScore) {
    //   this.scene.get('Help').onStartHelp()
    // }
  }

  changeLocale(lang: TLang) {
    this.lang = lang

    // this.jobText?.setText(`${this.lang?.job || '#job'}`)
    // this.levelText?.setText(`${this.lang?.level || '#level'} ${this.gameData.level}`)
    // this.currentScoreText?.setText(`${this.lang?.current_score || '#current_score'}`)
    // if (this.gameData) {
    //   this.gameData.lang = lang.code
    // }
  }
}
