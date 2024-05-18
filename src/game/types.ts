import { BonusType, WeaponType } from './options/gameOptions'
import { langs } from './lang'

export enum TypeRound {
  alone = 0,
  teams = 1
}

export enum KeyParticles {
  SmokePuff = 'smoke-puff',
  SmokeBoom = 'smoke-boom'
}

export enum KeySound {
  Move = 'motor_run',
  ExplodeBuild = 'explode_build',
  GetBonus = 'get_bonus',
  Muzzle1 = 'muzzle1',
  Muzzle2 = 'muzzle2',
  Muzzle5 = 'muzzle5',
  Click = 'click',
  DestroyTank = 'destroy_tank',
  AddCoin = 'add_coin',
  NewRank = 'new_rank',
  CheckWeapon = 'check_weapon',
  Upgrade = 'updgrade',
  Clock = 'clock',
  CartWeapon = 'cart_weapon',
  CartTank = 'cart_tank'
}

export type TLang = (typeof langs)['ru']

export interface IPlayerData {
  uid?: string
  name?: string
  photo?: string
  mode?: string
  /**
   * paying — пользователь купил яны на сумму более 500 рублей за последний месяц.
   *
   *  partially_paying — у пользователя была хотя бы одна покупка янов реальными деньгами за последний год.
   *
   *  not_paying — пользователь не делал покупок янов реальными деньгами за последний год.
   *
   *  unknown — пользователь не из РФ или он не разрешил передачу такой информации разработчику.
   */
  payStatus?: 'paying' | 'partially_paying' | 'not_paying' | 'unknown'
}

export interface IGameDataTank
  extends ITankConfigGameOptions,
    ITowerConfigGameOptions,
    IMuzzleConfigGameOptions {
  /**
   * ID танка в списке complexTank
   */
  id: string
  /**
   * Уровень танка = позиции танка в списке complexTank
   */
  // levelTank: number
  // levelTower: number
  // levelMuzzle: number
  /**
   * Количество боев для этого танка
   */
  cb: number
}

export interface IUserSettings {
  showArrow: boolean
  showToast: boolean
  showAreol: boolean
  autoShot: boolean
  showBar: boolean
  autoCheckWeapon: boolean
  friendlyFire: boolean
  towerForward: boolean
  showAllEnemyEye: boolean
  showHintKill: boolean
}

export interface IUIGameSettings {
  scrollGT: number
  scrollGW: number
  scrollST: number
  scrollSW: number
}

export interface IHelpData {
  move: number
  moveMobile: number
  friendly: number
  distanceView: number
  distanceShot: number
  distanceViewMy: number
  distanceShotMy: number
  destroyObject: number
  bonus: number
  weapon: number
  checkWeapon: number
  markers: number
}

export interface IGameData {
  playDay: number
  lastDay: Date
  lang: string
  giftDay: Date
  giftWeek: boolean
  name: string
  /**
   * Включен ли блокировщик рекламы у пользователя
   */
  adb: boolean
  gerbId: number
  /**
   * Количество боев
   */
  cb: number
  /**
   * Количество побед
   */
  cw: number
  settings: IUserSettings
  rank: number
  score: number
  activeTankIndex: number
  tanks: IGameDataTank[]
  weapons: {
    [key in WeaponType]: number
  }
  // bullet: IBulletConfig[]
  coin: number
  help: IHelpData
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
   *
   * Управляется разрывами, берется случайное число, берутся все записи, что меньше или равно и из них выбирается максимальное
   */
  probability: number
  /**
   * Размер бонуса для начисления, %
   *
   * -1 - пополнить до максимума
   */
  value: number
}

export interface IMuzzleConfigItem {
  /**
   * Звук выстрела
   */
  sound: KeySound
  frame: number
  /**
   * Название анимации
   */
  keyAnimation: string
  center: { x: number; y: number }
  /**
   * Поддерживаемые снаряды
   */
  supportWeapons: WeaponType[]
  /**
   * Коэфициент усиления снарядов
   */
  weaponKoof: number
  /**
   * Время реакции перед выстрелом, мсек
   */
  maxTimeBeforeShoot: {
    min: number
    max: number
  }
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
  /**
   * Цвет зоны наведения
   */
  colorDistanceView: number
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
   * @max 120
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
  id: string
  name: string
  /**
   * Цвет танка (HEX)
   */
  color: string
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
  /**
   * Сколько создается на карте (value*level player)
   */
  count: number
  /**
   * Стоимость 1 снаряда
   */
  cost: number
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

export interface ITypeRoundConfig {
  /**
   * Тип раунда
   */
  type: TypeRound
  /**
   * Количество команд на поле
   */
  countTeams: number
  /**
   * Количество игроков в команде
   */
  maxCountPlayers: number
  /**
   * Карта
   */
  mapKey: string
}

export interface IGameOptions {
  /**
   * Сохранять ли снаряды, подобранные на поле
   */
  saveWeapons: boolean
  /**
   * Количество монет в подарок за один день
   */
  countCoinByPlayDay: number
  /**
   * Сложность раундов
   * @min 1
   * @max 3
   */
  complexity: number
  /**
   * Время сеанса до вручения подарка
   */
  timeBeforeGift: number
  /**
   * Звания
   */
  ranks: IRankItem[]
  /**
   * Шаг рангов
   */
  destroyObjects: IDestroyObject[]
  weaponObjects: IWeaponObject[]
  localStorageSettingsName: string
  /**
   * Время показа заставки в начале раунда
   */
  timeHelloRound: number
  /**
   * Время показа сообщений на поле боя
   */
  timeShowHints: number
  /**
   * Пакеты для покупки монет за рекламу
   */
  packetPaymentsAd: IPacketPaymentsItem[]
  /**
   * Пакеты для покупки монет за портальную валюту
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
  /**
   * Будет ли в игре кнопка удвоить награду за раунд за рекламу
   */
  isDoubleRewardAdv: boolean
  /**
   * Будут ли в игре монеты за портальную валюту
   */
  isPacketPortal: boolean
  /**
   * Будет ли в игре лидерборд
   */
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
   * Ширина границы зоны наведения и обстрела
   */
  widthLineArea: number
  /**
   * Тип раунда
   */
  typesRound: ITypeRoundConfig[]

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
    /**
     * Цвет гусениц
     */
    caterpillar: number
    buttonPrimary: string
    buttonSecondary: string
    darkColor: string
    lightColor: string
    secondaryColor: string
    accent: string
    danger: string
    secondaryColorLight: string
    colorWeaponBg: string
    success: string
    ad: string
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
     * @max 120
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
     * @max 120
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
    gameLocalStorageName: string
    /**
     * Шифровать ли данные игры в строку при сохранении
     */
    tobData: boolean
    /**
     * Язык по умолчанию
     */
    defaultLang: string
    /**
     * SDK
     */
    sdk: any
    /**
     * Объект, передаваемый сценам при создании
     */
    game: {
      currentLang?: TLang
      gameData?: IGameData
      playerData?: IPlayerData
    }
    /**
     * Вернуть статус авторизации пользователя
     */
    getModePlayer: () => 'auth' | 'lite'
    /**
     * Старт загрузки игры
     * @returns
     */
    onSdkGameLoadingStart: () => void
    /**
     * Загрузка игры завершена
     * @returns
     */
    onSdkGameLoadingStop: () => void
    /**
     * Стоп геймплея
     * @returns
     */
    onGameplayStop: () => void
    /**
     * Старт геймплея
     * @returns
     */
    onGameplayStart: () => void
    /**
     * Получить данные профиля пользователя
     * @returns
     */
    //getPlayerData: () => Promise<IPlayerData>
    /**
     * Инициализация лидерборда
     * @returns
     */
    initLB: () => Promise<unknown>
    /**
     * Инициализация пользователя
     * @returns playerData
     */
    initPlayer: () => Promise<IPlayerData>
    /**
     * Возвращает язык локализации
     * @returns string
     */
    getLang: () => string
    /**
     * Инициализация SDK
     * @returns
     */
    initSDK: () => Promise<any>
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
    loadGameData: () => Promise<IGameData>
    /**
     * Отправляет рекорд на запись в лидерборд
     * @param number
     * @returns
     */
    setLB: (number) => void
    /**
     * Торжественное событие в игре
     */
    onHappyTime: () => void
    /**
     * Проверяем блокировщик рекламы
     * @param callback
     * @returns
     */
    hasAdBlocker: () => Promise<boolean>
    /**
     * Показывает полноэкранную рекламу
     * @param callback
     * @returns
     */
    showFullSrcAdv: (callback: () => void) => void
    /**
     * Показывает рекламу по запросу
     * @param adCallbacks: IADCallbacks
     * @returns
     */
    showRewardedAdv: (adCallbacks: IADCallbacks) => void
    /**
     * Запрашивает и возвращает в ответе данные из лидерборда
     * @returns ILeaderBoard
     */
    getLB: () => Promise<ILeaderBoard>
    /**
     * Получение монет за портальную валюту
     * @param id - id покупки
     * @param callback
     * @returns
     */
    onPurchase: (id: string, callback: () => void) => void
  }
}

export interface IADCallbacks {
  successC: () => void
  errorC: () => void
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
  config: ITypeRoundConfig
  playerIndexTank: number
  teams: IConfigRoundTeam[]
  night: boolean
}
