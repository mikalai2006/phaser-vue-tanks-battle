import Phaser from 'phaser'
import {
  createWorld,
  addEntity,
  addComponent,
  pipe,
  deleteWorld,
  resetWorld,
  defineQuery
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
import { generateName, getRank, isProbability, shuffle } from '../utils/utils'
import { createTeamBarSyncSystem, createTeamBarSystem } from '../systems/teamBar'
import { TeamBar } from '../objects/TeamBar'
import { IConfigRound, IConfigRoundTeamPlayer, IGameData, TLang } from '../types'
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

export default class Game extends Phaser.Scene {
  public gameData: IGameData
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

  public configRound: IConfigRound

  private world!: IWorld

  public isMute: boolean = false
  public idFollower: number = -1
  public idPlayer: number = -1
  public roundCoin: number = 0
  public isPauseAI: boolean = true
  public isFire: boolean

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

  constructor() {
    super('Game')
  }

  init() {
    this.scene.bringToTop('Control')

    // create container with effects.
    this.effects = new Effect(this, 0, 0)

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

  create({ lang, data }) {
    this.lang = lang
    this.gameData = data

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

    // map.
    this.map = this.make.tilemap({ key: 'map3' })
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
      .text(GameOptions.screen.width / 2, GameOptions.screen.height - 100, 'fps', {
        fontSize: 40,
        color: '#fff'
      })
      .setScrollFactor(0)
      .setDepth(99999)
    this.minimap?.ignore(this.fpsText)

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    const { width, height } = this.scale

    // Create ecs world.
    this.world = createWorld()

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

    // Create round data.
    const activeTankIndexByComplex = GameOptions.complexTanks.findIndex(
      (x) => x.id == this.gameData.tanks[this.gameData.activeTankIndex].id
    )
    this.configRound = {
      playerIndexTank: activeTankIndexByComplex,
      teams: [],
      night: isProbability(0.2),
      config: GameOptions.typesRound[Phaser.Math.Between(0, GameOptions.typesRound.length)]
    }

    // create container with teams info.
    if (this.configRound.config.countTeams > 0) {
      this.teamBar = new TeamBar(this, 0, 0)
    }

    // players.
    const gerbList = shuffle(Array.from(Array(GameOptions.countGerb - 1).keys())).filter(
      (x) => x != this.gameData.gerbId
    )

    const numberPlayer = Phaser.Math.Between(0, this.configRound.config.countPlayers / 2 - 1)
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
        this.configRound.playerIndexTank + 1,
        this.configRound.playerIndexTank,
        GameOptions.complexTanks.length - 1
      )
      const gerbId =
        this.configRound.config.countTeams > 1 && i == 0 ? this.gameData.gerbId : gerbList[i]

      const players: IConfigRoundTeamPlayer[] = []
      const rank = getRank(this.gameData.score)
      for (let h = 0; h < this.configRound.config.countPlayers; h++) {
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
          gerbId: this.configRound.config.countTeams > 1 ? gerbId : gerbList[h]
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

    // Create teams.
    let counter = 0
    for (let x = 0; x < this.configRound.config.countTeams; x++) {
      for (let y = 0; y < this.configRound.config.countPlayers; y++) {
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
          this.names.set(tank, this.gameData.name)
          this.idFollower = tank
          this.idPlayer = tank
        } else {
          this.names.set(tank, generateName())
        }

        for (const weapon in this.gameData.weapons) {
          const weaponId = addEntity(this.world)
          addComponent(this.world, Weapon, weaponId)
          Weapon.type[weaponId] = +weapon
          Weapon.count[weaponId] = configPlayer.isPlayer
            ? this.gameData.weapons[weapon]
            : Phaser.Math.Between(0, this.gameData.weapons[weapon])
          Weapon.entityId[weaponId] = tank
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
                GameOptions.tanks.items[complexTankConfig.tank].game.health +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.health
              ),
              GameOptions.tanks.items[complexTankConfig.tank].game.health,
              playerTankData.health //GameOptions.tanks.items[complexTankConfig.tank].game.health * 2
            )
        Tank.maxSpeed[tank] = Tank.speed[tank] = configPlayer.isPlayer
          ? playerTankData.speed
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.tanks.items[complexTankConfig.tank].game.speed,
                GameOptions.tanks.items[complexTankConfig.tank].game.speed +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speed
              ),
              GameOptions.tanks.items[complexTankConfig.tank].game.speed,
              playerTankData.speed //GameOptions.tanks.items[complexTankConfig.tank].game.speed * 2
            )
        Tank.maxSpeedRotate[tank] = Tank.speedRotate[tank] = configPlayer.isPlayer
          ? playerTankData.speedRotate
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate,
                GameOptions.tanks.items[complexTankConfig.tank].game.speedRotate +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speedRotate
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
                GameOptions.muzzles.items[muzzleLevel].game.distanceShot +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.distanceShot
              ),
              GameOptions.muzzles.items[muzzleLevel].game.distanceShot,
              playerTankData.distanceShot //GameOptions.muzzles.items[muzzleLevel].game.distanceShot * 2
            )
        Tank.maxSpeedShot[tank] = Tank.speedShot[tank] = configPlayer.isPlayer
          ? playerTankData.speedShot
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.muzzles.items[muzzleLevel].game.speedShot,
                GameOptions.muzzles.items[muzzleLevel].game.speedShot +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.speedShot
              ),
              GameOptions.muzzles.items[muzzleLevel].game.speedShot,
              playerTankData.speedShot //GameOptions.muzzles.items[muzzleLevel].game.speedShot * 2
            )

        Tank.activeWeaponType[tank] = 0
        // Phaser.Math.Between(
        //   configPlayer.level.from < 0 ? 0 : configPlayer.level.from,
        //   configPlayer.level.to
        // )
        const levelTower = complexTankConfig.tower
        Tank.timeBeforeShoot[tank] = Phaser.Math.FloatBetween(
          complexTankConfig.maxTimeBeforeShoot.min,
          complexTankConfig.maxTimeBeforeShoot.max
        )
        Tank.maxTimeRefreshWeapon[tank] = Tank.timeRefreshWeapon[tank] = configPlayer.isPlayer
          ? playerTankData.timeRefreshWeapon
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.timeRefreshWeapon,
                GameOptions.towers.items[levelTower].game.timeRefreshWeapon +
                  Phaser.Math.Between(0, GameOptions.complexity) *
                    GameOptions.steps.timeRefreshWeapon
              ),
              GameOptions.towers.items[levelTower].game.timeRefreshWeapon,
              playerTankData.timeRefreshWeapon //GameOptions.towers.items[levelTower].game.timeRefreshWeapon * 2
            )
        Tank.maxSpeedRotateTower[tank] = Tank.speedRotateTower[tank] = configPlayer.isPlayer
          ? playerTankData.speedRotateTower
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.speedRotateTower,
                GameOptions.towers.items[levelTower].game.speedRotateTower +
                  Phaser.Math.Between(0, GameOptions.complexity) *
                    GameOptions.steps.speedRotateTower
              ),
              GameOptions.towers.items[levelTower].game.speedRotateTower,
              playerTankData.speedRotateTower //GameOptions.towers.items[levelTower].game.speedRotateTower * 2
            )
        Tank.maxAccuracy[tank] = Tank.accuracy[tank] = configPlayer.isPlayer
          ? playerTankData.accuracy
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.accuracy,
                GameOptions.towers.items[levelTower].game.accuracy +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.accuracy
              ),
              GameOptions.towers.items[levelTower].game.accuracy,
              playerTankData.accuracy //GameOptions.towers.items[levelTower].game.accuracy * 2
            )
        Tank.maxDistanceView[tank] = Tank.distanceView[tank] = configPlayer.isPlayer
          ? playerTankData.distanceView
          : Phaser.Math.Clamp(
              Phaser.Math.Between(
                GameOptions.towers.items[levelTower].game.distanceView,
                GameOptions.towers.items[levelTower].game.distanceView +
                  Phaser.Math.Between(0, GameOptions.complexity) * GameOptions.steps.distanceView
              ),
              GameOptions.towers.items[levelTower].game.distanceView,
              playerTankData.distanceView //GameOptions.towers.items[levelTower].game.distanceView * 2
            )

        console.log(
          configPlayer.isPlayer,
          tank,
          Tank.index[tank],
          Tank.health[tank] +
            Tank.speed[tank] +
            Tank.speedRotate[tank] +
            Tank.accuracy[tank] +
            Tank.distanceShot[tank] +
            Tank.distanceView[tank] +
            Tank.speedRotateTower[tank] +
            Tank.speedShot[tank] +
            Tank.timeRefreshWeapon[tank]
        )

        addComponent(this.world, Rotation, tank)
        addComponent(this.world, RotationTower, tank)
        addComponent(this.world, Velocity, tank)
        addComponent(this.world, Input, tank)

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
        }
      }
    }

    const dataMap = this.groundTilesLayer

    // create weapons object.
    const spawnWeaponObjectsPoints = this.map.filterObjects(
      'Objects',
      (obj) => !!obj.name.match('weapon')
    )
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
      const weaponIndex = Phaser.Math.Between(1, GameOptions.weaponObjects.length - 1)
      const weapon = GameOptions.weaponObjects[weaponIndex]
      Weapon.type[id] = weapon.type
      Weapon.entityId[id] = -1
      Weapon.count[id] = weapon.count
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
      const baseGameObject = this.add.circle(0, 0, 150, 0xffffff, 0.1).setDepth(99999)
      const thumbGameObject = this.add.sprite(0, 0, 'mobButtons', 0).setDepth(99999)
      this.joystikMove = new VirtualJoyStick(this, {
        x: 200,
        y: GameOptions.screen.height - 200,
        radius: 150,
        base: baseGameObject,
        thumb: thumbGameObject,
        // dir: '8dir',
        forceMin: 64,
        fixed: true,
        enable: true
      })
      this.minimap?.ignore([baseGameObject, thumbGameObject])
      this.cursors = this.joystikMove.createCursorKeys()

      const buttonFire = this.add
        .sprite(GameOptions.screen.width - 250, GameOptions.screen.height - 200, 'mobButtons', 1)
        .setScale(2)
        .setAlpha(0.5)
        .setDepth(999999)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
          this.isFire = true
          buttonFire.setFrame(2)
        })
        .on('pointerup', () => {
          buttonFire.setFrame(1)
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
      createWeaponBarSystem(this),
      createBonusBarSystem(this),
      // createBattleBarSystem(this),
      createTeamBarSystem(this),
      createPlayerBarSystem(this),
      createFireSystem(this),
      createMarkersSystem(this),
      createBonusSystem(this),
      createAIManagerSystem(this),
      createAIMoveRandomSystem(this),
      createAIMoveToSystem(this),
      createAIWeaponSystem(this),
      // createPlayerWeaponSystem(this),
      createRaycastSystem(this),
      createInputSystem(this)
      // createSteeringSystem(10),
      // createMatterPhysicsSystem(this)
    )

    this.afterPhysicsPipeline = pipe(
      createMatterPhysicsSyncSystem(),
      createAreaEyeSyncSystem(this),
      createMarkersSyncSystem(this),
      createLightSyncSystem(this),
      createEntityBarSyncSystem(this),
      createTeamBarSyncSystem(this),
      createPlayerBarSyncSystem(this),
      createBonusSyncSystem(this)
    )
    this.matterSystem = createMatterPhysicsSystem(this)
    this.steerSystem = createSteeringSystem(this)

    this.createHelloMessage()
  }

  createHelloMessage() {
    // console.log(this.sys.displayList.list)

    const bg = this.add
      .rectangle(0, 0, GameOptions.screen.width, GameOptions.screen.height, 0x000000, 0.95)
      .setOrigin(0.5)

    const title = this.add
      .text(0, -400, this.lang.typeRound[this.configRound.config.type].title, {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 70,
        color: GameOptions.ui.accent,
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
        color: GameOptions.ui.primaryColor,
        align: 'center',
        wordWrap: {
          width: 800
        }
      })
      .setOrigin(0.5)
    const text = this.add
      .text(0, 0, '100', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 150,
        align: 'center'
      })
      .setOrigin(0.5)

    const graphics = this.add
      .graphics({
        lineStyle: {
          color: 0xffffff,
          alpha: 0.2,
          width: 3
        },
        fillStyle: {
          color: GameOptions.ui.panelBgColorLight
        }
      })
      .setAlpha(1)
      .setDepth(1)
      .setAngle(-90)

    const container = this.add
      .container(GameOptions.screen.width / 2, GameOptions.screen.height / 2, [
        bg,
        title,
        description,
        text,
        graphics
      ])
      .setDepth(9999999999)
      .setScrollFactor(0)

    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 5000,
      onUpdate: (tween) => {
        const v = tween.getValue()
        text.setText((Math.round((5000 - tween.totalElapsed) / 1000) + 1).toString())
        graphics.clear()
        // graphics.lineStyle(50, GameOptions.ui.panelBgColorLight)
        // graphics.beginPath()
        // graphics.arc(0, 0, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.02)
        // graphics.strokePath()
        // graphics.fill()
        // graphics.closePath()

        graphics.beginPath()
        graphics.lineStyle(40, GameOptions.ui.panelBgColorLight)
        graphics.arc(0, 0, 200, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(v), true, 0.02)
        graphics.strokePath()
        graphics.closePath()
      },
      onComplete: async () => {
        container.destroy()
        this.isMute = true
        this.isPauseAI = false

        await this.scene
          .get('Control')
          .showHelp(this.sys.game.device.os.desktop ? 'move' : 'moveMobile', 2000)
        await this.scene.get('Control').showHelp('markers', 2000)
        await this.scene.get('Control').showHelp('destroyObject', 3000)
      }
    })
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
    console.log('onShutdown')
    EventBus.emit('save-data', this.gameData)

    // const query = defineQuery([Weapon])
    // const weapons = query(this.world)
    // const weaponsPlayer = weapons.filter((x) => Weapon.entityId[x] == this.idPlayer)
    // const
    // for (const weaponId of weaponsPlayer) {
    //   console.log(Weapon.type[weaponId], Weapon.count[weaponId])

    // }
    // this.gameData.weapons =

    // console.log(getAllEntities(this.world))
    // for (const id of getAllEntities(this.world)) {
    //   removeEntity(this.world, id)
    // }
    deleteWorld(this.world)
    resetWorld(this.world)
  }

  onCheckWinTeam() {
    const query = defineQuery([Tank])
    const tanks = query(this.world)

    // check player game over
    const playerIsGameOver = !tanks.includes(this.idPlayer)
    if (playerIsGameOver) {
      // console.log('playerIsGameOver=', playerIsGameOver)
      this.isMute = false
      this.scene
        .get('Control')
        .onGameOverPlayer(
          this.lang?.gameOverTitle,
          this.lang?.gameOverPlayer,
          GameOptions.ui.dangerText,
          this.roundCoin
        )
      this.isFire = false
    }

    // check team win
    const groupByTeams = groupBy(tanks, (v) => Entity.teamIndex[v])
    // console.log('Check Gameover', groupByTeams)
    if (Object.keys(groupByTeams).length == 1) {
      // console.log('Win team: ', groupByTeams)
      this.isMute = false
      this.scene
        .get('Control')
        .onGameOverPlayer(
          this.lang?.winTitle,
          this.configRound.config.countTeams > 1 ? this.lang.winTeam : this.lang.winAlone,
          GameOptions.ui.successColor,
          this.roundCoin
        )
      this.isFire = false
    }
  }

  update(t: number, dt: number) {
    if (!this.world || !this.pipeline) {
      return
    }

    const t0 = performance.now()

    this.pipeline(this.world)
    // run each system in desired order
    // this.playerSystem(this.world)
    // this.cpuSystem(this.world)
    this.steerSystem(this.world, dt)
    this.matterSystem(this.world)
    const t1 = performance.now()
    this.fpsText.setText(
      `fps: ${Math.round(this.game.loop.actualFps)}, ecs: ${Math.round(t1 - t0)} ms.`
    )

    if (!this.sys.game.device.os.desktop) {
      if (this.isFire) {
        Input.fire[this.idPlayer] = 1
      } else {
        Input.fire[this.idPlayer] = 0
      }
    }
    // t1 - t0 > 1 && console.log(`${t1 - t0} ms.`)

    // this.spriteSystem(this.world)
  }
}
