import { EventBus } from '../EventBus'
import { Scene } from 'phaser'
import { GameOptions } from '../options/gameOptions'
import Planck from 'planck'
import { getRandomInt, toMeters, toPixels } from '../utils/planckUtils'
import _ from 'lodash'
// import { getLocalStorage, setLocalStorage } from '../utils/storageUtils'
// import { TextButton } from '../objects/textButton'
// import { SpriteButton } from '../objects/spriteButton'
import { IGameData, TLang } from '@/App.vue'
import {
  clamp,
  getDifferenceTime,
  randomInteger,
  shuffle,
  updateParticleRotation
} from '../utils/utils'

// body type, can be a ball or a wall
enum bodyType {
  BALL,
  FLOOR,
  WALL,
  BOMB
}

// let BALL_CATEGORY = 0x0002
// let BOMB_CATEGORY = 0x0004

// let BALL_MASK = 0xffff

// let BALL_GROUP = 1
// let BOMB_GROUP = -1

// game state, can be idle (nothing to do), moving (when you move the ball) or gameover, when the game is over
enum gameState {
  IDLE,
  MOVING,
  BOMBING,
  MOVEBOMB,
  ROTATION,
  GAMEOVER
}

export class Game extends Scene {
  constructor() {
    super({
      key: 'Game'
    })
  }

  lang: TLang

  gameOverBody: Planck.Body[] = []
  debounceFunction: (contact: any) => {}

  world: Planck.World // physics world
  contactManagement: any[] // array to store all contacts
  gameData: IGameData // data retrieved from local storage / to save on local storage
  config: any // configuration object
  ballsAdded: number // amount of balls added
  currentBallValue: number // current ball value
  score: number // score
  nextBallValue: number // next ball value
  ids: number[] // array with all ball ids
  emitters: Phaser.GameObjects.Particles.ParticleEmitter[] // array with all particle emitters
  dummyBalls: Phaser.GameObjects.Container[] // array with all dummy balls
  nextBallValueSprites: Phaser.GameObjects.Container[] // array with all sprites showing 'next' ball
  currentState: gameState // current game state
  scoreText: Phaser.GameObjects.Text
  currentScoreText: Phaser.GameObjects.Text
  objectPool: any[] // object pool

  progressScore: Phaser.GameObjects.Rectangle
  progressBarNewBall: Phaser.GameObjects.Rectangle
  progressNewBallContainer: Phaser.GameObjects.Container
  triggerTimerNewBall: Phaser.Time.TimerEvent
  rectGameArea: Phaser.GameObjects.Rectangle
  rectGameAreaForEvent: Phaser.GameObjects.Rectangle
  textPool: any[] = []
  textEffectPool: any[] = []
  newBallPath: Phaser.GameObjects.Graphics = null
  graphics: Phaser.GameObjects.Graphics = null
  newBallPathLine: Phaser.Geom.Line = null
  newBallNormalLine: Phaser.Geom.Line = null
  configTimerNewBall: Phaser.Types.Time.TimerEventConfig
  maxTimeWait: number
  levelText: Phaser.GameObjects.Text
  jobText: Phaser.GameObjects.Text
  jobContainer: Phaser.GameObjects.Container
  tweenProgressScore: Phaser.Tweens.Tween
  shipContainer: Phaser.GameObjects.Container
  ship: Phaser.GameObjects.Sprite
  shipFace: Phaser.GameObjects.Sprite
  shipFaceBg: Phaser.GameObjects.Sprite
  rotator: Phaser.GameObjects.Container
  buttonRotate: Phaser.GameObjects.Container
  polygon2D: Planck.Body

  bomb: Phaser.GameObjects.Particles.ParticleEmitter
  bombCircle: Planck.CircleShape
  buttonBombBg: Phaser.GameObjects.NineSlice
  buttonBombContainer: Phaser.GameObjects.Container
  buttonBombCounterContainer: Phaser.GameObjects.Container
  buttonBombCounterText: Phaser.GameObjects.Text

  lastDateDestroyLastBall: Date
  countSeriaDestroy: number = 0
  // lastDateAddBomb: Date
  // diffTimeAddBomb: number
  diffTimeDestroyLastBall: number

  floor: Planck.Body
  floorY: number
  triggerChangeFloor: Phaser.Time.TimerEvent
  configTimerFloor: Phaser.Types.Time.TimerEventConfig

  configJob: { job: [number, number]; position: { x: number; y: number } }[]
  // bombTest: Phaser.GameObjects.Arc

  // progressRotation: Phaser.GameObjects.Rectangle
  // progressRotation: Phaser.GameObjects.Rectangle

  baseStartX: number
  baseStartY: number
  baseEndY: number
  baseEndX: number

  audio_ball_start:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.WebAudioSound
  audio_ball_destroy:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.WebAudioSound
  gojob: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  click: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound
  fire: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound

  // method to be called once the instance has been created
  create(): void {
    this.debounceFunction = _.debounce(this.checkSeria, GameOptions.debounceCheckSeria)

    if (!this.textures.exists('rocket')) {
      this.textures.generate('rocket', {
        data: ['0123...'],
        palette: {
          0: '#fff2',
          1: '#fff4',
          2: '#fff8',
          3: '#ffff'
        },
        pixelWidth: 4
      })
    }

    // this.lastDateAddBomb = new Date()
    // this.cameras.main.setBackgroundColor(0x050505)
    // this.add
    //   .image(GameOptions.screen.width / 2, GameOptions.screen.height / 2, 'bg')
    //   .setAlpha(1)
    //   .setTint(GameOptions.ui.panelBgColor)
    //   .setDepth(-100)

    // default object to save in local storage
    // const defaultObject: {
    //   bestScore: number
    //   level: number
    //   score: number
    // } = {
    //   bestScore: 0,
    //   level: 1,
    //   score: 0
    // }

    this.gojob = this.sound.add('gojob')
    this.fire = this.sound.add('fire', { loop: true })
    this.click = this.sound.add('click')
    this.events.on('pause', () => {
      this.click.pause()
    })
    this.audio_ball_start = this.sound.add('ball_start')
    this.events.on('pause', () => {
      this.gojob.pause()
      this.audio_ball_destroy.pause()
      this.audio_ball_start.pause()
      this.fire.pause()
    })
    this.events.on('shutdown', () => {
      this.onHideBomb()
    })
    this.audio_ball_destroy = this.sound.add('ball_destroy')
    this.events.on('resume', () => {
      this.audio_ball_destroy.resume()
      this.audio_ball_start.resume()
      this.fire.resume()
      this.gojob.resume()
    })

    // initialize local storage
    // this.savedData = getLocalStorage(GameOptions.localStorageName, defaultObject)

    // initialize global variables
    this.ids = []
    this.ballsAdded = 0
    this.contactManagement = []
    this.emitters = []
    this.dummyBalls = []
    this.nextBallValueSprites = []
    this.objectPool = []
    this.currentState = gameState.MOVING
    this.currentBallValue = Phaser.Math.Between(0, GameOptions.maxStartBallSize)
    this.nextBallValue = Phaser.Math.Between(0, GameOptions.maxStartBallSize)

    // build particle emitters
    this.buildEmitters()

    // create a Box2D world with gravity
    this.world = new Planck.World(new Planck.Vec2(0, GameOptions.Box2D.gravity))

    // set some variables to build walls and various stuff
    this.baseStartX = (this.game.config.width as number) / 2 - GameOptions.gameField.width / 2
    this.baseEndX = this.baseStartX + GameOptions.gameField.width
    this.baseStartY = (this.game.config.height as number) - GameOptions.gameField.distanceFromBottom
    this.baseEndY = this.baseStartY - GameOptions.gameField.height
    const leftPanelCenter: number = this.baseStartX / 2
    const rightPanelCenter: number = this.baseEndX + leftPanelCenter
    const leftPanelWidth: number = 500

    // this.bombTest = this.add.circle(0, 0, 5, 0xff0000, 1).setDepth(100000)

    // Box2D polygon where to make ball fall into
    this.createPolygon(this.baseStartX, this.baseStartY, this.baseEndX, this.baseEndY)

    // score panel
    const centerXLeft = this.baseStartX - GameOptions.bodies[GameOptions.bodies.length - 1].size * 2
    const centerXRight = this.baseEndX + GameOptions.bodies[GameOptions.bodies.length - 1].size * 2
    // const panelScore = this.add
    //   .rectangle(0, 0, GameOptions.screen.width, 150, GameOptions.ui.panelBgColor, 1)
    //   // .nineslice(0, 0, 'panel', 0, GameOptions.screen.width, 170, 33, 33, 33, 33)
    //   // .setTint(GameOptions.ui.panelBgColor)
    //   .setAlpha(1)
    //   .setDepth(99)
    //   .setOrigin(0)
    this.levelText = this.add
      .text(centerXRight - 80, 350, 'Level 12', {
        fontFamily: 'Arial',
        fontSize: 35,
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 1,
        fontStyle: 'bold',
        align: 'left'
      })
      .setOrigin(0, 0.5)
      .setDepth(100)

    this.jobContainer = this.add.container(centerXLeft, 350, [])
    this.jobText = this.add
      .text(centerXLeft, 220, 'Destroy this balls', {
        fontFamily: 'Arial',
        fontSize: 30,
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 1,
        align: 'center',
        wordWrap: { width: 200 }
      })
      .setOrigin(0.5)
      .setDepth(100)
    this.currentScoreText = this.add
      .text(centerXRight, 400, 'current score', {
        fontFamily: 'Arial',
        fontSize: 25,
        color: GameOptions.ui.primaryColor,
        stroke: '#000000',
        strokeThickness: 1,
        align: 'left'
      })
      .setOrigin(0.5)
      .setDepth(100)
    this.scoreText = this.add
      .text(centerXRight - 70, 460, this.gameData?.totalScore.toString(), {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 65,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'left'
      })
      .setOrigin(0, 0.5)
      .setDepth(10)
    // this.add.bitmapText(
    //   rightPanelCenter + 180,
    //   132,
    //   'font',
    //   // `${this.savedData.levelScore.toString()}(${this.savedData.bestScore.toString()})`,
    //   '0',
    //   90
    // )
    // this.bestScoreText.setOrigin(1)
    // this.bestScoreText.setTint(0xffffff)
    // this.scoreText = this.addbitmapText(leftPanelCenter + 180, 132, 'font', '0', 90)

    // Progress scope.
    // const panelScore2 = this.add
    //   // .nineslice(
    //   //   GameOptions.screen.width / 2,
    //   //   0,
    //   //   'panel',
    //   //   0,
    //   //   GameOptions.screen.width / 2,
    //   //   170,
    //   //   33,
    //   //   33,
    //   //   33,
    //   //   33
    //   // )
    //   // .setTint(0x000000)
    //   .rectangle(0, 150, GameOptions.screen.width, 120, GameOptions.gameField.borderColor, 1)
    //   .setAlpha(1)
    //   .setDepth(0)
    //   .setOrigin(0)
    // const maskProgress = this.add
    //   .rectangle(0, 220, GameOptions.screen.width, 120, 0x000000, 1)
    //   .setDepth(2)
    //   .setOrigin(0)
    // this.progressScore.mask = new Phaser.Display.Masks.BitmapMask(this, maskProgress)
    this.add
      .container(0, -20, [
        // panelScore,
        // panelScore2,
        // progressBG,
        // this.progressScore,

        this.levelText,
        this.jobText,
        this.currentScoreText,
        this.scoreText,
        this.jobContainer
      ])
      .setDepth(100)

    // progress score.
    const progressBG = this.add
      .rectangle(0, 0, GameOptions.screen.width, 10, 0x000000, 0.2)
      .setDepth(11)
      .setOrigin(0)
    this.progressScore = this.add
      .rectangle(0, 0, GameOptions.screen.width, 10, GameOptions.ui.activeTextNumber, 1)
      // .nineslice(leftPanelCenter - 25, 100, 'panel', 0, leftPanelWidth, 120, 33, 33, 33, 33)
      // .setTint(0x0000ff)
      .setAlpha(1)
      .setOrigin(0)
      .setDepth(10)
    this.progressScore.width = 0
    this.add
      .container(0, GameOptions.screen.height, [progressBG, this.progressScore])
      .setDepth(1000)

    // best score panel
    // this.add
    //   .nineslice(rightPanelCenter, 100, 'panel', 0, leftPanelWidth, 120, 33, 33, 33, 33)
    //   .setTint(GameOptions.ui.panelBgColor)
    //   .setAlpha(0.8)
    // this.add
    //   .sprite(rightPanelCenter - leftPanelWidth / 2 + 15, 100, 'crown')
    //   .setOrigin(0, 0.5)
    //   .setTint(0x3d3d3d)

    // Buttons rotate.
    const bgButtonRotate = this.add
      .nineslice(0, 0, 'button', 0, 110, 110, 33, 33, 33, 33)
      .setTint(GameOptions.ui.panelBgColorAccent) //0xe1d41c
      .setAlpha(0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    const buttonRotate = this.add
      .sprite(0, 0, 'arrowdownup')
      .setTint(0x000000)
      .setScale(0.25)
      .setOrigin(0.5)
    bgButtonRotate.on('pointerup', () => {
      this.onRotateNewBall()
    })
    this.buttonRotate = this.add
      .container(centerXRight, 70, [bgButtonRotate, buttonRotate])
      .setDepth(100)
    bgButtonRotate.on('pointerover', () => {
      if (this.currentState === gameState.BOMBING) {
        return
      }
      buttonRotate.y += 1
      this.buttonRotate.setAlpha(0.8)
    })
    bgButtonRotate.on('pointerout', () => {
      if (this.currentState === gameState.BOMBING) {
        return
      }
      buttonRotate.y -= 1
      this.buttonRotate.setAlpha(1)
    })

    // Buttons bomb.
    this.buttonBombBg = this.add
      .nineslice(0, 0, 'button', 0, 110, 110, 33, 33, 33, 33)
      .setTint(GameOptions.ui.panelBgColorAccent)
      // .setInteractive({ useHandCursor: true })
      // .text(0, 0, 'Bomb', {
      //   fontFamily: 'Arial',
      //   fontSize: 30,
      //   color: '#ffffff',
      //   stroke: '#000000',
      //   strokeThickness: 1,
      //   align: 'right'
      // })
      .setAlpha(0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    this.buttonBombBg.on('pointerup', () => {
      if (this.currentState != gameState.BOMBING && this.currentState != gameState.MOVEBOMB) {
        if (this.gameData.bomb === 0) {
          this.scene.get('Message').showMessageCreateBomb()
        } else {
          this.click.play()
          this.onCreateBomb()
        }
      }
    })
    const buttonBomb = this.add
      .sprite(0, 0, 'lighting')
      .setTint(GameOptions.ui.panelBgColor)
      .setScale(0.25)
      .setOrigin(0.5)
    this.buttonBombCounterText = this.add
      .text(0, 0, '7', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 35,
        color: '#000000',
        stroke: '#000000',
        strokeThickness: 0,
        align: 'center'
      })
      .setOrigin(0.5)
    const buttonBombCounterBg = this.add
      .circle(0, 0, 24, GameOptions.ui.successColor.replace('#', '0x'), 1)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    this.buttonBombCounterContainer = this.add
      .container(50, -40, [buttonBombCounterBg, this.buttonBombCounterText])
      .setDepth(11111)
    this.buttonBombContainer = this.add
      .container(centerXRight, this.buttonRotate.y + 120, [
        this.buttonBombBg,
        buttonBomb,
        this.buttonBombCounterContainer
      ])
      .setDepth(11111)
    this.buttonBombBg.on('pointerover', () => {
      if (this.currentState === gameState.BOMBING) {
        return
      }
      this.buttonBombContainer.y += 1
      this.buttonBombContainer.setAlpha(0.8)
    })
    this.buttonBombBg.on('pointerout', () => {
      if (this.currentState === gameState.BOMBING) {
        return
      }
      this.buttonBombContainer.y -= 1
      this.buttonBombContainer.setAlpha(1)
    })

    // "next" panel
    // this.add
    //   .nineslice(
    //     leftPanelCenter - 25,
    //     280,
    //     'panel',
    //     0,
    //     leftPanelWidth,
    //     150 + GameOptions.bodies[GameOptions.maxStartBallSize].size * 2,
    //     33,
    //     33,
    //     33,
    //     33
    //   )
    //   .setOrigin(0.5, 0)
    //   .setTint(GameOptions.ui.panelBgColor)

    // this.add
    //   .text(250, 350, 'Следующий шар', {
    //     fontFamily: 'Arial Black',
    //     fontSize: 38,
    //     color: '#ffffff',
    //     stroke: '#ffffff',
    //     // strokeThickness: 0,
    //     align: 'center'
    //   })
    //   .setDepth(100)
    //   .setOrigin(0.5)

    // this.add
    //   .bitmapText(leftPanelCenter, 210, 'font', 'NEXT', 90)
    //   .setTint(0x3d3d3d)
    //   .setOrigin(0.5, 0)

    // game field
    this.add
      .tileSprite(
        this.baseStartX + 32,
        this.baseStartY,
        GameOptions.gameField.width - 64,
        32,
        'wall'
      )
      .setOrigin(0)
      .setTint(GameOptions.gameField.borderColor)
      .setDepth(1)
    this.add
      .sprite(this.baseStartX - 32, this.baseStartY - 32, 'angle')
      .setOrigin(0)
      .setFlipY(true)
      .setTint(GameOptions.gameField.borderColor)
      .setDepth(1)
    this.add
      .sprite(this.baseEndX - 32, this.baseStartY - 32, 'angle')
      .setOrigin(0)
      .setFlipY(true)
      .setFlipX(true)
      .setTint(GameOptions.gameField.borderColor)
      .setDepth(1)
    this.add
      .tileSprite(
        this.baseStartX - 32,
        this.baseEndY,
        32,
        GameOptions.gameField.height - 32,
        'wall'
      )
      .setOrigin(0)
      .setTint(GameOptions.gameField.borderColor)
      .setDepth(1)
    this.add
      .tileSprite(this.baseEndX, this.baseEndY, 32, GameOptions.gameField.height - 32, 'wall')
      .setOrigin(0)
      .setTint(GameOptions.gameField.borderColor)
      .setDepth(1)

    // danger zone.
    // this.add.rectangle(0, 250, 57, 440, 0xff0000, 0.1).setOrigin(0).setDepth(-5)
    // this.add
    //   .rectangle(GameOptions.gameField.width + 123, 250, 57, 440, 0xff0000, 0.2)
    //   .setOrigin(0)
    //   .setDepth(-5)
    // this.add.image(5, 250, 'danger').setScale(1.7).setAlpha(0.2)
    // this.add
    //   .image(GameOptions.gameField.width + 175, 250, 'danger')
    //   .setScale(1.7)
    //   .setAlpha(0.2)
    this.rectGameArea = this.add
      .rectangle(
        this.baseStartX,
        this.baseEndY,
        GameOptions.gameField.width,
        GameOptions.gameField.height,
        0x000000,
        0.1
      )
      .setOrigin(0)
      .setDepth(-3)
    const tileTopBorder = this.add
      .tileSprite(this.baseStartX, this.baseEndY, GameOptions.gameField.width, 3, 'border_top')
      .setTint(GameOptions.ui.accent.replace('#', '0x'))
      .setOrigin(0)
      .setAlpha(0.1)

    this.rectGameAreaForEvent = this.add
      .rectangle(
        this.baseStartX,
        this.baseEndY,
        GameOptions.gameField.width,
        GameOptions.gameField.height + 300,
        0x000000,
        0
      )
      .setOrigin(0)
      .setDepth(-2)
    this.rectGameAreaForEvent.setInteractive({ useHandCursor: true })
    // when the player releases the input...
    this.rectGameAreaForEvent.on(
      'pointerup',
      (pointer: Phaser.Input.Pointer) => {
        this.onMoveShip(pointer)
        this.gameData.countBall++
        this.onCreateNewBall(pointer)
      },
      this
    )
    this.rectGameAreaForEvent.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer) => {
        this.onMoveShip(pointer)
      },
      this
    )

    // timer change floor.
    // this.floorY = this.baseStartY - 10
    this.createFloor()
    // this.onSetPositionFloor(this.baseStartY)
    this.configTimerFloor = {
      callback: () => {
        this.onSetPositionFloor(this.floorY - GameOptions.stepChangeFloor)
        this.triggerChangeFloor.destroy()
        this.triggerChangeFloor = this.time.addEvent(this.configTimerFloor)
        // this.triggerChangeFloor.reset(this.configTimerFloor)
      },
      callbackScope: this,
      delay: GameOptions.maxTimeForChangeFloorY
      // loop: true,
    }
    this.triggerChangeFloor = this.time.addEvent(this.configTimerFloor)

    // // Timer new ball.
    // this.maxTimeWait = GameOptions.timerNewBall.maxTimeWait
    // this.configTimerNewBall = {
    //   callback: () => {
    //     // this.onResetProgressNewBall()
    //     this.onCreateNewBall(this.game.input.mousePointer)
    //   },
    //   callbackScope: this,
    //   delay: this.maxTimeWait // 1000 = 1 second
    //   //loop: true
    // }
    // this.triggerTimerNewBall = this.time.addEvent(this.configTimerNewBall)
    // // Progressbar New ball.
    // const progressTimerNewBall = this.add
    //   .rectangle(
    //     62,
    //     -GameOptions.timerNewBall.heightProgress / 2,
    //     GameOptions.timerNewBall.widthProgress,
    //     GameOptions.timerNewBall.heightProgress
    //   )
    //   .setFillStyle(0x000000, 1)
    //   .setOrigin(0)
    // // .setStrokeStyle(1, 0xffffff)
    // this.progressBarNewBall = this.add
    //   .rectangle(
    //     62,
    //     -GameOptions.timerNewBall.heightProgress / 2,
    //     GameOptions.timerNewBall.widthProgress,
    //     GameOptions.timerNewBall.heightProgress,
    //     GameOptions.timerNewBall.progressColor
    //   )
    //   // .setRotation(Math.PI)
    //   .setOrigin(0)
    // this.progressNewBallContainer = this.add
    //   .container(GameOptions.screen.width / 2, GameOptions.gameField.y - 70, [
    //     progressTimerNewBall,
    //     this.progressBarNewBall
    //   ])
    //   .setDepth(10)

    // Ship.
    this.ship = this.add
      .sprite(0, 0, 'ship')
      .setScale(0.7)
      .setTint(GameOptions.ui.panelBgColor)
      .setInteractive()
    this.shipFace = this.add
      .sprite(
        GameOptions.screen.width / 2,
        GameOptions.gameField.y - GameOptions.bodies[GameOptions.maxStartBallSize].size,
        'shipFace'
      )
      .setScale(0.7)
      .setAlpha(0.9)
      .setTint(GameOptions.gameField.borderColor)
      .setInteractive({ useHandCursor: true })
      .setDepth(5)
    this.shipFace.on('pointerup', this.onRotateNewBall, this)
    // this.shipFaceBg = this.add
    //   .sprite(
    //     GameOptions.screen.width / 2,
    //     GameOptions.gameField.y - GameOptions.bodies[GameOptions.maxStartBallSize].size,
    //     'shipFaceBg'
    //   )
    //   .setScale(0.9)
    //   // .setTint(GameOptions.ui.panelBgColor)
    //   .setDepth(0)
    this.shipContainer = this.add
      .container(
        GameOptions.screen.width / 2,
        GameOptions.gameField.y - GameOptions.bodies[GameOptions.maxStartBallSize].size,
        [this.ship]
      )
      .setDepth(0)

    // create bomb.
    this.bomb = this.add
      .particles(0, GameOptions.gameField.y, 'flares', {
        frame: 'white',
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404], // 0x0070ff, 0x0006ff, 0x7c00ff, 0xffb300
        colorEase: 'quad.out',
        lifespan: 2400,
        angle: { min: -100, max: -80 },
        scale: { start: 0.7, end: 0, ease: 'sine.out' },
        speed: { min: 100, max: 200 },
        advance: 2000,
        blendMode: 'ADD'
      })
      .setDepth(99999)
      .setVisible(false)
    this.bombCircle = new Planck.Circle(new Planck.Vec2(0.0, 15.1), GameOptions.defaultSizeBomb)

    // // rotator.
    // const spriteRotator = this.add
    //   .sprite(0, 0, 'arrowdownup')
    //   .setScale(0.1)
    //   .setAlpha(0.8)
    //   .setTint(0x333333)
    // const bgRotator = this.add
    //   .circle(0, 0, 150, 0xffffff, 1)
    //   .setScale(0.2)
    //   .setAlpha(0.8)
    //   .setInteractive({ useHandCursor: true })
    // this.rotator = this.add
    //   .container(
    //     GameOptions.screen.width / 2,
    //     GameOptions.gameField.y - GameOptions.bodies[GameOptions.maxStartBallSize].size,
    //     [bgRotator, spriteRotator]
    //   )
    //   .setDepth(100)
    //   .setAlpha(0.1)
    // bgRotator.on('pointerover', () => {
    //   this.rotator.setAlpha(1)
    // })
    // bgRotator.on('pointerout', () => {
    //   this.rotator.setAlpha(0.1)
    // })
    // bgRotator.on('pointerup', () => {
    //   this.onRotateNewBall()
    // })

    // create dummy and "next" balls. These aren't physics bodies, just sprites to be moved according to user input
    for (let i: number = 0; i <= GameOptions.maxStartBallSize; i++) {
      const ballSprite: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'ball')
      const ball = this.add.container(0, GameOptions.gameField.ballY, ballSprite)

      ball.add(ballSprite)
      ball.setAlpha(1)
      ball.setVisible(false)
      ballSprite.setDisplaySize(GameOptions.bodies[i].size * 2, GameOptions.bodies[i].size * 2)
      ballSprite.setTint(GameOptions.bodies[i].color)
      const text = this.add
        .text(0, 0, GameOptions.bodies[i].score, {
          fontFamily: 'Arial',
          fontSize: GameOptions.bodies[i].textSize,
          color: GameOptions.bodies[i].textColor,
          // stroke: '#000000',
          // strokeThickness: 4,
          align: 'center'
        })
        .setDepth(1)
        .setOrigin(0.5)
      // text.setVisible(true)
      ball.add(text)
      this.dummyBalls.push(ball)

      const nextBall: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'ball')
      const nextBallValue = this.add.container(
        0,
        GameOptions.gameField.ballY -
          GameOptions.bodies[this.currentBallValue].size -
          GameOptions.bodies[this.nextBallValue].size,
        // this.baseStartX,
        // // 420 + GameOptions.bodies[GameOptions.maxStartBallSize].size,
        // GameOptions.gameField.y - GameOptions.bodies[i].size * 2,
        nextBall
      )
      // ballSprite.setData({ text })
      const textNextBall = this.add
        .text(0, 0, GameOptions.bodies[i].score, {
          fontFamily: 'Arial',
          fontSize: GameOptions.bodies[i].textSize,
          color: GameOptions.bodies[i].textColor,
          // stroke: '#000000',
          // strokeThickness: 4,
          align: 'center'
        })
        .setAlpha(0.5)
        .setOrigin(0.5)
      // text.setVisible(true)
      nextBallValue.add(textNextBall)
      nextBallValue.setVisible(false)
      nextBall.setTint(GameOptions.bodies[i].color)
      nextBall.setDisplaySize(GameOptions.bodies[i].size * 2, GameOptions.bodies[i].size * 2)
      nextBall.setData({ text: textNextBall })
      this.nextBallValueSprites.push(nextBallValue)
    }
    this.dummyBalls[this.currentBallValue].setVisible(true)
    // const textCurrentBall = this.dummyBalls[this.currentBallValue].getData('text')
    // textCurrentBall.setVisible(true)
    this.nextBallValueSprites[this.nextBallValue].setVisible(true)
    // const textNextBall = this.nextBallValueSprites[this.nextBallValue].getData('text')
    // textNextBall.setVisible(true)

    this.shipContainer.add([
      this.dummyBalls[this.currentBallValue],
      this.nextBallValueSprites[this.nextBallValue]
    ])

    this.graphics = this.add.graphics({ lineStyle: { width: 5, color: GameOptions.ui.pathColor } }) //.setDepth(-1)
    // this.newBallPathLine = new Phaser.Geom.Line(
    //   this.baseStartX,
    //   GameOptions.gameField.y,
    //   this.baseStartX,
    //   GameOptions.gameField.height +
    //     GameOptions.bodies[this.currentBallValue].size +
    //     GameOptions.gameField.y +
    //     50
    // )
    // this.newBallNormalLine = new Phaser.Geom.Line(
    //   this.baseStartX,
    //   GameOptions.gameField.height +
    //     GameOptions.bodies[this.currentBallValue].size +
    //     GameOptions.gameField.y +
    //     50,
    //   this.baseStartX,
    //   (GameOptions.gameField.y + GameOptions.bodies[this.currentBallValue].size) / 2
    // )

    // const fx = this.graphics.postFX.addGlow(0xffff00, 0, 0, false, 0.1, 8)
    // this.tweens.add({
    //   targets: fx,
    //   outerStrength: 2,
    //   yoyo: true,
    //   loop: -1,
    //   ease: 'sine.inout'
    // })

    // this.newBallPath = this.add
    //   .line(
    //     this.baseStartX,
    //     GameOptions.gameField.y,
    //     GameOptions.bodies[this.currentBallValue].size,
    //     0,
    //     GameOptions.bodies[this.currentBallValue].size,
    //     GameOptions.gameField.height +
    //       GameOptions.bodies[this.currentBallValue].size +
    //       GameOptions.gameField.y +
    //       50,
    //     0xffffff
    //   )
    //   .setLineWidth(2)
    //   .setAlpha(0.4)
    //   .setOrigin(0)
    //   .setDepth(-1)
    this.newBallPath = this.add
      .graphics()
      // .rectangle(
      //   this.baseStartX,
      //   GameOptions.gameField.y,
      //   GameOptions.bodies[this.currentBallValue].size * 2,
      //   GameOptions.gameField.height +
      //     GameOptions.bodies[this.currentBallValue].size +
      //     GameOptions.gameField.y +
      //     50,
      //   0xffffff,
      //   0.1
      // )
      // .setOrigin(0)
      .fillGradientStyle(
        0xcccccc,
        0xcccccc,
        GameOptions.ui.panelBgColor,
        GameOptions.ui.panelBgColor,
        0.1
      )
      .fillRect(
        GameOptions.screen / 2,
        GameOptions.gameField.y,
        GameOptions.bodies[this.currentBallValue].size * 2,
        GameOptions.gameField.height +
          GameOptions.bodies[this.currentBallValue].size +
          GameOptions.gameField.y +
          50
      )
      .setVisible(false)
      .setDepth(-1)

    // this.newBallPath.setInteractive({ useHandCursor: true }).setVisible(false)
    // this.newBallPath.on('pointerup', this.onCreateNewBall, this)

    // when the player moves the input
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.onMoveShip(pointer))

    // this is the collision listener used to process contacts
    // this.world.on('end-contact', (contact: Planck.Contact) => {
    //   const bodies = []
    //   for (let body = this.world.getBodyList(); body; body = body.getNext()) {
    //     const userData: any = body.getUserData()
    //     if (userData.value !== undefined) {
    //       bodies.push({ pos: body.getPosition(), v: userData?.value })
    //     }
    //     // for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {}
    //   }
    //   this.gameData.tree = bodies
    //   // save data.
    //   EventBus.emit('save-data', this.gameData)
    // })
    this.world.on('pre-solve', (contact: Planck.Contact) => {
      // get both bodies user data
      const userDataA: any = contact.getFixtureA().getBody().getUserData()
      const userDataB: any = contact.getFixtureB().getBody().getUserData()

      // get the contact point
      const worldManifold: Planck.WorldManifold = contact.getWorldManifold(
        null
      ) as Planck.WorldManifold
      const contactPoint: Planck.Vec2Value = worldManifold.points[0] as Planck.Vec2Value

      // three nested "if" just to improve readability, to check for a collision we need:
      // 1 - both bodies must be balls
      if (
        userDataA.type == bodyType.BALL &&
        userDataB.type == bodyType.BALL
        //  ||
        // userDataA.type == bodyType.BOMB ||
        // userDataB.type == bodyType.BOMB
      ) {
        // 2 - both balls must have the same value
        if (userDataA.value == userDataB.value) {
          // 3 - balls ids must not be already present in the array of ids
          if (this.ids.indexOf(userDataA.id) == -1 && this.ids.indexOf(userDataB.id) == -1) {
            // add bodies ids to ids array
            this.ids.push(userDataA.id)
            this.ids.push(userDataB.id)

            // add a contact management item with both bodies to remove, the contact point, the new value of the ball and both ids
            this.contactManagement.push({
              body1: contact.getFixtureA().getBody(),
              body2: contact.getFixtureB().getBody(),
              point: contactPoint,
              value: userDataA.value + 1,
              id1: userDataA.id,
              id2: userDataB.id
            })
            this.audio_ball_destroy.play()
          }
        }
        // else if (userDataA.id === this.ballsAdded - 1 || userDataB.id === this.ballsAdded - 1) {
        //   setTimeout(() => {
        //     this.audio_ball_start.play()
        //   }, 1)
        // }
      }
    })

    // event face animate.
    const evt = this.time.addEvent({
      delay: 1000,
      callback: (event: Phaser.Time.TimerEvent) => {
        const bodies = []
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
          bodies.push(body)
        }
        const bodyForAnimate = shuffle(bodies).slice(0, 5)
        for (let x = 0; x < bodyForAnimate.length; x++) {
          const userData = bodies[x].getUserData()
          userData.face?.setFrame(randomInteger(1, 2))
          const evtInner = this.time.addEvent({
            delay: 500,
            callback: (event: Phaser.Time.TimerEvent) => {
              userData.face?.setFrame(0)
              evtInner.destroy()
            }
          })
        }
      },
      loop: true
    })

    this.input.keyboard.on('keyup-SPACE', () => this.onRotateNewBall())

    EventBus.emit('start-game', null)
    EventBus.emit('current-scene-ready', this)
  }

  redrawPath(startX, normal, point) {
    this.graphics.clear()
    this.newBallPath.clear()

    this.newBallPath.setVisible(true)
    if (this.currentState === gameState.BOMBING) {
      this.newBallPath
        .setDepth(2)
        .fillGradientStyle(0xffff00, 0xffff00, 0xffff00, 0xffff00, 0.5)
        .fillRect(
          GameOptions.bodies[this.currentBallValue].size -
            toPixels(GameOptions.defaultSizeBomb * 2) / 2,
          this.bomb.y,
          toPixels(GameOptions.defaultSizeBomb * 2),
          GameOptions.gameField.height + GameOptions.bodies[this.currentBallValue].size * 3
        )
      // this.newBallPath.height =
      //   GameOptions.gameField.height + GameOptions.bodies[this.currentBallValue].size * 3
      // this.newBallPath.setFillStyle(0xffff00, 0.4)
    } else {
      this.graphics.setVisible(true)

      // const length = Phaser.Geom.Line.Length(this.newBallPathLine)

      const startY = GameOptions.gameField.y + 40
      const endX = toPixels(point.x)
      const endY = toPixels(point.y)

      // this.newBallPathLine.setTo(startX, startY, endX, endY)
      // this.newBallPathLine.setFromObjects(
      //   new Phaser.Math.Vector2(startX, startY),
      //   new Phaser.Math.Vector2(endX, endY)
      // )
      // this.graphics.strokeLineShape(this.newBallPathLine)

      var head = Planck.Vec2.combine(1, point, 2, normal)
      // this.newBallNormalLine.setFromObjects(
      //   new Phaser.Math.Vector2(endX, endY),
      //   new Phaser.Math.Vector2(toPixels(head.x), toPixels(head.y))
      // )
      // this.graphics.strokeLineShape(this.newBallNormalLine)

      this.newBallPath
        .setDepth(-1)
        .fillGradientStyle(
          0xffff00,
          0xffff00,
          GameOptions.ui.panelBgColor,
          GameOptions.ui.panelBgColor,
          0.1
        )
        .fillRect(
          0,
          GameOptions.gameField.y,
          GameOptions.bodies[this.currentBallValue].size * 2,
          endY - startY + GameOptions.bodies[this.currentBallValue].size * 2
        )
      // this.newBallPath.height = endY - startY + GameOptions.bodies[this.currentBallValue].size * 2
      // this.newBallPath.width = GameOptions.bodies[this.currentBallValue].size * 2
      // this.newBallPath.setFillStyle(0xffffff, 0.1)
    }
  }

  onSetGameData(data: IGameData) {
    // console.log('onSetGameData: ', data)
    this.gameData = JSON.parse(JSON.stringify(data))
    if (!this.gameData?.bestScore) {
      this.scene.get('Help').onStartHelp()
    }
    this.floorY = this.gameData?.floorY || this.baseStartY
    this.onSetPositionFloor(this.floorY)

    this.onSetScore()
    this.buttonBombCounterText.setText(this.gameData.bomb?.toString() || '0')

    if (this.gameData.tree && this.gameData.tree.length > 0) {
      this.gameData.tree.forEach((dataBall: any, index: number) => {
        this.time.addEvent({
          delay: 100,
          callback: () => {
            if (dataBall.v < GameOptions.bodies.length) {
              this.createBall(
                toPixels(dataBall.x),
                toPixels(dataBall.y),
                dataBall.v,
                dataBall.a,
                true
              )
              // const bodies = []
              // for (let body = this.world.getBodyList(); body; body = body.getNext()) {
              //   bodies.push(body)
              // }
              // if (!bodies.length) return
              // console.log(this.world, bodies)
            }
          }
        })
        // setTimeout(() => {
        //   this.createBall(
        //     Phaser.Math.Clamp(
        //       toPixels(dataBall.pos.x.toFixed(1)),
        //       this.baseStartX + GameOptions.bodies[this.currentBallValue].size,
        //       this.baseEndX - GameOptions.bodies[this.currentBallValue].size
        //     ),
        //     toPixels(dataBall.pos.y.toFixed(1) - 1),
        //     dataBall.v
        //   )
        //   // console.log(
        //   //   Phaser.Math.Clamp(
        //   //     toPixels(data.pos.x),
        //   //     this.baseStartX + GameOptions.bodies[this.currentBallValue].size,
        //   //     this.baseEndX - GameOptions.bodies[this.currentBallValue].size
        //   //   ),
        //   //   toPixels(data.pos.y.toFixed(1) - 1),
        //   //   data.v
        //   // )
        // }, 100)
      })
    }
    this.drawLevelJob()
  }

  onRotateNewBall() {
    const cacheCurrentState = this.currentState
    if (
      this.currentState == gameState.IDLE ||
      this.currentState == gameState.ROTATION ||
      this.currentState == gameState.BOMBING
    ) {
      return
    }

    this.sound.play('rotate')
    this.currentState = gameState.ROTATION
    this.graphics.setVisible(false)
    this.newBallPath.setVisible(false)

    // this.dummyBalls[this.currentBallValue].setVisible(false)
    // this.nextBallValueSprites[this.nextBallValue].setVisible(false)
    this.add.tween({
      targets: this.dummyBalls[this.currentBallValue],
      y: {
        value:
          GameOptions.gameField.ballY -
          GameOptions.bodies[this.currentBallValue].size -
          GameOptions.bodies[this.nextBallValue].size,
        duration: 350,
        ease: 'Expo.Out'
      },
      onComplete: () => {
        const x = this.dummyBalls[this.currentBallValue].x

        const cv = this.currentBallValue
        const nv = this.nextBallValue
        this.nextBallValue = cv
        this.currentBallValue = nv
        this.shipContainer.remove(this.dummyBalls[cv])
        this.shipContainer.remove(this.nextBallValueSprites[nv])
        this.dummyBalls[cv].setVisible(false)
        this.nextBallValueSprites[nv].setVisible(false)

        this.dummyBalls[this.currentBallValue].setY(GameOptions.gameField.ballY)
        // this.dummyBalls[this.currentBallValue].setX(0)
        this.dummyBalls[this.currentBallValue].setVisible(true)

        this.nextBallValueSprites[this.nextBallValue].setY(
          GameOptions.gameField.ballY -
            GameOptions.bodies[this.currentBallValue].size -
            GameOptions.bodies[this.nextBallValue].size
        )
        // this.nextBallValueSprites[this.nextBallValue].setX(0)
        this.nextBallValueSprites[this.nextBallValue].setVisible(true)

        this.shipContainer.add(this.dummyBalls[this.currentBallValue])
        this.shipContainer.add(this.nextBallValueSprites[this.nextBallValue])

        this.currentState = cacheCurrentState // gameState.MOVING
      }
    })
    this.add.tween({
      targets: this.nextBallValueSprites[this.nextBallValue],
      y: {
        value: GameOptions.gameField.ballY,
        duration: 300,
        ease: 'Expo.Out'
      },
      onComplete: () => {}
    })

    // this.add.tween({
    //   targets: this.shipContainer,
    //   angle: '+=180',
    //   duration: 300,
    //   onComplete: () => {
    //     this.shipContainer.remove(this.dummyBalls[this.currentBallValue])
    //     this.shipContainer.remove(this.nextBallValueSprites[this.nextBallValue])

    //     this.dummyBalls[this.nextBallValue].setVisible(true)
    //     this.dummyBalls[this.nextBallValue].setY(
    //       GameOptions.gameField.ballY -
    //       GameOptions.bodies[this.currentBallValue].size -
    //       GameOptions.bodies[this.nextBallValue].size
    //       )
    //       this.dummyBalls[this.currentBallValue].setVisible(false)

    //       this.nextBallValueSprites[this.currentBallValue].setVisible(true)
    //       this.nextBallValueSprites[this.currentBallValue].setY(GameOptions.gameField.ballY)
    //       this.nextBallValueSprites[this.nextBallValue].setVisible(false)

    //     this.shipContainer.add([
    //       this.dummyBalls[this.nextBallValue],
    //       this.nextBallValueSprites[this.currentBallValue]
    //     ])
    //     // const cv = this.currentBallValue
    //     // const nv = this.nextBallValue
    //     // this.nextBallValue = cv
    //     // this.currentBallValue = nv
    //   }
    // })
  }

  onCreateNewBall(pointer: Phaser.Input.Pointer) {
    if (this.currentState == gameState.ROTATION) {
      return
    }
    if (this.currentState === gameState.BOMBING) {
      this.onRunBomb()
      return
    }

    const jobScore = this.gameData.job.reduce((ac, el) => {
      return ac + el[1] * GameOptions.bodies[el[0]].score
    }, 0)
    const progressLevel = (this.gameData.jobTotal - jobScore) / this.gameData.jobTotal //this.progressScore.width / GameOptions.screen.width

    this.maxTimeWait = Math.max(
      (1 - progressLevel) * GameOptions.timerNewBall.maxTimeWait,
      GameOptions.timerNewBall.minTimeWait
    )
    this.onResetProgressNewBall()

    // are we moving?
    if (this.currentState == gameState.MOVING) {
      // set the game state to IDLE
      this.currentState = gameState.IDLE

      // this.newBallPath.destroy()
      // this.newBallPathLine = null
      this.graphics.setVisible(false)
      this.newBallPath.setVisible(false)

      // hide dummy ball
      this.shipContainer.remove(this.dummyBalls[this.currentBallValue])
      this.dummyBalls[this.currentBallValue].setVisible(false)

      // move next ball to dummy
      // const pos = this.nextBallValueSprites[this.nextBallValue].position
      this.add.tween({
        targets: this.nextBallValueSprites[this.nextBallValue],
        y: {
          value: GameOptions.gameField.ballY,
          // duration: 500 - (this.progressScore.width / 500) * 100,
          duration: GameOptions.idleTime - 50,
          ease: 'Back.linear'
        },
        onComplete: () => {
          // this.nextBallValueSprites[this.nextBallValue].setPosition(pos)
        }
      })

      this.audio_ball_start.play()

      // create a new physics ball
      this.createBall(
        Phaser.Math.Clamp(
          pointer.x,
          this.baseStartX + GameOptions.bodies[this.currentBallValue].size,
          this.baseEndX - GameOptions.bodies[this.currentBallValue].size
        ),
        // this.baseEndY - GameOptions.bodies[this.currentBallValue].size,
        GameOptions.gameField.y,
        this.currentBallValue
      )

      // wait some time before adding a new ball
      this.time.addEvent({
        delay: GameOptions.idleTime,
        callback: () => {
          this.currentState = gameState.MOVING
          this.currentBallValue = this.nextBallValue
          this.nextBallValue = Phaser.Math.Between(0, GameOptions.maxStartBallSize)
          this.dummyBalls[this.currentBallValue].setVisible(true)

          this.shipContainer.add(this.dummyBalls[this.currentBallValue])

          this.nextBallValueSprites[this.currentBallValue].setVisible(false)
          this.dummyBalls[this.currentBallValue].setY(GameOptions.gameField.ballY)

          this.nextBallValueSprites[this.nextBallValue].setY(GameOptions.gameField.ballY - 200)
          this.nextBallValueSprites[this.nextBallValue].setVisible(true)
          this.shipContainer.add(this.nextBallValueSprites[this.nextBallValue])
          this.add.tween({
            targets: this.nextBallValueSprites[this.nextBallValue],
            y: {
              value:
                GameOptions.gameField.ballY -
                GameOptions.bodies[this.currentBallValue].size -
                GameOptions.bodies[this.nextBallValue].size,
              // duration: 500 - (this.progressScore.width / 500) * 100,
              duration: 300,
              ease: 'Back.linear'
            },
            onComplete: () => {
              // this.nextBallValueSprites[this.nextBallValue].setPosition(pos)
            }
          })

          // this.newBallPath = this.add
          //   .rectangle(
          //     x - GameOptions.bodies[this.currentBallValue].size,
          //     GameOptions.gameField.y,
          //     GameOptions.bodies[this.currentBallValue].size * 2,
          //     GameOptions.gameField.height +
          //       GameOptions.bodies[this.currentBallValue].size +
          //       GameOptions.gameField.y +
          //       50,
          //     0xffffff,
          //     0.1
          //   )
          //   .setOrigin(0)
          //   .setDepth(-1)
          // this.graphics.setVisible(true)
          // this.newBallPath = this.add
          //   .line(
          //     x - GameOptions.bodies[this.currentBallValue].size,
          //     GameOptions.gameField.y,
          //     GameOptions.bodies[this.currentBallValue].size,
          //     0,
          //     GameOptions.bodies[this.currentBallValue].size,
          //     GameOptions.gameField.height +
          //       GameOptions.bodies[this.currentBallValue].size +
          //       GameOptions.gameField.y +
          //       50,
          //     0xffffff
          //   )
          //   .setLineWidth(2)
          //   .setAlpha(0.4)
          //   .setOrigin(0)
          //   .setDepth(-1)

          // this.newBallPath.setInteractive()
          // this.newBallPath.on('pointerup', this.onCreateNewBall, this)
        }
      })
    }
  }

  onMoveShip(pointer: Phaser.Input.Pointer) {
    // if (this.currentState == gameState.MOVING) {
    const x = Phaser.Math.Clamp(
      pointer.x,
      this.baseStartX + GameOptions.bodies[this.currentBallValue].size,
      this.baseEndX - GameOptions.bodies[this.currentBallValue].size
    )
    if (this.currentState !== gameState.MOVEBOMB) {
      this.bomb.setX(x)
    }

    // const textCurrentBall = this.dummyBalls[this.currentBallValue].getData('text')
    // textCurrentBall.setX(x)
    this.shipContainer.setX(x)
    this.shipFace.setX(x)
    this.progressNewBallContainer?.setX(x)
    // this.dummyBalls[this.currentBallValue].setX(x)
    // this.nextBallValueSprites[this.nextBallValue].setX(x)
    // this.rotator.setX(x)
    // this.nextBallValueSprites[this.nextBallValue].setY(
    //   GameOptions.gameField.y -
    //     GameOptions.bodies[this.currentBallValue].size -
    //     GameOptions.bodies[this.nextBallValue].size
    // )
    this.newBallPath?.setX(x - GameOptions.bodies[this.currentBallValue].size)

    // detect raycast.
    this.world.rayCast(
      Planck.Vec2(
        toMeters(x),
        toMeters(GameOptions.gameField.y + GameOptions.bodies[this.currentBallValue].size + 10)
      ),
      Planck.Vec2(toMeters(x), toMeters(GameOptions.screen.height)),
      (fixture, point, normal, fraction) => {
        var body = fixture.getBody()
        var userData = body.getUserData()
        if (userData) {
          // console.log('fraction: ', fraction, userData)
          if (userData === 0) {
            // By returning -1, we instruct the calling code to ignore this fixture and
            // continue the ray-cast to the next fixture.
            return 0.0
          }
        }

        this.redrawPath(x, normal, point)
        // console.log('point: ', point, normal)
        // By returning the current fraction, we instruct the calling code to clip the ray and
        // continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
        // are reported in order. However, by clipping, we can always get the closest fixture.
        return fraction
      }
    )

    // // This class captures the closest hit shape.
    // console.log(x)
    // let closest = null

    // this.world.rayCast(
    //   Planck.Vec2(x, pointer.y),
    //   Planck.Vec2(x, pointer.y + 500),
    //   function (fixture, point, normal, fraction) {
    //     closest = {
    //       fixture: fixture,
    //       point: point, // Vec2
    //       normal: normal, // Vec2
    //       fraction: fraction // number
    //     }

    //     // By returning the current fraction, we instruct the calling code to clip the ray and
    //     // continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
    //     // are reported in order. However, by clipping, we can always get the closest fixture.
    //     console.log(closest)

    //     return fraction
    //   }
    // )
    // }
  }

  // method to build emitters
  buildEmitters(): void {
    // loop through each ball
    GameOptions.bodies.forEach((body: any, index: number) => {
      // build particle graphics as a graphic object turned into a sprite
      const particleGraphics: Phaser.GameObjects.Graphics = this.make.graphics(
        {
          x: 0,
          y: 0
        },
        false
      )
      particleGraphics.fillStyle(0xffffff)
      particleGraphics.fillCircle(body.particleSize, body.particleSize, body.particleSize)
      particleGraphics.generateTexture(
        'particle_' + index.toString(),
        body.particleSize * 2,
        body.particleSize * 2
      )

      // create the emitter
      let emitter: Phaser.GameObjects.Particles.ParticleEmitter = this.add.particles(
        0,
        0,
        'particle_' + index.toString(),
        {
          lifespan: 500,
          speed: {
            min: 0,
            max: 50
          },
          scale: {
            start: 1,
            end: 0
          },
          emitting: false
        }
      )

      // set the emitter zone as the circle area
      emitter.addEmitZone({
        source: new Phaser.Geom.Circle(0, 0, body.size),
        type: 'random',
        quantity: 1
      })

      // set emitter z-order to 1, to always bring explosions on top
      emitter.setDepth(1)

      // add the emitter to emitters array
      this.emitters.push(emitter)
    })
  }

  // method to create a physics ball
  createBall(
    posX: number,
    posY: number,
    value: number,
    angle: number = 0,
    isMinVelocity = false
  ): void {
    // console.log('createBall: ', posX, posY, value)

    // define ball and face sprites
    let ballSprite: Phaser.GameObjects.Sprite
    let faceSprite: Phaser.GameObjects.Sprite
    let border: Phaser.GameObjects.Arc
    let ballText: Phaser.GameObjects.Text

    // should we take them from the pool?
    if (this.objectPool?.length > 1) {
      const poolObject: any = this.objectPool.pop()
      ballSprite = poolObject.sprite
      ballSprite.setVisible(true)
      faceSprite = poolObject.face
      faceSprite.setVisible(true)

      // ballText = poolObject.text
      // ballText.setText(GameOptions.bodies[value].score)
      // ballText.setVisible(true)
      // border = poolObject.border
      // border.setVisible(true)
    }

    // create them from scratch
    else {
      ballSprite = this.add.sprite(posX, posY, 'ball')
      faceSprite = this.add
        .sprite(posX, posY, 'face')
        .setOrigin(0.5, 0)
        // .setDisplaySize(
        //   Math.max(30, GameOptions.bodies[value].size),
        //   Math.max(30, GameOptions.bodies[value].size)
        // )
        .setAlpha(1)
        .setFrame(0)
    }
    faceSprite.setDisplaySize(
      Math.max(30, GameOptions.bodies[value].size),
      Math.max(30, GameOptions.bodies[value].size)
    )
    ballText = this.add
      .text(posX, posY, GameOptions.bodies[value].score, {
        fontFamily: 'Arial',
        fontSize: GameOptions.bodies[value].textSize,
        color: GameOptions.bodies[value].textColor,
        // stroke: '#000000',
        // strokeThickness: 2,
        align: 'center'
      })
      .setDepth(1)
      .setOrigin(0.5, 0.5 + GameOptions.bodies[value].textSize * 0.01)
      .setAlpha(0.5)
    ballText.setVisible(true)

    border = this.add.circle(posX, posY, GameOptions.bodies[value].size)
    // adjust size, tint color and face
    ballSprite.setDisplaySize(
      GameOptions.bodies[value].size * 2,
      GameOptions.bodies[value].size * 2
    )
    ballSprite.setTint(GameOptions.bodies[value].color)
    // const faceFrame: number = Phaser.Math.Between(0, 8)
    // faceSprite.setFrame(faceFrame)

    // create a dynamic body
    const ball: Planck.Body = this.world.createDynamicBody({
      position: new Planck.Vec2(toMeters(posX), toMeters(posY)),
      // gravityScale: 4,
      type: 'dynamic',
      angle: angle,
      // awake: true,
      // active: true
      allowSleep: false
    })

    // setTimeout(() => {
    //   ball.setGravityScale(3)
    // }, 1000)

    // console.log(toMeters(posX), posX)

    // attach a fixture to the body
    ball.createFixture(new Planck.Circle(toMeters(GameOptions.bodies[value].size)), {
      // friction: 0.3,
      // density: 1,
      // restitution: 0.2
      friction: 1,
      density: 5,
      restitution: 0.2
      // filterCategoryBits: BALL_CATEGORY,
      // filterMaskBits: BALL_MASK,
      // filterGroupIndex: BALL_GROUP
      // isSensor: true
    })
    ball.resetMassData()

    const jobScore = this.gameData.job.reduce((ac, el) => {
      return ac + el[1] * GameOptions.bodies[el[0]].score
    }, 0)
    ball.setLinearVelocity(
      new Planck.Vec2(
        0.0,
        !isMinVelocity
          ? clamp(
              ((this.gameData.jobTotal - jobScore) / this.gameData.jobTotal) * 100,
              GameOptions.minVelocity,
              GameOptions.maxVelocity
            )
          : 0
      )
    )

    // ball.setMassData({
    //   mass: 1000,
    //   center: Planck.Vec2(),
    //   I: 100
    // })

    // set some custom user data
    ball.setUserData({
      sprite: ballSprite,
      type: bodyType.BALL,
      value: value,
      id: this.ballsAdded,
      face: faceSprite,
      text: ballText,
      border
    })
    // console.log(posX, posY, value, {
    //   sprite: ballSprite,
    //   type: bodyType.BALL,
    //   value: value,
    //   id: this.ballsAdded,
    //   // face: faceSprite,
    //   text: ballText
    // })

    // keep counting how many balls we added so far
    this.ballsAdded++
    // console.log(ball)
  }

  createFloor(): void {
    this.floorY = this.gameData?.floorY || this.baseStartY

    const floorSprite = this.add
      .tileSprite(this.baseStartX, this.floorY, GameOptions.gameField.width, 32, 'floor')
      .setOrigin(0)
      .setAlpha(0.7)
    // floorSprite.setTint(GameOptions.floorBgColor)

    const floor = this.world.createBody({
      // type: 'kinematic',
      position: new Planck.Vec2(toMeters(this.baseStartX), toMeters(this.floorY))
    })

    // attach a fixture to the body
    floor.createFixture(
      Planck.Edge(
        Planck.Vec2(toMeters(this.baseStartX - 500), toMeters(0)),
        Planck.Vec2(toMeters(this.baseEndX + 500), toMeters(0))
      ),
      // Planck.Chain([
      //   Planck.Vec2(toMeters(this.baseStartX - 50), toMeters(0)),
      //   Planck.Vec2(toMeters(this.baseEndX + 50), toMeters(0)),
      //   Planck.Vec2(toMeters(this.baseStartX - 50), toMeters(500)),
      //   Planck.Vec2(toMeters(this.baseEndX + 50), toMeters(500))
      // ]),
      {
        friction: 1,
        density: 5,
        restitution: 0
      }
    )
    floor.setUserData({
      sprite: floorSprite,
      type: bodyType.WALL
    })

    this.floor = floor
  }

  onSetPositionFloor(y: number) {
    if (this.floorY) {
      // if (this.floor && this.floorY <= d.sprite.y) {
      //   this.floor.setPosition(
      //     Planck.Vec2(this.floor.getPosition().x, this.floor.getPosition().y - 0.01)
      //   )
      //   const p: any = this.floor.getPosition()
      //   d.sprite.setPosition(toPixels(p.x), toPixels(p.y - 0.01))
      //   console.log(p.y, d.sprite.y)
      // }
      // this.tweens.addCounter({
      //   from: this.floorY,
      //   to: y,
      //   onUpdate: (tween) => {
      //     const t = tween.getValue()
      //     this.floor.setPosition(Planck.Vec2(this.floor.getPosition().x, toMeters(t)))
      //     const p: any = this.floor.getPosition()
      //     d.sprite.setPosition(toPixels(p.x), t)
      //     console.log(p.y, d.sprite.y)
      //   },
      //   onComplete: () => {
      //     this.floorY = y
      //   }
      // })

      this.floorY = y
      const d: any = this.floor.getUserData()
      this.add.tween({
        targets: d.sprite,
        y: {
          value: y,
          duration: GameOptions.durationFloor
        },
        onUpdate: () => {
          this.floor.setPosition(Planck.Vec2(toMeters(d.sprite.x - 200), toMeters(d.sprite.y)))
          this.gameData.floorY = this.floorY
        },
        onComplete: () => {
          this.onSaveGameData()
        }
      })
    }
  }

  // method to create a physics polygon
  createPolygon(startX: number, startY: number, endX: number, endY: number): void {
    // create a static body
    const walls: Planck.Body = this.world.createBody({
      position: new Planck.Vec2(toMeters(0), toMeters(0))
    })

    // attach a fixture to the body
    walls.createFixture(
      Planck.Chain([
        Planck.Vec2(toMeters(startX), toMeters(endY)),
        Planck.Vec2(toMeters(startX), toMeters(startY)),
        Planck.Vec2(toMeters(endX), toMeters(startY)),
        Planck.Vec2(toMeters(endX), toMeters(endY))
      ])
    )

    // set some custom user data
    walls.setUserData({
      type: bodyType.WALL
    })

    this.polygon2D = walls
  }

  // method to destroy a ball
  // ball = the ball to be destroyed
  destroyBall(ball: Planck.Body): void {
    // get ball user data
    const userData: any = ball.getUserData()
    if (!userData.face) {
      // console.log(ball, userData)
      return
    }

    // hide the sprites
    userData.sprite.setVisible(false)
    userData.face.setVisible(false)
    userData.text.destroy() //setVisible(false)
    userData.border.destroy() //.setVisible(false)

    // place sprites into pool
    this.objectPool.push({
      sprite: userData.sprite,
      face: userData.face
      // text: userData.text,
      // border: userData.border
    })

    // destroy the physics body
    this.world.destroyBody(ball)

    // remove body id from ids array
    this.ids.splice(this.ids.indexOf(userData.id), 1)
  }

  onLevelCompleted() {
    const sceneNextLevel = this.game.scene.getScene('NextLevel')
    this.scene.pause()
    sceneNextLevel.show()
  }

  onStopGame() {
    this.textEffectPool.forEach((text: Phaser.GameObjects.Text) => {
      text.destroy()
    })
    this.textPool.forEach((text: Phaser.GameObjects.Text) => {
      text.destroy()
    })
    this.textEffectPool = []
    this.textPool = []
  }

  onGameOver() {
    this.onHideBomb()

    const sceneGameOver = this.game.scene.getScene('GameOver')
    this.scene.pause()
    sceneGameOver.show()
    this.onSaveGameData()
    // sceneGameOver.scene.start()
  }

  onNewGame() {
    // remove all balls with a timer event
    const gameOverTimer: Phaser.Time.TimerEvent = this.time.addEvent({
      delay: 10,
      callback: (event: Phaser.Time.TimerEvent) => {
        let body: Planck.Body = this.world.getBodyList() as Planck.Body
        const userData: any = body.getUserData()
        if (userData.type == bodyType.BALL) {
          this.destroyBall(body)
        } else {
          gameOverTimer.remove()
          this.gameData.level = 0
          this.gameData.score = 0
          this.gameData.totalScore = 0
          this.onNewLevel()
          this.currentState = gameState.MOVING
        }
      },

      loop: true
    })
  }

  onContinueGame() {
    if (this.gameOverBody.length) {
      this.gameOverBody.forEach((x) => {
        this.destroyBall(x)
      })
      this.gameOverBody = []
    }
    this.onSetPositionFloor(this.baseStartY)
    this.currentState = gameState.MOVING
    // remove all balls with a timer event
    // const gameOverTimer: Phaser.Time.TimerEvent = this.time.addEvent({
    //   delay: 10,
    //   callback: (event: Phaser.Time.TimerEvent) => {
    //     let body: Planck.Body = this.world.getBodyList() as Planck.Body
    //     const userData: any = body.getUserData()
    //     if (userData.type == bodyType.BALL) {
    //       this.destroyBall(body)
    //     } else {
    //       gameOverTimer.remove()
    //     }
    //   },
    //   loop: true
    // })
  }

  drawLevelJob() {
    //this.jobContainer.destroy()
    this.jobContainer.removeAll(true)
    this.configJob = []

    let marginY = 0
    this.gameData.job.forEach((job, index) => {
      const [i, value] = job
      // if (value === 0) {
      //   return
      // }
      const jobText = this.add
        .text(GameOptions.bodies[i].size / 2 + 20, 0, job[1].toString(), {
          fontFamily: 'Arial',
          fontSize: 35,
          color: GameOptions.ui.primaryColor,
          stroke: '#000000',
          strokeThickness: 1,
          fontStyle: 'bold',
          align: 'right'
        })
        .setOrigin(0.5)
        .setDepth(100)

      const jobTextBg = this.add
        .circle(GameOptions.bodies[i].size / 2 + 20, 0, 30, GameOptions.ui.panelBgColor, 1)
        .setOrigin(0.5)
      const ballOk = this.add
        .sprite(GameOptions.bodies[i].size / 2 + 20, 0, 'ok')
        .setScale(0.2)
        .setTint(GameOptions.ui.successColor.replace('#', '0x'))
        .setOrigin(0.5)
      const ballSprite = this.add.sprite(0, 0, 'ball').setOrigin(0.5)

      ballSprite.setScale(
        GameOptions.bodies[i].size / GameOptions.bodies[GameOptions.bodies.length - 1].size - 0.15
      ) // .setDisplaySize(GameOptions.bodies[i].size, GameOptions.bodies[i].size)
      ballSprite.setTint(GameOptions.bodies[i].color)
      const text = this.add
        .text(0, 0, GameOptions.bodies[i].score, {
          fontFamily: 'Arial',
          fontSize: GameOptions.bodies[i].textSize / 1.5,
          color: GameOptions.bodies[i].textColor,
          // stroke: '#000000',
          // strokeThickness: 4,
          align: 'center'
        })
        .setDepth(1)
        .setAlpha(0.5)
        .setOrigin(0.5)

      const jobBall = this.add.container(0, 0, [ballSprite, text]).setAlpha(1)
      const jobContainer = this.add
        .container(0, marginY, [jobBall, jobTextBg, jobText, ballOk])
        .setScale(1)
      if (value === 0) {
        jobText.setAlpha(0)
        jobBall.setAlpha(0.1)
      } else {
        ballOk.setAlpha(0)
      }
      this.configJob.push({
        job: job,
        position: {
          x: 0,
          y: marginY
        }
      })
      marginY =
        marginY + GameOptions.bodies[Math.min(i + 1, GameOptions.bodies.length - 1)].size * 2 - 15
      this.jobContainer.add(jobContainer)
    })
  }

  onNewLevel() {
    // this.time.addEvent({
    //   delay: 10,
    //   callback: (event: Phaser.Time.TimerEvent) => {
    //     let body: Planck.Body = this.world.getBodyList() as Planck.Body
    //     const userData: any = body.getUserData()
    //     if (userData.type == bodyType.BALL) {
    //       this.updateScore(userData.value - 1)
    //       this.destroyBall(body)
    //     } else {
    //     }
    //   }
    // })

    // this.gameData.totalScore += this.gameData.score
    let newMaxijob = clamp(
      Math.round(this.gameData.level / 5),
      GameOptions.minIndexFindBody + 1,
      GameOptions.bodies.length - 1
    )
    if (newMaxijob > GameOptions.bodies.length - 1) {
      newMaxijob = GameOptions.bodies.length - 1
    }

    this.gameData.maxijob = newMaxijob
    const levelJob = []
    const countJobs = [...Array(GameOptions.bodies.length).keys()].slice(
      GameOptions.minIndexFindBody,
      this.gameData.maxijob
    )

    countJobs.forEach((element: number) => {
      // const i = GameOptions.bodies.length - element
      levelJob.push([element, getRandomInt(1, GameOptions.bodies[element].max)])
    })

    this.gameData.job = this.gameData.job.length ? levelJob : GameOptions.startJob
    this.gameData.jobTotal = this.gameData.job.reduce((ac, el) => {
      return ac + el[1] * GameOptions.bodies[el[0]].score
    }, 0)
    this.drawLevelJob()
    this.onSetPositionFloor(this.baseStartY)
    this.gameData.level++
    this.gameData.score = 0
    this.gameData.countBall = 0
    this.gameData.levelScore =
      GameOptions.minNeedValueScoreByLevel + this.gameData.level * GameOptions.koofLevel
    this.onSetScore()

    // console.log('onNewLevel: ', this.gameData)
    // console.log('NextScore: ', this.gameData.levelScore)
    this.onSaveGameData()

    if (this.triggerTimerNewBall) {
      this.maxTimeWait = GameOptions.timerNewBall.maxTimeWait
      this.triggerTimerNewBall.reset(this.configTimerNewBall)
    }
  }

  onSaveGameData() {
    // setTimeout(() => {
    const bodies = []
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      const userData: any = body.getUserData()
      if (userData.value !== undefined) {
        const pos = body.getPosition()
        bodies.push({
          x: Number(pos.x.toFixed(1)),
          y: Number(pos.y.toFixed(1)),
          v: userData?.value,
          a: Number(body.getAngle().toFixed(1))
        })
      }
      // for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {}
    }
    this.gameData.floorY = this.floorY
    this.gameData.tree = bodies

    // save data.
    // this.onSaveGameData()
    // }, 1000)
    EventBus.emit('save-data', this.gameData)
  }

  // method to update the score
  // n = ball from which to compute the score
  updateScore(n: number): void {
    // check exist job.
    const indexJob = this.gameData.job.findIndex((x) => x[0] === n)
    if (indexJob !== -1) {
      if (this.gameData.job[indexJob][1] > 0) {
        const pos = this.configJob[indexJob].position
        this.gojob.play()
        const particl = this.add.particles(
          this.jobContainer.x + pos.x,
          this.jobContainer.y + pos.y,
          'rocket',
          {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            angle: { start: 0, end: 360, steps: 100 },
            rotate: { onEmit: updateParticleRotation, onUpdate: updateParticleRotation },
            blendMode: 'ADD',
            gravityY: 512,
            color: [GameOptions.bodies[n].color],
            frequency: 10,
            lifespan: 1000,
            quantity: 100,
            duration: 50,
            reserve: 500,
            scaleX: { onUpdate: (p) => Phaser.Math.Easing.Cubic.Out(1 - p.lifeT) },
            speed: { min: 128, max: 512 }
          }
        )
        setTimeout(() => {
          particl.destroy()
        }, 1500)
      }

      this.gameData.job[indexJob][1] = Math.max(0, this.gameData.job[indexJob][1] - 1)
      this.drawLevelJob()
    }

    // add score according to ball value
    this.gameData.score += GameOptions.bodies[n].score
    this.gameData.totalScore += GameOptions.bodies[n].score

    // did the score beat the best score
    if (this.gameData.totalScore > this.gameData.bestScore) {
      // update best score into savedData object
      this.gameData.bestScore = this.gameData.totalScore
    }
    // update score text
    this.onSetScore()
  }

  onSetScore() {
    this.scoreText.setText(this.gameData.totalScore.toString())
    this.levelText.setText(`${this.lang?.level || '#level'} ${this.gameData.level}`)
    this.currentScoreText.setText(`${this.lang?.current_score || '#current_score'}`)

    // progress level.
    const width = Math.min(
      GameOptions.screen.width,
      (GameOptions.screen.width / this.gameData?.levelScore) * this.gameData?.score
    )
    const delayFloor =
      GameOptions.maxTimeForChangeFloorY - this.gameData.countBall * GameOptions.koofLevel
    // GameOptions.maxTimeForChangeFloorY * (width / GameOptions.screen.width)
    this.configTimerFloor.delay = Math.max(GameOptions.minTimeForChangeFloorY, delayFloor)
    // console.log(
    //   'configTimerFloor.delay=',
    //   this.configTimerFloor.delay,
    //   this.gameData.countBall * GameOptions.koofLevel,
    //   this.gameData.countBall
    // )

    // this.triggerChangeFloor.reset(this.configTimerFloor)

    if (this.tweenProgressScore) {
      this.tweenProgressScore.destroy()
    }
    this.tweenProgressScore = this.add.tween({
      targets: this.progressScore,
      width: {
        value: width,
        duration: 200,
        ease: 'Back.linear'
      },
      onComplete: () => {
        const isCompleteJob = this.gameData.job.filter((x) => x[1] !== 0)
        if (isCompleteJob.length === 0) {
          this.onLevelCompleted()
        }
        // console.log('gameData: ', this.gameData)
        // if (this.gameData.score >= this.gameData.levelScore) {
        //   this.onLevelCompleted()
        // }
      }
    })
  }

  drawFixture(fixture) {
    let bodyCollision = fixture.getBody()
    // let xf = bodyCollision.getTransform()
    // let userData = bodyCollision.getUserData()
    this.destroyBall(bodyCollision)

    // switch (fixture.getType()) {
    //   case 'circle':
    //     {
    //       // let circle = fixture.getShape()

    //       // let center = Planck.Transform.mul(xf, circle.getCenter())
    //       // let radius = circle.getRadius()
    //       // console.log('Draw circle', userData.value)
    //       this.destroyBall(bodyCollision)
    //       //  testbed.drawCircle(center, radius, color);
    //     }
    //     break

    //   case 'polygon':
    //     {
    //       let poly = fixture.getShape()
    //       let vertexCount = poly.m_count
    //       // assert(vertexCount <= b2_maxPolygonVertices);
    //       let vertices = poly.m_vertices.map((v) => Planck.Transform.mul(xf, v))
    //       // testbed.drawPolygon(vertices, color);

    //       console.log('Draw polygon')
    //     }
    //     break

    //   default:
    //     break
    // }
  }

  AABBQueryListener() {
    let def: any = {}

    // def.circle = new Planck.Circle(new Planck.Vec2(0.0, 1.1), 4.0)
    def.transform = new Planck.Transform()
    let count = 0

    let MAX_COUNT = 40

    def.circle = this.bombCircle
    def.reset = function () {
      // console.log('Reset')
      count = 0
    }
    // Called for each fixture found in the query AABB.
    // return false to terminate the query.
    def.callback = (fixture) => {
      // console.log('callback')
      if (count === MAX_COUNT) {
        return false
      }

      let body = fixture.getBody()
      let shape = fixture.getShape()

      let overlap = Planck.Distance.testOverlap(
        shape,
        0,
        this.bombCircle, // def.circle,
        0,
        body.getTransform(),
        def.transform
      )

      if (overlap) {
        this.drawFixture(fixture)
        ++count
      }

      return true
    }

    return def
  }

  // method to be executed at each frame
  // n deltaTime : time, in milliseconds, passed since previous "update" call
  update(totalTime: number, deltaTime: number): void {
    if (!this.gameData.bomb || this.gameData.bomb === 0) {
      // this.buttonBombBg.setAlpha(0.8)
      this.buttonBombCounterContainer.setVisible(false)
    } else {
      this.buttonBombCounterContainer.setVisible(true)
      // this.buttonBombBg.setAlpha(1)
    }
    // const currentLevelValue = (this.progressScore.width / GameOptions.screen.width) * 100
    // switch (true) {
    //   case currentLevelValue > 80:
    //     // setTint(0xca8a04)
    //     break
    //   case currentLevelValue > 60 && currentLevelValue <= 80:
    //     this.shipFace.setTint(0xa16207)
    //     break
    //   case currentLevelValue > 40 && currentLevelValue <= 60:
    //     this.shipFace.setTint(0x854d0e)
    //     break
    //   case currentLevelValue > 20 && currentLevelValue <= 40:
    //     this.shipFace.setTint(0x713f12)
    //     break
    //   default:
    //     this.graphics.setsty({ width: 2, color: GameOptions.ui.pathColor })
    //     // this.shipFace.setTint(0x525252)
    //     break
    // }

    // progress new ball.
    if (this.triggerTimerNewBall) {
      this.progressBarNewBall.height =
        GameOptions.timerNewBall.heightProgress *
        (this.triggerTimerNewBall.elapsed / this.maxTimeWait)
      if (this.progressBarNewBall.height > 0) {
        this.progressBarNewBall.height -= 1
      }
    }

    // if (this.floorY) {
    //   const d: any = this.floor.getUserData()
    //   if (d.sprite.y >= this.floorY) {
    //     this.floor.setPosition(
    //       Planck.Vec2(this.floor.getPosition().x, this.floor.getPosition().y - 0.01)
    //     )
    //     const p: any = this.floor.getPosition()
    //     d.sprite.setPosition(toPixels(p.x), toPixels(p.y - 0.01))
    //     console.log(p.y, d.sprite.y)
    //   }
    // }

    // advance world simulation
    this.world.step(deltaTime / 1000, 10, 8)
    this.world.clearForces()

    // detect collision bomb
    if (this.currentState === gameState.MOVEBOMB) {
      this.AABBQueryListener().reset()
      let aabb = new Planck.AABB()
      this.bombCircle.computeAABB(aabb, this.AABBQueryListener().transform, 0)
      this.world.queryAABB(aabb, this.AABBQueryListener().callback)
    }

    // is there any contact to manage?
    if (this.contactManagement.length > 0) {
      // loop through all contacts
      this.contactManagement.forEach((contact: any) => {
        // set the emitters to explode
        this.emitters[contact.value - 1].explode(
          50 * contact.value,
          toPixels(contact.body1.getPosition().x),
          toPixels(contact.body1.getPosition().y)
        )
        this.emitters[contact.value - 1].explode(
          50 * contact.value,
          toPixels(contact.body2.getPosition().x),
          toPixels(contact.body2.getPosition().y)
        )

        const userData1 = contact.body1.getUserData()
        const userData2 = contact.body2.getUserData()
        const valueBall1 = GameOptions.bodies[userData1.value].score
        const valueBall2 = GameOptions.bodies[userData2.value].score
        if (
          valueBall1 === GameOptions.maxBallSizeForAddBonusBomb &&
          valueBall2 === GameOptions.maxBallSizeForAddBonusBomb &&
          this.currentState !== gameState.BOMBING
        ) {
          this.addBonusBomb(this.lang.add_bomb_max || '#add_bomb_max')
        }

        // destroy the balls after some delay, useful to display explosions or whatever
        this.time.addEvent({
          delay: 10,
          callback: () => {
            this.updateScore(contact.value - 1)
            this.destroyBall(contact.body1)
            this.destroyBall(contact.body2)
          }
        })

        // determining blast radius, which is actually a square, but who cares?
        const query: Planck.AABB = new Planck.AABB(
          new Planck.Vec2(
            contact.point.x - toMeters(GameOptions.blast.radius),
            contact.point.y - toMeters(GameOptions.blast.radius)
          ),
          new Planck.Vec2(
            contact.point.x + toMeters(GameOptions.blast.radius),
            contact.point.y + toMeters(GameOptions.blast.radius)
          )
        )

        // query the world for fixtures inside the square, aka "radius"
        this.world.queryAABB(query, (fixture: Planck.Fixture) => {
          const body: Planck.Body = fixture.getBody()
          const bodyPosition: Planck.Vec2 = body.getPosition()

          // just in case you need the body distance from the center of the blast. I am not using it.
          const bodyDistance: number = Math.sqrt(
            Math.pow(bodyPosition.x - contact.point.x, 2) +
              Math.pow(bodyPosition.y - contact.point.y, 2)
          )
          const angle: number = Math.atan2(
            bodyPosition.y - contact.point.y,
            bodyPosition.x - contact.point.x
          )

          // the explosion effect itself is just a linear velocity applied to bodies
          body.setLinearVelocity(
            new Planck.Vec2(
              GameOptions.blast.impulse * Math.cos(angle),
              GameOptions.blast.impulse * Math.sin(angle)
            )
          )

          // true = keep querying the world
          return true
        })

        // little delay before creating next ball, be used for a spawn animation
        this.time.addEvent({
          delay: 100,
          callback: () => {
            if (contact.value < GameOptions.bodies.length) {
              this.createBall(
                toPixels(contact.point.x),
                toPixels(contact.point.y),
                contact.value,
                0,
                true
              )

              const t = this.add
                .text(
                  toPixels(contact.point.x),
                  toPixels(contact.point.y),
                  `+${GameOptions.bodies[contact.value - 1].score}`,
                  {
                    fontFamily: 'Arial',
                    fontSize: 50,
                    color: '#ffffff',
                    // stroke: '#ffffff',
                    // strokeThickness: 0,
                    fontStyle: 'bold',
                    align: 'center'
                  }
                )
                .setDepth(100)
                .setOrigin(0.5)

              if (
                getDifferenceTime(this.lastDateDestroyLastBall, new Date()) <
                GameOptions.debounceCheckSeria
              ) {
                this.countSeriaDestroy += 1
              } else {
                this.countSeriaDestroy = 0
              }

              this.lastDateDestroyLastBall = new Date()
              this.textPool.push(t)
            }
          }
        })

        this.debounceFunction(contact)
        // console.log(
        //   'refresh lastDateDestroyLastBall: ',
        //   getDifferenceTime(this.lastDateDestroyLastBall, new Date())
        // )
        // if (getDifferenceTime(this.lastDateDestroyLastBall, new Date()) < 300) {
        // } else if (this.textPool.length > 1) {
        //   const te = this.add
        //     .text(
        //       toPixels(contact.point.x),
        //       toPixels(contact.point.y),
        //       // `x${this.textPool.length}`,
        //       this.lang.bonusText[this.textPool.length] ||
        //         this.lang.bonusText[this.lang.bonusText.length - 1],
        //       {
        //         fontFamily: 'Arial Black',
        //         fontSize: 50,
        //         color: '#000000',
        //         stroke: '#6530ac',
        //         // strokeThickness: 0,
        //         align: 'center'
        //       }
        //     )
        //     .setDepth(100)
        //     .setOrigin(0.5)

        //   this.textEffectPool.push(te)
        //   // console.log('combo=', this.textEffectPool.length)
        //   this.diffTimeAddBomb = getDifferenceTime(this.lastDateAddBomb, new Date())
        //   // console.log(
        //   //   'diffTimeAddBomb: ',
        //   //   diffTimeAddBomb,
        //   //   diffTimeAddBomb > GameOptions.rangeDateAddBomb,
        //   //   this.textEffectPool.length,
        //   //   GameOptions.maxBallForBomb
        //   // )
        //   if (
        //     this.textEffectPool.length >= GameOptions.maxBallForBomb &&
        //     this.currentState !== gameState.BOMBING &&
        //     this.diffTimeAddBomb > GameOptions.rangeDateAddBomb
        //   ) {
        //     // console.log('Add bomb')
        //     this.lastDateAddBomb = new Date()
        //     // // this.onCreateBomb()
        //     // if (window && window.onHappyTime) {
        //     //   window.onHappyTime()
        //     // }
        //     // this.onAddBomb()
        //     this.addBonusBomb(this.lang.add_bomb_seria || '#add_bomb_seria')
        //   }
        // }

        // this.lastDateDestroyLastBall = new Date()
      })

      // empty contactManagement array
      this.contactManagement = []
    }

    // Show text.
    if (this.textPool.length > 0) {
      const destroyedTexts = []
      this.textPool.forEach((text: Phaser.GameObjects.Text) => {
        text.y -= 1
        // text.setFontSize(Number(text.style.fontSize.toString().replace('px', '')) + 1)
        text.setAlpha(text.alpha - 0.006)
        if (text.alpha <= 0) {
          text.destroy()
          destroyedTexts.push(text)
        }
      })
      this.textPool = this.textPool.filter((x) => !destroyedTexts.includes(x))
      // console.log('Count texts = ', this.textPool.length)
    }

    // Show text effects.
    if (this.textEffectPool.length > 0) {
      const destroyedEffectTexts = []

      this.textEffectPool.forEach((text: Phaser.GameObjects.Text) => {
        text.y -= 0.5
        // text.setFontSize(Number(text.style.fontSize.toString().replace('px', '')) + 1)
        text.setAlpha(text.alpha - 0.005)
        if (text.alpha <= 0) {
          text.destroy()
          destroyedEffectTexts.push(text)
        }
      })
      this.textEffectPool = this.textEffectPool.filter((x) => !destroyedEffectTexts.includes(x))
      // console.log('Count textEffectPool = ', this.textEffectPool.length)
    }

    // loop through all bodies
    for (
      let body: Planck.Body = this.world.getBodyList() as Planck.Body;
      body;
      body = body.getNext() as Planck.Body
    ) {
      // get body user data
      const userData: any = body.getUserData()

      // is it a ball?
      if (userData.type == bodyType.BALL || userData.type == bodyType.BOMB) {
        // get body position
        const bodyPosition: Planck.Vec2 = body.getPosition()

        // console.log(bodyPosition)

        // get body angle
        const bodyAngle: number = body.getAngle()

        // update sprite position and rotation accordingly
        userData.sprite.setPosition(toPixels(bodyPosition.x), toPixels(bodyPosition.y))
        userData.border?.setPosition(toPixels(bodyPosition.x), toPixels(bodyPosition.y))
        userData.sprite.setRotation(bodyAngle)
        userData.face.setPosition(toPixels(bodyPosition.x), toPixels(bodyPosition.y))
        userData.face.setRotation(bodyAngle)
        if (userData.text) {
          userData.text.setPosition(toPixels(bodyPosition.x), toPixels(bodyPosition.y))
          userData.text.setRotation(bodyAngle)
        }

        // if a ball falls off the screen...
        // gameHeight -
        //         GameOptions.gameField.distanceFromBottom -
        //         GameOptions.gameField.height -
        //         100
        // || userData.sprite.y < GameOptions.gameField.y
        const gameHeight: number = this.game.config.height as number
        const leftRange = (Number(this.game.config.width) - GameOptions.gameField.width) / 2
        const rightRange = leftRange + GameOptions.gameField.width

        if (
          userData.sprite.y <
            this.baseStartY -
              GameOptions.gameField.height +
              GameOptions.bodies[userData.value].size &&
          this.ballsAdded - 1 !== userData.id
        ) {
          userData.border.setStrokeStyle(2, 0xff0000)
        } else {
          userData.border.setStrokeStyle(0, 0xff0000)
        }

        if (
          (userData.sprite.x < leftRange - 40 ||
            userData.sprite.x > rightRange + 40 ||
            userData.sprite.y > gameHeight) &&
          // userData.sprite.y < this.baseStartY - GameOptions.gameField.height
          this.currentState != gameState.GAMEOVER
        ) {
          // ... it's game over
          this.currentState = gameState.GAMEOVER

          // set dummy ball to invisible
          // this.dummyBalls[this.currentBallValue].setVisible(false)
          this.gameOverBody.push(body)

          // remove all balls with a timer event
          // const gameOverTimer: Phaser.Time.TimerEvent = this.time.addEvent({
          //   delay: 10,
          //   callback: (event: Phaser.Time.TimerEvent) => {
          //     let body: Planck.Body = this.world.getBodyList() as Planck.Body
          //     const userData: any = body.getUserData()
          //     if (userData.type == bodyType.BALL) {
          //       this.destroyBall(body)
          //     } else {
          //       gameOverTimer.remove()

          //       // restart game scene
          //       // this.scene.start('GameOver')
          //       this.onGameOver()
          //     }
          //   },
          //   loop: true
          // })
          this.onGameOver()
        }
      }

      // this.bombTest.setY(toPixels(this.bomb.y))
      // this.bombTest.setX(toPixels(this.bomb.x))
      // this.bombTest.setRadius(GameOptions.bodies[this.currentBallValue].size)
    }
  }

  onAddBomb() {
    if (!this.gameData.bomb) {
      this.gameData.bomb = 0
    }
    this.gameData.bomb += 1
    this.buttonBombCounterText.setText(this.gameData.bomb.toString())
  }

  onCreateBomb(forceNull) {
    if (this.gameData.bomb > 0 || forceNull) {
      this.currentState = gameState.BOMBING
      if (!forceNull) {
        this.gameData.bomb -= 1
      }
      this.buttonBombCounterText.setText((this.gameData.bomb || '').toString())

      this.graphics.clear()
      this.bomb.setVisible(true)
      this.fire.play()
      this.buttonRotate.setAlpha(0.2)
      this.buttonBombContainer.setAlpha(0.2)
    }
  }

  onRunBomb() {
    this.currentState = gameState.MOVEBOMB
    this.newBallPath.setVisible(false)

    this.add.tween({
      targets: this.bomb,
      y: {
        value: GameOptions.screen.height + 400,
        duration: 1500
      },
      onUpdate: () => {
        this.bombCircle.m_p = new Planck.Vec2(toMeters(this.bomb.x), toMeters(this.bomb.y))
        // console.log('this.bombCircle.m_p', this.bombCircle.m_p)
      },
      onComplete: () => {
        this.onHideBomb()
      }
    })
  }

  onHideBomb() {
    this.bomb.setVisible(false)
    this.fire.stop()
    this.bomb.setY(GameOptions.gameField.y)
    this.currentState = gameState.MOVING
    this.buttonRotate.setAlpha(1)
    this.buttonBombContainer.setAlpha(1)
  }

  onResetProgressNewBall() {
    if (!this.triggerTimerNewBall) {
      return
    }

    this.configTimerNewBall.delay = this.maxTimeWait
    this.triggerTimerNewBall.reset(this.configTimerNewBall)

    this.progressBarNewBall.height = GameOptions.timerNewBall.heightProgress
  }

  addBonusBomb(text: string) {
    this.onAddBomb()
    // setTimeout(() => {
    if (window && window.onHappyTime) {
      window.onHappyTime()
    }
    if (!this.scene.isPaused()) {
      this.scene.get('Message').showMessageAddBonusBomb(text)
    }
    // }, 500)
  }

  checkSeria(contact) {
    // console.log('checkSeria: contact=', contact)
    // console.log(
    //   'refresh lastDateDestroyLastBall: ',
    //   getDifferenceTime(this.lastDateDestroyLastBall, new Date()),
    //   this.countSeriaDestroy
    // )

    if (this.countSeriaDestroy > 0) {
      this.onSetPositionFloor(
        Math.min(
          this.baseStartY,
          this.floorY + this.countSeriaDestroy * GameOptions.stepChangeFloor
        )
      )

      const indexText =
        this.countSeriaDestroy >= this.lang.bonusText.length
          ? this.lang.bonusText.length - 1
          : this.countSeriaDestroy
      const te = this.add
        .text(
          toPixels(contact.point.x),
          toPixels(contact.point.y),
          // `x${this.countSeriaDestroy}`,
          this.lang.bonusText[indexText] ? `${this.lang.bonusText[indexText]}!` : '',
          {
            fontFamily: 'Arial',
            fontSize: 60,
            color: '#ffffff',
            // stroke: '#000000',
            // strokeThickness: 2,
            fontStyle: 'bold',
            align: 'center'
          }
        )
        .setDepth(100)
        .setOrigin(0.5)

      this.textEffectPool.push(te)
      // this.lastDateDestroyLastBall = new Date()
      // console.log('combo=', this.textEffectPool.length)
      // this.diffTimeAddBomb = getDifferenceTime(this.lastDateAddBomb, new Date())
      if (
        this.countSeriaDestroy >= GameOptions.maxBallForBomb &&
        this.currentState !== gameState.BOMBING
      ) {
        this.addBonusBomb(this.lang.add_bomb_seria || '#add_bomb_seria')
      }
    }
  }

  changeLocale(lang: TLang) {
    this.lang = lang

    this.jobText?.setText(`${this.lang?.job || '#job'}`)
    this.levelText?.setText(`${this.lang?.level || '#level'} ${this.gameData.level}`)
    this.currentScoreText?.setText(`${this.lang?.current_score || '#current_score'}`)
    if (this.gameData) {
      this.gameData.lang = lang.code
    }
  }
}
