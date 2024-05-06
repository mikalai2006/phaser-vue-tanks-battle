import { BonusType, WeaponType } from './options/gameOptions'
import { langs } from './lang'

export type TLang = (typeof langs)['ru']

export interface IUserData {
  uid?: string
  name?: string
  photo?: string
}

export interface IGameDataTank
  extends ITankConfigGameOptions,
    ITowerConfigGameOptions,
    IMuzzleConfigGameOptions {
  /**
   * Уровень танка = позиции танка в списке complexTank
   */
  level: number
  levelTank: number
  levelTower: number
  levelMuzzle: number
}

export interface IGameData {
  name: string
  gerbId: number
  score: number
  lang: string
  activeTankIndex: number
  tanks: IGameDataTank[]

  // bullet: IBulletConfig[]
  rank: number
  coin: number
  roundRate: number
  roundId: number
}

export interface IBonusConfig {
  /**
   * Тип бонуса
   */
  type: BonusType // 'health' | 'weapon' | 'speed'
  /**
   * Номер фрейма для изображения бонуса
   */
  frame: number
  /**
   * Время действия бонуса
   */
  duration: number
  /**
   * Время обновления бонуса
   *
   * -1 - не обновлять (один раз появляется на карте)
   */
  timeRefresh: number
  /**
   * Цвет изображения бонуса
   */
  color: number
  /**
   * Вероятность создания бонуса
   * 1 - 100%
   * 0.1 - 10%
   */
  probability: number
  /**
   * Размер бонуса для начисления
   *
   * -1 - пополнить до максимума
   */
  value: number
}

export interface IMuzzleConfigItem {
  frame: number
  /**
   * Название анимации
   */
  keyAnimation: string
  center: { x: number; y: number }
  game: IMuzzleConfigGameOptions
  centerConstraint: { x: number; y: number }
  offset: { xOffset: number; yOffset?: number }
  vert: { x: number; y: number }[]
  /**
   * Количество последовательных выстрелов
   */
  countShot: number
}

export interface IMuzzleConfig {
  key: string
  items: IMuzzleConfigItem[]
}

export interface IMuzzleConfigGameOptions {
  /**
   * Скорость полета снаряда
   * @min 10
   * @max 50
   */
  speedShot: number
  /**
   * Дистанция полета снаряда
   * @min 150
   * @max 800
   */
  distanceShot: number
}
// export interface IBulletConfig {
//   /**
//    * Поражающая сила снаряда, в HP
//    * @min 20
//    * @max 500
//    */
//   damage: number
//   /**
//    * размер воронки от снаряда
//    * @min .2
//    * @max 1.5
//    */
//   scaleCrator: number
// }

export interface IConfigTeam {
  /**
   * Название команды
   */
  name: string
  /**
   * Цвет для команды
   */
  color: number
  /**
   * Цвет зоны атаки
   */
  colorAttackZone: number
}
export interface ITankConfigGameOptions {
  /**
   * HP танка
   * @max 1000
   */
  health: number
  /**
   * Скорость передвижения базы
   * @min 300
   * @max 500
   */
  speed: number
  /**
   * Скорость поворота базы, углов в сек
   * @max 180
   */
  speedRotate: number
}

export interface ITowerConfigGameOptions {
  /**
   * Скорость поворота башни, градусы в сек
   * @min 60
   * @max 360
   */
  speedRotateTower: number
  /**
   * Точность наведения башни, %
   * @max 100
   */
  accuracy: number
  /**
   * Время перезарядки, работает в обратном направлении
   * если 3800 то от максимума 4000 - 3800  = 200мс
   * @max 3800
   * @min 0
   */
  timeRefreshWeapon: number
  /**
   * Дистанция наблюдения (разведки)
   * @max 1000
   */
  distanceView: number
}

export interface IComplexConfig {
  name: string
  tank: number
  tower: number
  muzzle: number
  cost: number
  rank: number
}

export interface IWeaponObject {
  texture: string
  frame: number
  vert: { x: number; y: number }[]
  timeRefresh: number
  type: WeaponType
  count: number
  color: number
  /**
   * Поражающая сила снаряда, в HP
   * @min 20
   * @max 500
   */
  damage: number
  /**
   * размер воронки от снаряда
   * @min .2
   * @max 1.5
   */
  scaleCrator: number
  /**
   * frame выстрела из ствола
   */
  frameParticleMuzzle: string
  /**
   * Настройки частиц взрыва снаряда
   */
  configParticlesBoom: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
}

export interface IDestroyObject {
  texture: string
  frameStart: number
  frameEnd: number
  vert: { x: number; y: number }[]
}

export enum PacketPaymentsType {
  Ad = 1,
  Yan = 2
}

export interface IPacketPaymentsItem {
  type: PacketPaymentsType
  countCoin: number
  cost: number
  texture: string
  frame: number
  id: string
}

export interface IRankItem {
  rank: number
  /**
   * Диапазон ранга [min,max]
   *
   */
  range: [number, number]
}

export interface IGameOptions {
  ranks: IRankItem[]
  destroyObjects: IDestroyObject[]
  weaponObjects: IWeaponObject[]
  localStorageName: string
  lang: string
  /**
   * Пакеты для покупки монет
   */
  packetPayments: IPacketPaymentsItem[]
  /**
   * Будет ли в игре банк, для пополнения кошелька
   */
  isBank: boolean
  /**
   * Будет ли в игре реклама
   */
  isAdv: boolean
  isLeaderBoard: boolean
  /**
   * Добавочное смещение для зоны атаки, учитывая точку вылета снаряда
   */
  offsetAttackZone: number
  /**
   * Минимальный угол для сектора стрельбы, если точность абсолютная
   */
  minAngleArc: number
  /**
   * Количество команд на поле
   */
  countTeams: number
  /**
   * Количество игроков в команде
   */
  countTeamPlayers: number

  /**
   * Данные команд
   */
  configTeams: IConfigTeam[]

  /**
   * Максимальный угол разброса наведения башни
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   */
  maxAccuracityTower: number

  tanks: {
    key: string
    items: {
      frame: number
      game: ITankConfigGameOptions
      catYOffset: number
      offset: { yOffset: number; xOffset: number }
      vert: { x: number; y: number }[]
    }[]
  }
  muzzles: IMuzzleConfig
  towers: {
    key: string
    items: {
      frame: number
      game: ITowerConfigGameOptions
      /**
       * Время реакции перед выстрелом, мсек
       */
      maxTimeBeforeShoot: {
        min: number
        max: number
      }
    }[]
  }
  // bullets: {
  //   key: string
  //   items: IBulletConfig[]
  // }
  bonuses: IBonusConfig[]
  complexTanks: IComplexConfig[]
  /**
   * Опции, которые исключаеются из подсчета силы
   */
  excludeFromStretchOptions: string[]

  /**
   * настройки AI
   */
  ai: {
    /**
     * Время размышления
     */
    timeActions: {
      max: number
      min: number
    }
  }
  /**
   * Размеры игрового полотна
   */
  screen: {
    /**
     * Ширина игры
     */
    width: number
    /**
     * Высота игры
     */
    height: number
  }
  /**
   * Расстояние маркера от края экрана, px
   */
  marginMarker: number
  /**
   * Цвета
   */
  colors: {
    /**
     * Цвет HP
     */
    health: number
  }
  /**
   * Количество гербов (Зависит от спрайтов)
   */
  countGerb: number
  /**
   * Размеры сайда команды
   */
  teamBarSize: {
    width: number
    height: number
    offsetX: number
    offsetY: number
  }
  /**
   * Максимальная длина имени
   */
  maxNameUser: number

  /**
   * Максимальные значения опций в игре
   */
  maximum: {
    /**
     * HP танка
     * @max 1000
     */
    health: number
    /**
     * Скорость передвижения базы
     * @max 500
     */
    speed: number
    /**
     * Скорость поворота базы, углов в сек
     * @max 180
     */
    speedRotate: number

    speedRotateTower: number
    accuracy: number
    /**
     * Время перезарядки, работает в обратном направлении
     * если 3800 то от максимума 4000 - 3800  = 200мс
     * @max 4000
     */
    timeRefreshWeapon: number
    /**
     * Дистанция наблюдения (разведки)
     * @max 1000
     */
    distanceView: number
    /**
     * Скорость полета снаряда
     * @max 50
     */
    speedShot: number
    /**
     * Дистанция полета снаряда
     * @max 800
     */
    distanceShot: number
  }
  /**
   * Шаги рандома для симуляции данных AI
   */
  steps: {
    /**
     * шаг - HP танка
     * @max 1000
     */
    health: number
    /**
     * шаг - Скорость передвижения базы
     * @max 700
     */
    speed: number
    /**
     * шаг - Скорость поворота базы, углов в сек
     * @max 180
     */
    speedRotate: number

    speedRotateTower: number
    accuracy: number
    timeRefreshWeapon: number
    distanceView: number
    speedShot: number
    distanceShot: number
  }

  /**
   * Стоимость шага улучшения
   */
  costUpdate: {
    health: number
    speed: number
    speedRotate: number
    speedRotateTower: number
    accuracy: number
    timeRefreshWeapon: number
    distanceView: number
    speedShot: number
    distanceShot: number
  }
  /**
   * Настройки мастерской
   */
  workshop: {
    sideWidth: number
    updateSideWidth: number
    colorHighProgress: number
    colorLowProgress: number
    colorValueProgress: number
  }

  /**
   * Шаг рангов
   */
  rankStep: {
    /**
     * Номер ранга
     */
    level: number
    /**
     * Минимальное количество баллов для получения ранга
     */
    minScore: number
  }[]

  /**
   * Перечислены, какие опции не могут качаться до максимума возможного, а только до начального уровня - восстанавливаться
   */
  optionsOnlyRepair: string[]
}

export interface ILeaderBoard {
  leaderboard: {
    title: { lang: string; value: string }[]
  }
  userRank: number
  entries: {
    rank: number
    score: number
    name: string
    lang: string
    photo: string
  }[]
}

declare global {
  interface Window {
    /**
     * Инициализация SDK
     * @returns
     */
    initSDK: () => void
    /**
     * Сохраняет прогресс игры
     * @param IGameData
     * @returns
     */
    saveGameData: (IGameData) => void
    /**
     * Отправляет рекорд на запись в лидерборд
     * @param
     * @returns IGameData
     */
    loadGameData: () => IGameData
    /**
     * Отправляет рекорд на запись в лидерборд
     * @param number
     * @returns
     */
    setLB: (number) => void
    /**
     * Показывает полноэкранную рекламу
     * @param callback
     * @returns
     */
    showFullSrcAdv: (callback: () => void) => void
    /**
     * Показывает рекламу по запросу
     * @param callback
     * @returns
     */
    showRewardedAdv: (callback: () => void) => void
    /**
     * Запрашивает и возвращает в ответе данные из лидерборда
     * @returns ILeaderBoard
     */
    getLB: () => ILeaderBoard
    /**
     * SDK
     */
    ysdk: any
    /**
     * Получение монет за портальную валюту
     * @param id - id покупки
     * @param callback
     * @returns
     */
    onPurchase: (id: string, callback: () => void) => void
  }
}

export interface IConfigRoundTeamPlayer {
  level: {
    from: number
    to: number
  }
  isPlayer: boolean
  gerbId: number
  rank: number
  // teamId: number
  spawnTile: Phaser.Types.Tilemaps.TiledObject
}

export interface IConfigRoundTeam {
  players: IConfigRoundTeamPlayer[]
  data: IConfigTeam
}
export interface IConfigRound {
  playerLevel: number
  teams: IConfigRoundTeam[]
  night: boolean
}
