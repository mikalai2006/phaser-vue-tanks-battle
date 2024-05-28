import Phaser from 'phaser'
import {
  createWorld,
  addEntity,
  addComponent,
  pipe,
  deleteWorld,
  resetWorld,
  defineQuery,
  getAllEntities,
  removeEntity,
  setDefaultSize,
  getWorldComponents
} from 'bitecs'
import PF from 'pathfinding'

import type { IWorld, System } from 'bitecs'

import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick'

import { Tank } from '../components/Tank'
import Position from '../components/Position'
import Velocity from '../components/Velocity'
import Rotation from '../components/Rotation'
import { Player } from '../components/Player'
import AI, { StatusAI } from '../components/AI'
import Input from '../components/Input'

import {
  createMatterPhysicsSyncSystem,
  createMatterPhysicsSystem,
  createMatterSpriteSystem,
  tanksById
} from '../systems/matter'

import createInputSystem from '../systems/input'
import createAIMoveRandomSystem from '../systems/aiMoveRandom'
import { createSteeringSystem } from '../systems/steer'
import createRaycastSystem from '../systems/raycast'
import RotationTower from '../components/RotationTower'
import { GameOptions, WeaponType, bulletCategory, mapObjectCategory } from '../options/gameOptions'
import { createAreaEyeSyncSystem, createAreaEyeSystem } from '../systems/areaEye'
import { createEntityBarSyncSystem, createEntityBarSystem } from '../systems/entityBar'
import createAIMoveToSystem from '../systems/aiMoveTo'
import createAIManagerSystem from '../systems/aiManager'
import { createLightSyncSystem, createLightSystem } from '../systems/light'
import { WeaponObject } from '../objects/WeaponObject'
import { Entity } from '../components/Entity'
import { Effect } from '../objects/Effects'
import { createBonusSyncSystem, createBonusSystem } from '../systems/bonus'
import { createMarkersSyncSystem, createMarkersSystem } from '../systems/markers'
import {
  generateName,
  getRank,
  getSupportWeapons,
  getTrimName,
  isProbability,
  shuffle
} from '../utils/utils'
import { createTeamBarSyncSystem, createTeamBarSystem } from '../systems/teamBar'
import { TeamBar } from '../objects/TeamBar'
import {
  IConfigRound,
  IConfigRoundTeamPlayer,
  IGameData,
  IPlayerData,
  KeyParticles,
  KeySound,
  TLang
} from '../types'
import { StaticObject } from '../components/MatterStaticSprite'
import { createDestroyObjectsSystem } from '../systems/destroyObjects'
import { createEntityBarBonusesSystem as createBonusBarSystem } from '../systems/bonusBar'
import { Weapon } from '../components/Weapon'
import { createWeaponSystem } from '../systems/weapon'
import { createWeaponBarSystem } from '../systems/weaponBar'
import { createFireSystem } from '../systems/fire'
import createAIWeaponSystem from '../systems/aiWeapon'
import { createPlayerBarSyncSystem, createPlayerBarSystem } from '../systems/playerBar'
import { groupBy } from 'lodash'
import { EventBus } from '../EventBus'
import { createDebugBarSyncSystem, createDebugBarSystem } from '../systems/debugBar'
import { createAloneBarSyncSystem, createAloneBarSystem } from '../systems/aloneBar'
import { createHintSyncSystem, createHintSystem } from '../systems/hint'
import { userNames } from '../utils/names'

export default class Game extends Phaser.Scene {
  public gameData: IGameData
  public playerData: IPlayerData
  public lang: TLang

  public keys!: {
    a: Phaser.Input.Keyboard.Key
    s: Phaser.Input.Keyboard.Key
    d: Phaser.Input.Keyboard.Key
    w: Phaser.Input.Keyboard.Key
  }
  private cursors!:
    | Phaser.Types.Input.Keyboard.CursorKeys
    | {
        up: Phaser.Input.Keyboard.Key
        down: Phaser.Input.Keyboard.Key
        left: Phaser.Input.Keyboard.Key
        right: Phaser.Input.Keyboard.Key
      }
  private joystikMove: VirtualJoyStick
  public buttonFire: Phaser.GameObjects.Sprite
  public containerHello: Phaser.GameObjects.Container

  public configRound: IConfigRound

  private world!: IWorld

  public isMute: boolean = true
  public idFollower: number = -1
  public idPlayer: number = -1
  public roundCoin: number = 0
  public isPauseAI: boolean = true
  public isRoundEnd: boolean = false
  public isFire: boolean
  public emitterDestroyTank: Phaser.GameObjects.Particles.ParticleEmitter

  private fpsText: Phaser.GameObjects.Text
  private steerSystem!: System
  private matterSystem!: System
  // private cpuSystem!: System
  // private movementSystem!: System
  // private spriteSystem!: System

  private pipeline?: (world: IWorld) => void
  private afterPhysicsPipeline?: (world: IWorld) => void

  private grid: PF.Grid
  public gridForAP: number[][]

  public bullets = new Map<WeaponType, WeaponObject[]>()
  public effects: Effect
  public teamBar: TeamBar

  private map: Phaser.Tilemaps.Tilemap
  public minimap: Phaser.Cameras.Scene2D.Camera

  private groundTilesLayer: Phaser.Tilemaps.TilemapLayer
  // private effectsTilesLayer: Phaser.Tilemaps.TilemapLayer
  public names: Map<number, string> = new Map()
  public prob: any = {}

  constructor() {
    super('Game')
  }

  init() {
    // console.log(this.game.events)

    this.game.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this)
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur, this)

    // create container with effects.
    this.effects = new Effect(this, 0, 0)

    this.emitterDestroyTank = this.add
      .particles(0, 0, KeyParticles.SmokeBoom, {
        frame: 1,
        //color: [0x111111, 0x40942f, 0xf89800, 0x222222],
        color: [0x555555, 0xffd189, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 1.5, end: 0, ease: 'sine.out' },
        speed: { random: [30, 100] },
        lifespan: { random: [1000, 2000] },
        blendMode: 'ADD',
        // advance: 1000,
        // duration: 500,

        emitting: false,
        // quantity: 5,
        // speed: { random: [50, 100] },
        // lifespan: { random: [200, 400] },
        // scale: { random: true, start: 0.5, end: 0 },
        rotate: { random: true, start: 0, end: 180 }
        // color: [0x666666, 0xffd189, 0x222222],
        // colorEase: 'quad.out'
        // // angle: { random: true, start: 0, end: 270 }
      })
      .setDepth(999)

    // choose keyboard.
    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W
      // one: Phaser.Input.Keyboard.KeyCodes.ONE,
      // two: Phaser.Input.Keyboard.KeyCodes.TWO,
      // three: Phaser.Input.Keyboard.KeyCodes.THREE,
      // four: Phaser.Input.Keyboard.KeyCodes.FOUR,
      // five: Phaser.Input.Keyboard.KeyCodes.FIVE
    })
    if (this.sys.game.device.os.desktop) {
      this.cursors = this.input.keyboard.createCursorKeys()
    } else {
      this.input.addPointer(1)
    }

    const onAfterUpdate = () => {
      if (!this.afterPhysicsPipeline || !this.world) {
        return
      }

      this.afterPhysicsPipeline(this.world)
    }

    this.matter.world.on(Phaser.Physics.Matter.Events.AFTER_UPDATE, onAfterUpdate)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.matter.world.off(Phaser.Physics.Matter.Events.AFTER_UPDATE, onAfterUpdate)
    })

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this.game.events.off(Phaser.Core.Events.FOCUS, this.onFocus)
      this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur)
    })

    // this.cameras.main.on(
    //   'followupdate',
    //   (camera: Phaser.Cameras.Scene2D.Camera, follower: Phaser.GameObjects.GameObject) => {
    //     console.log(
    //       follower.body.position,
    //       this.cameras.main.scrollY % 2,
    //       this.cameras.main.scrollX % 2
    //     )
    //   }
    // )
  }

  // preload() {
  //   this.load.image('tank-blue', 'assets/tank_blue.png')
  //   this.load.image('tank-green', 'assets/tank_green.png')
  //   this.load.image('tank-red', 'assets/tank_red.png')
  // }

  create({ lang, data, playerData }) {
    // this.game.scale.scaleMode = Phaser.Scale.RESIZE
    this.lang = lang
    this.gameData = data
    this.playerData = playerData
    // console.log(this.rexUI)

    // const { width, height } = this.scale
    // console.log(width, height)

    // // create queue toast
    // this.toastQueue = this.rexUI.add.toastQueue(this, {
    //   x: 200,
    //   y: 280,
    //   originY: 0,
    //   space: { item: 10 },
    //   queueDirection: 'top-to-bottom',
    //   createMessageLabelCallback(scene, message) {
    //     return scene.rexUI.add.label({
    //       width: 240,
    //       space: { left: 10, right: 10, top: 10, bottom: 10 },
    //       background: scene.rexUI.add.roundRectangle({
    //         color: GameOptions.colors.darkColor,
    //         radius: 1
    //       }),
    //       text: scene.add.text(0, 0, message, { fontSize: 20 }),
    //       wrapText: true
    //     })
    //   },

    //   duration: {
    //     hold: 4000
    //   }
    // })

    // animations.
    // this.anims.create({
    //   key: 'explodeAnimation',
    //   frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23, first: 23 }),
    //   frameRate: 20,
    //   repeat: 0
    // })
    // camera.
    this.cameras.main.setBounds(0, 0, 6400, 6400).setName('main')

    // mini camera.
    // this.minimap = this.cameras
    //   .add(
    //     GameOptions.screen.width - GameOptions.minicameraW - GameOptions.minicameraOffset,
    //     GameOptions.minicameraOffset,
    //     GameOptions.minicameraW,
    //     GameOptions.minicameraH
    //   )
    //   .setZoom(GameOptions.minicameraZoom)
    //   .setName('mini')
    // this.minimap.setBackgroundColor(0x000000)
    // this.minimap.disableCull = false
    // this.minimap.inputEnabled = false

    // // border minimap
    // const borderMinimap = this.add
    //   .image(
    //     GameOptions.screen.width - GameOptions.minicameraW / 2 - GameOptions.minicameraOffset,
    //     GameOptions.minicameraOffset + GameOptions.minicameraH / 2,
    //     'minimapBg'
    //   )
    //   .setScale(0.72)
    // // this.add.graphics({})
    // // borderMinimap.fillStyle(0x0f172a)
    // // borderMinimap.fillCircle(
    // //   GameOptions.screen.width - GameOptions.minicameraW / 2 - GameOptions.minicameraOffset,
    // //   GameOptions.minicameraOffset + GameOptions.minicameraH / 2,
    // //   GameOptions.minicameraW / 2 + 10
    // // )
    // borderMinimap.setDepth(999999).setScrollFactor(0)

    // // mask minimap
    // const maskGraphics = this.make.graphics()
    // maskGraphics.fillStyle(0xffffff)
    // maskGraphics.fillCircle(
    //   GameOptions.screen.width - GameOptions.minicameraW / 2 - GameOptions.minicameraOffset,
    //   GameOptions.minicameraOffset + GameOptions.minicameraH / 2,
    //   GameOptions.minicameraW / 2
    // )
    // const mas = new Phaser.Display.Masks.BitmapMask(this, maskGraphics)
    // this.minimap.setMask(mas, true)
    // this.minimap.ignore(maskGraphics)
    // this.minimap.ignore(borderMinimap)

    // hud.
    // const hud = this.add
    //   .nineslice(
    //     0,
    //     0,
    //     'borderMap',
    //     0,
    //     GameOptions.screen.width,
    //     GameOptions.screen.height,
    //     100,
    //     100,
    //     100,
    //     100
    //   )
    //   .setDepth(999999)
    //   .setOrigin(0)
    //   .setScrollFactor(0)
    //   .setTint(0x333333)
    // this.minimap.ignore(hud)

    // Create round data.
    const activeTankIndexByComplex = GameOptions.complexTanks.findIndex(
      (x) => x.id == this.gameData.tanks[this.gameData.activeTankIndex].id
    )
    this.configRound = {
      playerIndexTank: activeTankIndexByComplex,
      teams: [],
      night: this.sys.game.device.os.desktop ? isProbability(0.2) : false,
      config: GameOptions.typesRound[Phaser.Math.Between(0, GameOptions.typesRound.length - 1)] // Phaser.Math.Between(0, GameOptions.typesRound.length - 1)
    }

    // map.
    this.map = this.make.tilemap({ key: this.configRound.config.mapKey })
    this.matter.world.setBounds(0, 0, this.map.width, this.map.height)
    // tiles.
    const groundTiles = this.map.addTilesetImage('tiles', 'tiles', 128, 128)
    const mapObjectsTiles = this.map.addTilesetImage('tileMapObjects', 'mapObjects', 128, 128)
    this.groundTilesLayer = this.map.createLayer('Ground', groundTiles)

    // const effectTiles = this.map.addTilesetImage('effects', 'effects', 128, 128)
    // this.effectsTilesLayer = this.map.createLayer('Effects', effectTiles).setDepth(99999)
    // // this.map
    // //   .createBlankLayer('Effects2', effectTiles, 0, 0, 50, 50, 128, 128)
    // //   .setDepth(99999)
    // // const a = new Phaser.Tilemaps.Tile(this.effectsTilesLayer.layer, 84, 3, 3, 128, 128, 128, 128) //this.effectsTiles.getTileAt(2, 2)
    // // console.log(a)
    // // this.effectsTilesLayer.putTileAt(a, 3, 3)
    // this.effectsTilesLayer.fill(82, 3, 3, 20, 20, true) //.putTileAt(a, 3, 3)
    // console.log(this.effectsTilesLayer)

    // a.index = 0
    // a.tileset.setImage('craters')
    // this.effectsTiles.putTileAt()

    const road = this.map.createLayer('Road', groundTiles)

    const overGroundLayer = this.map.createLayer('OverGround', mapObjectsTiles).setDepth(1)
    const buildsLayer = this.map.createLayer('Builds', mapObjectsTiles).setDepth(10)
    buildsLayer.setCollisionByProperty({ collides: true })
    this.matter.world.convertTilemapLayer(buildsLayer, {
      collisionFilter: {
        category: mapObjectCategory,
        mask: bulletCategory
      }
    })
    buildsLayer.layer.data.forEach((row) => {
      row
        .filter((tile) => tile.physics.matterBody) // Tiles with editing collision  && tile.physics.matterBody.body.label === 'Body'
        .filter((tile) => tile.rotation > 0)
        .forEach((tile) => {
          const matterBody = tile.physics.matterBody.body
          const angle = tile.rotation
          const rotationPoint = {
            x: tile.pixelX + tile.width / 2,
            y: tile.pixelY + tile.height / 2
          }
          Phaser.Physics.Matter.Matter.Body.rotate(matterBody, angle, rotationPoint)
        })
    })

    const mapObjectsLayer = this.map.createLayer('MapObjects', mapObjectsTiles).setDepth(99999)
    mapObjectsLayer.setCollisionByProperty({ collides: true })
    this.matter.world.convertTilemapLayer(mapObjectsLayer, {
      collisionFilter: {
        category: mapObjectCategory,
        mask: bulletCategory
      }
    })

    this.minimap?.ignore([
      road,
      buildsLayer,
      overGroundLayer,
      mapObjectsLayer,
      this.groundTilesLayer
    ])

    mapObjectsLayer.layer.data.forEach((row) => {
      row
        .filter((tile) => tile.physics.matterBody) // Tiles with editing collision  && tile.physics.matterBody.body.label === 'Body'
        .filter((tile) => tile.rotation > 0)
        .forEach((tile) => {
          const matterBody = tile.physics.matterBody.body
          const angle = tile.rotation
          const rotationPoint = {
            x: tile.pixelX + tile.width / 2,
            y: tile.pixelY + tile.height / 2
          }
          Phaser.Physics.Matter.Matter.Body.rotate(matterBody, angle, rotationPoint)
        })
    })

    const gridFull = mapObjectsLayer.layer.data.map((x) =>
      x.map((y) => {
        return [y.x, y.y, y.collides ? 1 : 0]
      })
    )
    this.map.layers.forEach((el, layerIndex) =>
      el.data.forEach((x, rowIndex) =>
        x.forEach((y, columnIndex) => {
          if (y.collides) {
            gridFull[rowIndex][columnIndex][2] = 1
          }
        })
      )
    )

    this.gridForAP = gridFull.reduce((ac, el) => {
      if (!ac.length) ac = []

      ac.push(
        el.map((z) => {
          const [x, y, collides] = z
          return collides
        })
      )
      return ac
    }, [])
    this.grid = new PF.Grid(this.gridForAP)
    // console.log(this.grid)

    this.fpsText = this.add
      .text(GameOptions.screen.width - 100, GameOptions.screen.height - 30, 'fps', {
        fontSize: 20,
        color: GameOptions.colors.lightColor
      })
      .setScrollFactor(0)
      .setDepth(99999)
    this.minimap?.ignore(this.fpsText)

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    // Create ecs world.
    setDefaultSize(10000)
    this.world = createWorld()
    // console.log(
    //   'Create World: entities=',
    //   getAllEntities(this.world),
    //   ' world components',
    //   getWorldComponents(this.world)
    // )

    // // bonuses.
    // const spawnPointsBonuses = this.map.filterObjects(
    //   'Objects',
    //   (obj) => !!obj.name.match('Spawn bonus')
    // )
    // for (let i = 0; i < GameOptions.bonuses.length; i++) {
    //   const point = spawnPointsBonuses[i]
    //   const bonus = GameOptions.bonuses[i]

    //   const tile = this.groundTilesLayer.getTileAtWorldXY(point.x, point.y)

    //   const bonusId = addEntity(this.world)

    //   addComponent(this.world, Bonus, bonusId)
    //   Bonus.gridX[bonusId] = tile.x
    //   Bonus.gridY[bonusId] = tile.y
    //   Bonus.type[bonusId] = bonus.type
    //   Bonus.value[bonusId] = 1000
    //   Bonus.duration[bonusId] = bonus.duration

    //   addComponent(this.world, Position, bonusId)
    //   Position.x[bonusId] = point.x
    //   Position.y[bonusId] = point.y
    // }

    // create container with teams info.
    if (this.configRound.config.countTeams > 0) {
      this.teamBar = new TeamBar(this, 0, 0)
    }

    // players.
    const gerbList = shuffle(Array.from(Array(GameOptions.countGerb - 1).keys())).filter(
      (x) => x != this.gameData.gerbId
    )

    const numberPlayer = Phaser.Math.Between(0, this.configRound.config.maxCountPlayers / 2 - 1)
    for (let i = 0; i < this.configRound.config.countTeams; i++) {
      // Spawn points.
      const spawnPoints = this.map.filterObjects('Objects', (obj) =>
        this.configRound.config.countTeams < 2
          ? !!obj.name.match(`Spawn Team`)
          : !!obj.name.match(`Spawn Team ${i}`)
      )

      // const teamId = addEntity(this.world)

      // addComponent(this.world, Team, teamId)

      const from = Phaser.Math.Clamp(
        this.configRound.playerIndexTank - 4,
        0,
        this.configRound.playerIndexTank
      )
      const to = Phaser.Math.Clamp(
        this.configRound.playerIndexTank + 2,
        this.configRound.playerIndexTank,
        GameOptions.complexTanks.length - 1
      )
      const gerbId = i == 0 ? this.gameData.gerbId : gerbList[i]

      const players: IConfigRoundTeamPlayer[] = []
      const rank = getRank(this.gameData.score)
      for (let h = 0; h < this.configRound.config.maxCountPlayers; h++) {
        players.push({
          level:
            i === 0 && h === numberPlayer
              ? {
                  from: rank,
                  to: rank
                }
              : {
                  from,
                  to
                },
          isPlayer: i === 0 && h === numberPlayer,
          spawnTile: spawnPoints[h],
          rank:
            i === 0 && h === numberPlayer
              ? rank
              : Phaser.Math.Between(
                  Phaser.Math.Clamp(rank - 2, 0, rank),
                  Phaser.Math.Clamp(rank + 2, rank, GameOptions.ranks.length - 1)
                ),
          gerbId:
            this.configRound.config.countTeams > 1
              ? gerbId
              : h === numberPlayer
                ? gerbId
                : gerbList[h]
          // teamId
        })
        // spawnPoints.pop()
      }

      this.configRound.teams.push({
        players,
        data: GameOptions.configTeams[Phaser.Math.Between(0, GameOptions.configTeams.length - 1)]
      })
    }
    // console.log(this.configRound)

    const listNames = shuffle(userNames[this.gameData.lang])
    // while (listNames.length < 40) {
    //   const name = generateName()
    //   if (!listNames.includes(name) && name) {
    //     listNames.push(getTrimName(name))
    //   }
    // }

    // Create teams.
    let counter = 0
    for (let x = 0; x < this.configRound.config.countTeams; x++) {
      for (let y = 0; y < this.configRound.config.maxCountPlayers; y++) {
        counter++
        const configPlayer = this.configRound.teams[x].players[y]
        const indexTank = Phaser.Math.Between(
          configPlayer.level.from < 0 ? 0 : configPlayer.level.from,
          configPlayer.level.to
        )

        const complexTankConfig = GameOptions.complexTanks[indexTank]
        const playerTankData = this.gameData.tanks[this.gameData.activeTankIndex]

        const tank = addEntity(this.world)

        addComponent(this.world, Entity, tank)
        const tile = this.groundTilesLayer.getTileAtWorldXY(
          configPlayer.spawnTile.x,
          configPlayer.spawnTile.y
        )

        if (configPlayer.isPlayer) {
          this.names.set(tank, getTrimName(this.gameData.name))
          this.idFollower = tank
          this.idPlayer = tank
        } else {
          this.names.set(tank, listNames.pop())
        }

        // add weapons
        for (const weapon in this.gameData.weapons) {
          if (
            // (+weapon == WeaponType.energy && !configPlayer.isPlayer) ||
            this.gameData.weapons[weapon] <= 0
          ) {
            continue
          }

          const weaponId = addEntity(this.world)
          addComponent(this.world, Weapon, weaponId)
          Weapon.type[weaponId] = +weapon
          Weapon.count[weaponId] = configPlayer.isPlayer
            ? this.gameData.weapons[weapon]
            : Phaser.Math.Between(0, this.gameData.weapons[weapon])
          Weapon.entityId[weaponId] = tank
          Weapon.isRefresh[weaponId] = 0

          // console.log('create weapon: ', weapon, ' for ', tank)
        }

        // Entity.teamIndex[tank] = configPlayer.teamId
        Entity.weapon[tank] = 1
        Entity.rank[tank] = configPlayer.rank
        Entity.teamIndex[tank] =
          this.configRound.config.countTeams > 1 ? x : configPlayer.isPlayer ? x : counter
        Entity.gridX[tank] = tile.x
        Entity.gridY[tank] = tile.y
        Entity.target[tank] = -1
        Entity.targetDistance[tank] = -1
        Entity.targetGridX[tank] = -1
        Entity.targetGridY[tank] = -1
        Entity.gerbId[tank] = configPlayer.gerbId
        Entity.targetDeath[tank] = -1
        Entity.roundCoin[tank] = 0

        addComponent(this.world, Position, tank)
        Position.x[tank] = configPlayer.spawnTile.x
        Position.y[tank] = configPlayer.spawnTile.y

        addComponent(this.world, Tank, tank)
        const tankLevel = configPlayer.isPlayer ? this.configRound.playerIndexTank : indexTank
        Tank.index[tank] = tankLevel
        Tank.maxHealth[tank] = Tank.health[tank] = configPlayer.isPlayer
          ? playerTankData.health
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.tanks.items[complexTankConfig.tank].game.health,
                // GameOptions.tanks.items[complexTankConfig.tank].game.health +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.health
                playerTankData.health
              ),
              GameOptions.tanks.items[complexTankConfig.tank].game.health,
              playerTankData.health //GameOptions.tanks.items[complexTankConfig.tank].game.health * 2
            )
        Tank.maxSpeed[tank] = Tank.speed[tank] = configPlayer.isPlayer
          ? playerTankData.speed
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.tanks.items[complexTankConfig.tank].game.speed,
                // GameOptions.tanks.items[complexTankConfig.tank].game.speed +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speed
                playerTankData.speed
              ),
              GameOptions.tanks.items[complexTankConfig.tank].game.speed,
              playerTankData.speed //GameOptions.tanks.items[complexTankConfig.tank].game.speed * 2
            )
        Tank.maxSpeedRotate[tank] = Tank.speedRotate[tank] = configPlayer.isPlayer
          ? playerTankData.speedRotate
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate,
                // GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speedRotate
                playerTankData.speedRotate
              ),
              GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate,
              playerTankData.speedRotate //GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate * 2
            )

        const muzzleLevel = complexTankConfig.muzzle
        Tank.maxDistanceShot[tank] = Tank.distanceShot[tank] = configPlayer.isPlayer
          ? playerTankData.distanceShot
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.muzzles.items[muzzleLevel].game.distanceShot,
                // GameOptions.muzzles.items[muzzleLevel].game.distanceShot +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.distanceShot
                playerTankData.distanceShot
              ),
              GameOptions.muzzles.items[muzzleLevel].game.distanceShot,
              playerTankData.distanceShot //GameOptions.muzzles.items[muzzleLevel].game.distanceShot * 2
            )
        Tank.maxSpeedShot[tank] = Tank.speedShot[tank] = configPlayer.isPlayer
          ? playerTankData.speedShot
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.muzzles.items[muzzleLevel].game.speedShot,
                // GameOptions.muzzles.items[muzzleLevel].game.speedShot +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speedShot
                playerTankData.speedShot
              ),
              GameOptions.muzzles.items[muzzleLevel].game.speedShot,
              playerTankData.speedShot //GameOptions.muzzles.items[muzzleLevel].game.speedShot * 2
            )
        Tank.timeBeforeShoot[tank] = Phaser.Math.FloatBetween(
          GameOptions.muzzles.items[muzzleLevel].maxTimeBeforeShoot.min,
          GameOptions.muzzles.items[muzzleLevel].maxTimeBeforeShoot.max
        )

        Tank.activeWeaponType[tank] = 0
        // Phaser.Math.Between(
        //   configPlayer.level.from < 0 ? 0 : configPlayer.level.from,
        //   configPlayer.level.to
        // )
        const levelTower = complexTankConfig.tower
        Tank.maxTimeRefreshWeapon[tank] = Tank.timeRefreshWeapon[tank] = configPlayer.isPlayer
          ? playerTankData.timeRefreshWeapon
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.timeRefreshWeapon,
                // GameOptions.towers.items[levelTower].game.timeRefreshWeapon +
                //   Phaser.Math.Between(0, GameOptions.complexity) *
                //     GameOptions.steps.timeRefreshWeapon
                playerTankData.timeRefreshWeapon
              ),
              GameOptions.towers.items[levelTower].game.timeRefreshWeapon,
              playerTankData.timeRefreshWeapon //GameOptions.towers.items[levelTower].game.timeRefreshWeapon * 2
            )
        Tank.maxSpeedRotateTower[tank] = Tank.speedRotateTower[tank] = configPlayer.isPlayer
          ? playerTankData.speedRotateTower
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.speedRotateTower,
                // GameOptions.towers.items[levelTower].game.speedRotateTower +
                //   Phaser.Math.Between(0, GameOptions.complexity) *
                //     GameOptions.steps.speedRotateTower
                playerTankData.speedRotateTower
              ),
              GameOptions.towers.items[levelTower].game.speedRotateTower,
              playerTankData.speedRotateTower //GameOptions.towers.items[levelTower].game.speedRotateTower * 2
            )
        Tank.maxAccuracy[tank] = Tank.accuracy[tank] = configPlayer.isPlayer
          ? playerTankData.accuracy
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.accuracy,
                // GameOptions.towers.items[levelTower].game.accuracy +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.accuracy
                playerTankData.accuracy
              ),
              GameOptions.towers.items[levelTower].game.accuracy,
              playerTankData.accuracy //GameOptions.towers.items[levelTower].game.accuracy * 2
            )
        Tank.maxDistanceView[tank] = Tank.distanceView[tank] = configPlayer.isPlayer
          ? playerTankData.distanceView
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.distanceView,
                // GameOptions.towers.items[levelTower].game.distanceView +
                //   Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.distanceView
                playerTankData.distanceView
              ),
              GameOptions.towers.items[levelTower].game.distanceView,
              playerTankData.distanceView //GameOptions.towers.items[levelTower].game.distanceView * 2
            )

        // console.log(
        //   configPlayer.isPlayer,
        //   tank,
        //   Tank.index[tank],
        //   Tank.health[tank] +
        //     Tank.speed[tank] +
        //     Tank.speedRotate[tank] +
        //     Tank.accuracy[tank] +
        //     Tank.distanceShot[tank] +
        //     Tank.distanceView[tank] +
        //     Tank.speedRotateTower[tank] +
        //     Tank.speedShot[tank] +
        //     Tank.timeRefreshWeapon[tank]
        // )

        addComponent(this.world, Rotation, tank)
        Rotation.angle[tank] = 0
        Rotation.force[tank] = 0
        addComponent(this.world, RotationTower, tank)
        RotationTower.angle[tank] = 0
        RotationTower.angleMuzzle[tank] = 0
        RotationTower.force[tank] = 0
        addComponent(this.world, Velocity, tank)
        Velocity.x[tank] = 0
        Velocity.y[tank] = 0
        addComponent(this.world, Input, tank)
        Input.countRandom[tank] = 0
        Input.direction[tank] = 0
        Input.down[tank] = 0
        Input.fire[tank] = 0
        Input.up[tank] = 0
        Input.left[tank] = 0
        Input.right[tank] = 0
        Input.obstacle[tank] = 0

        if (configPlayer.isPlayer) {
          addComponent(this.world, Player, tank)
        } else {
          addComponent(this.world, AI, tank)
          AI.status[tank] = StatusAI.Idle
          AI.timeBetweenActions[tank] = Phaser.Math.Between(
            GameOptions.ai.timeActions.min,
            GameOptions.ai.timeActions.max
          )
          AI.accumulatedPathTime[tank] = 0
          AI.accumulatedTime[tank] = 0
        }
      }
    }

    const dataMap = this.groundTilesLayer

    // create weapons object.
    const spawnWeaponObjectsPoints = this.map.filterObjects(
      'Objects',
      (obj) => !!obj.name.match('weapon')
    )

    const supportWeapons = getSupportWeapons(this.gameData.tanks[this.gameData.activeTankIndex].id)

    for (let i = 0; i < spawnWeaponObjectsPoints.length; ++i) {
      const id = addEntity(this.world)

      addComponent(this.world, Position, id)
      Position.x[id] = spawnWeaponObjectsPoints[i].x
      Position.y[id] = spawnWeaponObjectsPoints[i].y

      const weaponPlace = this.add
        .image(spawnWeaponObjectsPoints[i].x, spawnWeaponObjectsPoints[i].y, 'weaponPlace', 0)
        .setOrigin(0.5)
        .setDepth(0)
        .setScale(1.2)

      if (this.configRound.night) {
        weaponPlace.setPipeline('Light2D')
      }

      addComponent(this.world, Weapon, id)
      const weapon = supportWeapons[Phaser.Math.Between(1, supportWeapons.length - 1)]
      Weapon.type[id] = weapon.type
      Weapon.entityId[id] = -1
      Weapon.count[id] = weapon.count + Math.ceil(weapon.count * (this.gameData.rank / 3))
      Weapon.isRefresh[id] = weapon.timeRefresh > 0 ? 1 : 0
    }

    // create static bonus objects.
    const spawnDestroyObjectsPoints = this.map.filterObjects(
      'Objects',
      (obj) => !!obj.name.match('house')
    )
    for (let i = 0; i < spawnDestroyObjectsPoints.length; ++i) {
      const id = addEntity(this.world)
      addComponent(this.world, Position, id)

      Position.x[id] = spawnDestroyObjectsPoints[i].x
      Position.y[id] = spawnDestroyObjectsPoints[i].y
      // addComponent(this.world, MatterSprite, treeLarge)
      addComponent(this.world, StaticObject, id)
      const randomTexture = Phaser.Math.Between(0, GameOptions.destroyObjects.length - 1)
      StaticObject.indexObject[id] = randomTexture
    }

    // create pool weapons.
    for (const weaponConfig of GameOptions.weaponObjects) {
      const bullets = []
      for (let i = 0; i < 50; i++) {
        const bullet = new WeaponObject(this.matter.world, 0, 0, 'bullet', weaponConfig, {
          plugin: GameOptions.wrapBounds
        })

        // bullet.setCollisionCategory(mapObjectCategory)
        // bullet.setCollidesWith([ this.enemiesCollisionCategory, this.asteroidsCollisionCategory ]);
        // bullet.setOnCollide(this.bulletVsEnemy);
        bullets.push(bullet)
      }
      this.bullets.set(weaponConfig.type, bullets)
    }

    this.matter.world.drawDebug = false
    this.input.keyboard.on('keydown-L', (event) => {
      this.matter.world.drawDebug = !this.matter.world.drawDebug
      this.matter.world.debugGraphic.clear()
    })

    this.add
      .rectangle(0, GameOptions.marginMarker * 2, GameOptions.screen.width, 100, 0x000000, 0.5)
      .setOrigin(0)
      .setDepth(99999)
      .setScrollFactor(0)

    if (!this.sys.game.device.os.desktop) {
      const baseGameObject = this.add.circle(0, 0, 200, 0xffffff, 0.1).setDepth(99999)
      const thumbGameObject = this.add.sprite(0, 0, 'mobButtons', 0).setDepth(99999)
      this.joystikMove = new VirtualJoyStick(this, {
        x: 250,
        y: GameOptions.screen.height - 250,
        radius: 200,
        base: baseGameObject,
        thumb: thumbGameObject,
        // dir: '8dir',
        forceMin: 64,
        fixed: true,
        enable: true
      })
      this.minimap?.ignore([baseGameObject, thumbGameObject])
      this.cursors = this.joystikMove.createCursorKeys()

      this.buttonFire = this.add
        .sprite(GameOptions.screen.width - 300, GameOptions.screen.height - 250, 'mobButtons', 1)
        .setScale(2.5)
        .setAlpha(0.5)
        .setDepth(999999)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
          this.isFire = true
          this.buttonFire.setFrame(2)
        })
        .on('pointerup', () => {
          this.buttonFire.setFrame(1)
          this.isFire = false
        })
    }

    if (this.configRound.night) {
      buildsLayer.setPipeline('Light2D')
      mapObjectsLayer.setPipeline('Light2D')
      this.groundTilesLayer.setPipeline('Light2D')
      road.setPipeline('Light2D')
      overGroundLayer.setPipeline('Light2D')
      this.lights.enable().setAmbientColor(0x000000)
    }

    this.pipeline = pipe(
      createMatterSpriteSystem(this),
      createDestroyObjectsSystem(this),
      createWeaponSystem(this),
      createAreaEyeSystem(this),
      createLightSystem(this),
      // createCameraSystem(this),
      createEntityBarSystem(this),
      createEntityBarSyncSystem(this),
      createWeaponBarSystem(this),
      createBonusBarSystem(this),
      // createBattleBarSystem(this),
      createTeamBarSystem(this),
      createAloneBarSystem(this),
      createAloneBarSyncSystem(this),
      // createDebugBarSystem(this),
      createPlayerBarSystem(this),
      createFireSystem(this),
      createMarkersSystem(this),
      createBonusSystem(this),
      createAIManagerSystem(this),
      createAIMoveToSystem(this),
      createAIMoveRandomSystem(this),
      createAIWeaponSystem(this),
      // createPlayerWeaponSystem(this),
      createRaycastSystem(this),
      createInputSystem(this),
      // createDebugBarSyncSystem(this),
      createHintSystem(this)
      // createSteeringSystem(10),
      // createMatterPhysicsSystem(this)
    )

    this.afterPhysicsPipeline = pipe(
      createMatterPhysicsSyncSystem(this),
      createAreaEyeSyncSystem(this),
      createMarkersSyncSystem(this),
      createLightSyncSystem(this),
      createTeamBarSyncSystem(this),
      createPlayerBarSyncSystem(this),
      createBonusSyncSystem(this),
      createHintSyncSystem(this)
    )
    this.matterSystem = createMatterPhysicsSystem(this)
    this.steerSystem = createSteeringSystem(this)

    this.createHelloMessage()
  }

  createHelloMessage() {
    this.input.keyboard.enabled = false
    // console.log(this.sys.displayList.list)

    const bg = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.8)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive()

    const title = this.add
      .text(0, -400, this.lang.typeRound[this.configRound.config.type].title, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 70,
        color: GameOptions.colors.accent,
        align: 'center',
        wordWrap: {
          width: 800
        }
      })
      .setOrigin(0.5)

    const description = this.add
      .text(0, -300, this.lang.typeRound[this.configRound.config.type].description, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 30,
        color: GameOptions.colors.lightColor,
        align: 'center',
        wordWrap: {
          width: 800
        }
      })
      .setOrigin(0.5)
    const text = this.add
      .text(0, 0, '', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 150,
        align: 'center'
      })
      .setOrigin(0.5)

    const bgHint = this.add
      .rectangle(
        0,
        0,
        GameOptions.screen.width / 2,
        300,
        Phaser.Display.Color.ValueToColor(GameOptions.colors.secondaryColor).color,
        1
      )
      .setOrigin(0)

      .setOrigin(0)
    const hintTitle = this.add
      .text(30, 30, this.lang.hint, {
        fontFamily: 'Arial',
        color: GameOptions.colors.success,
        fontSize: 40,
        fontStyle: 'bold',
        align: 'left',
        wordWrap: {
          width: GameOptions.screen.width / 2 - 60
        }
      })
      .setOrigin(0)
    const hintText = this.add
      .text(30, 90, this.lang.hints[Phaser.Math.Between(0, this.lang.hints.length - 1)], {
        fontFamily: 'Arial',
        color: GameOptions.colors.lightColor,
        fontSize: 40,
        align: 'left',
        wordWrap: {
          width: GameOptions.screen.width / 2 - 60
        }
      })
      .setOrigin(0)

    const hintContainer = this.add.container(
      -GameOptions.screen.width / 4,
      GameOptions.screen.height / 2 - 350,
      [bgHint, hintTitle, hintText]
    )

    const graphics = this.add
      .graphics({
        lineStyle: {
          color: 0xffffff,
          alpha: 0.2,
          width: 3
        },
        fillStyle: {
          color: Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
        }
      })
      .setAlpha(1)
      // .setDepth(1)
      .setAngle(-90)

    this.containerHello = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        bg,
        title,
        description,
        text,
        graphics,
        hintContainer
      ])
      .setDepth(9999999999)
      .setScrollFactor(0)

    // const timedEvent = this.time.addEvent({
    //   delay: 1000,
    //   callback: () => {
    //     this.sound.play(KeySound.Clock)
    //   },
    //   callbackScope: this,
    //   loop: true,
    // })

    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: GameOptions.timeHelloRound,
      onUpdate: (tween) => {
        const v = tween.getValue()
        const newNumber = (
          Math.round((GameOptions.timeHelloRound - tween.totalElapsed) / 1000) + 1
        ).toString()
        if (newNumber && text && graphics) {
          if (newNumber != text.text && text.text && this.isMute) {
            this.sound.play(KeySound.Clock, { volume: 0.3 })
          }
          text?.setText(newNumber)

          if (graphics.clear) {
            graphics.clear()

            graphics.beginPath()
            graphics.lineStyle(
              40,
              Phaser.Display.Color.ValueToColor(GameOptions.colors.lightColor).color
            )
            graphics.arc(0, 0, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(v), true, 0.02)
            graphics.strokePath()
            graphics.closePath()
          }
        }
      },
      onComplete: async () => {
        this.scene.bringToTop('Control')
        this.containerHello.removeAll(true)
        //this.containerHello.destroy()
        this.isMute = true
        this.isPauseAI = false
        this.input.keyboard.enabled = true

        await this.scene
          .get('Control')
          .showHelp(this.sys.game.device.os.desktop ? 'move' : 'moveMobile', 2000)
        await this.scene.get('Control').showHelp('markers', 2000)
        await this.scene.get('Control').showHelp('destroyObject', 3000)
      }
    })
  }

  createEntityWithEffect(xVals, yVals, callback) {
    const emitter = this.add
      .particles(xVals[0], yVals[0], KeyParticles.SmokeBoom, {
        frame: 1,
        color: [0x555555, 0xffd189, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0.5, ease: 'sine.out' },
        speed: { random: [50, 100] },
        lifespan: { random: [200, 400] },
        gravityX: 0,
        gravityY: 0,
        blendMode: 'COLOR'
        // // emitting: false,
        // quantity: 5,
        // speed: { random: [50, 100] },
        // lifespan: { random: [200, 400] },
        // scale: { random: true, start: 0.5, end: 0 },
        // rotate: { random: true, start: 0, end: 180 },
        // color: [0x666666, 0xffd189, 0x222222],
        // colorEase: 'quad.out'
        // // angle: { random: true, start: 0, end: 270 }
      })
      .setDepth(999)
    // emitter.start()

    this.tweens.addCounter({
      from: 0,
      to: 1,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: 1000,
      onUpdate: (tween) => {
        const v = tween.getValue()
        const x = Phaser.Math.Interpolation.CatmullRom(xVals, v)
        const y = Phaser.Math.Interpolation.CatmullRom(yVals, v)

        emitter.setPosition(x, y)
      },
      onComplete: () => {
        // emitter.explode(50, xVals.toX, data.toY)
        callback && callback()
        emitter.stop()
        emitter.destroy()

        this.time.delayedCall(1000, () => {
          //particles.removeEmitter(emitter)
        })
      }
    })
  }

  onSyncPlayerData(playerData: IPlayerData) {
    this.playerData = JSON.parse(JSON.stringify(playerData))
  }

  onSync(gameData: IGameData, lang: TLang) {
    this.gameData = JSON.parse(JSON.stringify(gameData))
    this.lang = lang

    this.changeLocale()
  }

  changeLocale() {}

  setFollower(id: number) {
    if (id == -1) {
      let items = Array.from(tanksById)
      id = items[Phaser.Math.Between(0, tanksById.size - 1)][0]
    }

    let follower = tanksById.get(id)

    if (!follower || !follower.body) {
      let items = Array.from(tanksById)
      id = items[0][0]
    }

    follower = tanksById.get(id)

    if (!follower || !follower.body) {
      return
    }
    if (follower) {
      this.idFollower = id
      this.cameras.main.startFollow(follower, false, 1, 1)
    }
  }

  onShutdown() {
    // console.log('onShutdown')
    // this.sound.stopAll()
    // console.log(
    //   this.events.listeners('pause'),
    //   this.events.listeners('resume'),
    //   this.events.listeners('stop')
    // )
    //EventBus.emit('save-data', this.gameData)

    // const query = defineQuery([Weapon])
    // const weapons = query(this.world)
    // const weaponsPlayer = weapons.filter((x) => Weapon.entityId[x] == this.idPlayer)
    // const
    // for (const weaponId of weaponsPlayer) {
    //   console.log(Weapon.type[weaponId], Weapon.count[weaponId])

    // }
    // this.gameData.weapons =

    // console.log(getAllEntities(this.world))
    this.isRoundEnd = true
    for (const id of getAllEntities(this.world)) {
      removeEntity(this.world, id)
    }
    // resetWorld(this.world)
    // deleteWorld(this.world)
  }

  onCheckWinTeam() {
    if (this.isRoundEnd) {
      return
    }
    const query = defineQuery([Tank])
    const tanks = query(this.world)

    // check player game over
    const playerIsGameOver = !tanks.includes(this.idPlayer)
    if (playerIsGameOver) {
      this.isMute = false

      this.gameData.tanks[this.gameData.activeTankIndex].cb += 1
      this.gameData.cb += 1
      // this.gameData.coin += this.roundCoin
      this.gameData.score += this.roundCoin
      EventBus.emit('save-data', this.gameData)
      EventBus.emit('set-lb', this.gameData.score)

      this.scene
        .get('Control')
        .onGameOverPlayer(
          this.lang?.gameOverTitle,
          this.lang?.gameOverPlayer,
          GameOptions.colors.danger,
          this.roundCoin
        )
      this.input.keyboard.enabled = false
      // this.input.mouse.enabled = false
      this.isFire = false
      this.isRoundEnd = true
      return
    }

    // check team win
    const groupByTeams = groupBy(tanks, (v) => Entity.teamIndex[v])
    // console.log('Check Gameover', groupByTeams)
    if (Object.keys(groupByTeams).length == 1) {
      // console.log('Win team: ', groupByTeams)
      this.isMute = false

      this.gameData.tanks[this.gameData.activeTankIndex].cb += 1
      this.gameData.cb += 1
      this.gameData.cw += 1
      // this.gameData.coin += this.roundCoin
      this.gameData.score += this.roundCoin
      EventBus.emit('save-data', this.gameData)
      EventBus.emit('set-lb', this.gameData.score)

      this.scene
        .get('Control')
        .onGameOverPlayer(
          this.lang?.winTitle,
          this.configRound.config.countTeams > 1 ? this.lang.winTeam : this.lang.winAlone,
          GameOptions.colors.success,
          this.roundCoin
        )
      this.input.keyboard.enabled = false
      this.isFire = false
      this.isRoundEnd = true
    }
  }

  onFocus() {
    // window?.onGameplayStart && window.onGameplayStart()

    if (!this.isRoundEnd && !this.isPauseAI) {
      this.isMute = true
    }
  }
  onBlur() {
    // window?.onGameplayStop && window.onGameplayStop()

    this.isMute = false
  }

  update(t: number, dt: number) {
    if (!this.world || !this.pipeline) {
      console.log('Not found world!')
      return
    }

    // const t0 = performance.now()

    this.pipeline(this.world)
    this.steerSystem(this.world, dt)
    this.matterSystem(this.world)

    if (!this.sys.game.device.os.desktop && !this.isPauseAI) {
      if (this.isFire) {
        Input.fire[this.idPlayer] = 1
      } else {
        Input.fire[this.idPlayer] = 0
      }
    }
    // const t1 = performance.now()
    this.fpsText.setText(
      `fps: ${Math.round(this.game.loop.actualFps)}` //, ecs: ${Math.round(t1 - t0)} ms. isFire=${Input.fire[this.idPlayer]}
    )

    if (getAllEntities(this.world).length == 0) {
      deleteWorld(this.world)
      this.scene.remove('Game')
      // console.log('Remove scene')
    }
    // t1 - t0 > 1 && console.log(`${t1 - t0} ms.`)
  }
}
