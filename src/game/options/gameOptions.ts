import { IGameOptions, PacketPaymentsType, TypeRound } from '../types'

export enum BonusType {
  health = 1,
  bullet = 2,
  speed = 3,
  distanceView = 4,
  timeRefreshWeapon = 5,
  speedRotate = 6,
  speedRotateTower = 7,
  accuracy = 8,
  speedShot = 9,
  distanceShot = 10
}

export enum WeaponType {
  default = 0,
  armor = 1,
  cumulative = 2,
  subcaliber = 3,
  energy = 4,
  explosive = 5
}

export const mapObjectCategory = 0x0001,
  tankCategory = 0x0002,
  tankAmunition = 0x0003,
  weaponCategory = 0x0004,
  bonusCategory = 0x0005,
  caterpillarCategory = 0x0006,
  bulletCategory = 0x0007,
  sensorCategory = 0x0008

export const GameOptions: IGameOptions = {
  localStorageName: 'com.mikalai2006.tanksbattle.4',
  localStorageSettingsName: 'uiSettings',
  complexity: 1,
  lang: 'ru',
  typesRound: [
    {
      type: TypeRound.alone,
      countPlayers: 20,
      countTeams: 1
    },
    {
      type: TypeRound.teams,
      countTeams: 2,
      countPlayers: 13
    }
  ],
  configTeams: [
    {
      name: 'First',
      color: 0x708090,
      colorAttackZone: 0xffffff,
      colorDistanceView: 0xff8c00
    },
    {
      name: 'Second',
      color: 0xf5deb3,
      colorAttackZone: 0xff0000,
      colorDistanceView: 0xff1493
    }
  ],
  colors: {
    health: 0x84cc16,

    caterpillar: 0x1f2937
  },
  maxNameUser: 25,
  countGerb: 60,
  marginMarker: 23,
  teamBarSize: {
    height: 34,
    width: 300,
    offsetX: 580,
    offsetY: 0
  },
  ai: {
    timeActions: {
      max: 2000,
      min: 1000
    }
  },
  bonuses: [
    {
      type: BonusType.health,
      frame: 0,
      timeRefresh: 10000,
      duration: -1,
      color: 0x7cfc00,
      probability: 1,
      value: -1
    },
    {
      type: BonusType.speed,
      frame: 1,
      timeRefresh: 10000,
      duration: 10000,
      color: 0xffd700,
      probability: 1,
      value: 100
    },
    {
      type: BonusType.timeRefreshWeapon,
      frame: 2,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 100
    },
    {
      type: BonusType.distanceView,
      frame: 3,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 50
    },
    {
      type: BonusType.speedRotate,
      frame: 4,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 20
    },
    {
      type: BonusType.speedRotateTower,
      frame: 5,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 20
    },
    {
      type: BonusType.accuracy,
      frame: 6,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 10
    },
    {
      type: BonusType.distanceShot,
      frame: 7,
      timeRefresh: -1,
      duration: -1,
      color: 0xffd700,
      probability: 1,
      value: 50
    }
  ],
  wrapBounds: {
    wrap: {
      min: { x: 0, y: 0 },
      max: { x: 1920, y: 1080 }
    }
  },

  offsetAttackZone: 30,
  minAngleArc: 5,
  maxAccuracityTower: 25,

  muzzles: {
    key: 'muzzle',
    items: [
      {
        frame: 0,
        keyAnimation: 'muzzle1',
        centerConstraint: { x: 0, y: 0 },
        offset: { xOffset: -0.8 },
        center: { x: -35, y: 0 },
        game: {
          speedShot: 10,
          distanceShot: 150
        },
        vert: [
          { x: 70, y: 40 },
          { x: 70, y: 54 },
          { x: 0, y: 54 },
          { x: 0, y: 40 }
        ],
        countShot: 1
      },
      {
        frame: 6,
        keyAnimation: 'muzzle2',
        centerConstraint: { x: 0, y: 0 },
        offset: { xOffset: -0.85 },
        center: { x: -40, y: 0 },
        game: {
          speedShot: 15,
          distanceShot: 300
        },
        vert: [
          { x: 90, y: 40 },
          { x: 90, y: 54 },
          { x: 0, y: 54 },
          { x: 0, y: 40 }
        ],
        countShot: 1
      },
      {
        frame: 12,
        keyAnimation: 'muzzle3',
        centerConstraint: { x: 0, y: 0 },
        offset: { xOffset: -0.85 },
        center: { x: -40, y: 0 },
        game: {
          speedShot: 20,
          distanceShot: 400
        },
        vert: [
          { x: 90, y: 40 },
          { x: 90, y: 54 },
          { x: 0, y: 54 },
          { x: 0, y: 40 }
        ],
        countShot: 1
      },
      {
        frame: 18,
        keyAnimation: 'muzzle4',
        centerConstraint: { x: 0, y: 0 },
        offset: { xOffset: -0.85 },
        center: { x: -40, y: 0 },
        game: {
          speedShot: 20,
          distanceShot: 400
        },
        vert: [
          { x: 90, y: 40 },
          { x: 90, y: 54 },
          { x: 0, y: 54 },
          { x: 0, y: 40 }
        ],
        countShot: 1
      },
      {
        frame: 30,
        keyAnimation: 'muzzle6',
        centerConstraint: { x: 0, y: 0 },
        offset: { xOffset: -0.85 },
        center: { x: -40, y: 0 },
        game: {
          speedShot: 25,
          distanceShot: 500
        },
        vert: [
          { x: 90, y: 30 },
          { x: 90, y: 64 },
          { x: 0, y: 64 },
          { x: 0, y: 30 }
        ],
        countShot: 2
      }
    ]
  },

  towers: {
    key: 'tower',
    items: [
      {
        frame: 0,
        game: {
          speedRotateTower: 90,
          accuracy: 40,
          timeRefreshWeapon: 1000,
          distanceView: 300
        }
      },
      {
        frame: 1,
        game: {
          speedRotateTower: 100,
          accuracy: 40,
          timeRefreshWeapon: 1050,
          distanceView: 310
        }
      },
      {
        frame: 2,
        game: {
          speedRotateTower: 110,
          accuracy: 40,
          timeRefreshWeapon: 1100,
          distanceView: 320
        }
      },
      {
        frame: 3,
        game: {
          speedRotateTower: 120,
          accuracy: 42,
          timeRefreshWeapon: 1150,
          distanceView: 350
        }
      },
      {
        frame: 4,
        game: {
          speedRotateTower: 130,
          accuracy: 44,
          timeRefreshWeapon: 1200,
          distanceView: 380
        }
      },
      {
        frame: 5,
        game: {
          speedRotateTower: 140,
          accuracy: 46,
          timeRefreshWeapon: 1300,
          distanceView: 390
        }
      },
      {
        frame: 6,
        game: {
          speedRotateTower: 150,
          accuracy: 48,
          timeRefreshWeapon: 1400,
          distanceView: 400
        }
      },
      {
        frame: 7,
        game: {
          speedRotateTower: 160,
          accuracy: 51,
          timeRefreshWeapon: 1500,
          distanceView: 410
        }
      },
      {
        frame: 8,
        game: {
          speedRotateTower: 170,
          accuracy: 54,
          timeRefreshWeapon: 1600,
          distanceView: 420
        }
      },
      {
        frame: 9,
        game: {
          speedRotateTower: 180,
          accuracy: 57,
          timeRefreshWeapon: 1700,
          distanceView: 430
        }
      },
      {
        frame: 10,
        game: {
          speedRotateTower: 190,
          accuracy: 58,
          timeRefreshWeapon: 1800,
          distanceView: 440
        }
      },
      {
        frame: 11,
        game: {
          speedRotateTower: 200,
          accuracy: 58,
          timeRefreshWeapon: 2100,
          distanceView: 500
        }
      },
      {
        frame: 12,
        game: {
          speedRotateTower: 250,
          accuracy: 70,
          timeRefreshWeapon: 2500,
          distanceView: 550
        }
      }
      // {
      //   frame: 14,
      //   game: {
      //     speedRotateTower: 200,
      //     accuracy: 65,
      //     timeRefreshWeapon: 2100,
      //     distanceView: 500
      //   }
      // }
    ]
  },
  tanks: {
    key: 'tank',
    items: [
      {
        frame: 0,
        game: {
          speedRotate: 60,
          speed: 200,
          health: 100
        },
        catYOffset: 27,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 50 },
          { x: 108, y: 70 },
          { x: 20, y: 70 },
          { x: 0, y: 50 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 1,
        game: {
          speedRotate: 65,
          speed: 210,
          health: 150
        },
        catYOffset: 27,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 50 },
          { x: 108, y: 70 },
          { x: 20, y: 70 },
          { x: 0, y: 50 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 2,
        game: {
          speedRotate: 65,
          speed: 210,
          health: 250
        },
        catYOffset: 35,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 65 },
          { x: 108, y: 85 },
          { x: 20, y: 85 },
          { x: 0, y: 65 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 3,
        game: {
          speedRotate: 70,
          speed: 220,
          health: 350
        },
        catYOffset: 30,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 65 },
          { x: 108, y: 85 },
          { x: 20, y: 85 },
          { x: 0, y: 65 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 4,
        game: {
          speedRotate: 75,
          speed: 230,
          health: 380
        },
        catYOffset: 27,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 50 },
          { x: 108, y: 70 },
          { x: 20, y: 70 },
          { x: 0, y: 50 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 5,
        game: {
          speedRotate: 80,
          speed: 250,
          health: 400
        },
        catYOffset: 27,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 50 },
          { x: 108, y: 70 },
          { x: 20, y: 70 },
          { x: 0, y: 50 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 6,
        game: {
          speedRotate: 85,
          speed: 260,
          health: 450
        },
        catYOffset: 35,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 65 },
          { x: 108, y: 85 },
          { x: 20, y: 85 },
          { x: 0, y: 65 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 7,
        game: {
          speedRotate: 90,
          speed: 270,
          health: 480
        },
        catYOffset: 30,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 65 },
          { x: 108, y: 85 },
          { x: 20, y: 85 },
          { x: 0, y: 65 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      },
      {
        frame: 8,
        game: {
          speedRotate: 95,
          speed: 275,
          health: 500
        },
        catYOffset: 27,
        offset: { yOffset: 0, xOffset: 0 },
        vert: [
          { x: 108, y: 0 },
          { x: 128, y: 20 },
          { x: 128, y: 50 },
          { x: 108, y: 70 },
          { x: 20, y: 70 },
          { x: 0, y: 50 },
          { x: 0, y: 20 },
          { x: 20, y: 0 }
        ]
      }
      // {
      //   frame: 9,
      //   game: {
      //     speedRotate: 100,
      //     speed: 280,
      //     health: 500
      //   },
      //   catYOffset: 27,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 50 },
      //     { x: 108, y: 70 },
      //     { x: 20, y: 70 },
      //     { x: 0, y: 50 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // },
      // {
      //   frame: 10,
      //   game: {
      //     speedRotate: 100,
      //     speed: 290,
      //     health: 550
      //   },
      //   catYOffset: 35,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 65 },
      //     { x: 108, y: 85 },
      //     { x: 20, y: 85 },
      //     { x: 0, y: 65 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // },
      // {
      //   frame: 11,
      //   game: {
      //     speedRotate: 100,
      //     speed: 300,
      //     health: 600
      //   },
      //   catYOffset: 30,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 65 },
      //     { x: 108, y: 85 },
      //     { x: 20, y: 85 },
      //     { x: 0, y: 65 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // },
      // {
      //   frame: 23,
      //   game: {
      //     speedRotate: 100,
      //     speed: 300,
      //     health: 600
      //   },
      //   catYOffset: 30,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 65 },
      //     { x: 108, y: 85 },
      //     { x: 20, y: 85 },
      //     { x: 0, y: 65 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // },
      // {
      //   frame: 15,
      //   game: {
      //     speedRotate: 100,
      //     speed: 300,
      //     health: 600
      //   },
      //   catYOffset: 30,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 65 },
      //     { x: 108, y: 85 },
      //     { x: 20, y: 85 },
      //     { x: 0, y: 65 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // },
      // {
      //   frame: 19,
      //   game: {
      //     speedRotate: 100,
      //     speed: 300,
      //     health: 600
      //   },
      //   catYOffset: 30,
      //   offset: { yOffset: 0, xOffset: 0 },
      //   vert: [
      //     { x: 108, y: 0 },
      //     { x: 128, y: 20 },
      //     { x: 128, y: 65 },
      //     { x: 108, y: 85 },
      //     { x: 20, y: 85 },
      //     { x: 0, y: 65 },
      //     { x: 0, y: 20 },
      //     { x: 20, y: 0 }
      //   ]
      // }
    ]
  },

  minicameraW: 200,
  minicameraH: 200,
  minicameraOffset: 20,
  minicameraZoom: 0.05,

  minDistanceFollowPlayer: 500,

  isLeaderBoard: true,
  isBank: true,
  isAdv: true,
  packetPayments: [
    {
      type: PacketPaymentsType.Ad,
      cost: 0,
      countCoin: 100,
      texture: 'clipart',
      frame: 2,
      id: ''
    },
    {
      type: PacketPaymentsType.Yan,
      cost: 5,
      countCoin: 500,
      texture: 'clipart',
      frame: 3,
      id: ''
    },
    {
      type: PacketPaymentsType.Yan,
      cost: 10,
      countCoin: 2000,
      texture: 'clipart',
      frame: 3,
      id: ''
    },
    {
      type: PacketPaymentsType.Yan,
      cost: 20,
      countCoin: 5000,
      texture: 'clipart',
      frame: 3,
      id: ''
    },
    {
      type: PacketPaymentsType.Yan,
      cost: 50,
      countCoin: 50000,
      texture: 'clipart',
      frame: 3,
      id: ''
    }
  ],

  screen: {
    width: 1920,
    height: 1080
  },

  ui: {
    white: '#cad1dc',
    primaryColorNumber: 0x94a3b8,
    primaryColor: '#94a3b8',
    successColor: '#84cc16',
    panelBgColor: 0x0f172a, // 0x4a5449,
    panelBgColorLight: 0x94a3b8,
    progressLight: 0xffa500,
    progressBgColor: 0x555555,
    panelBgColorAccent: 0xe1d41c,
    buttonBgColor: 0x1e293b, //475569,
    buttonTextColor: '#fff8dc',
    activeText: '#ADFF2F',
    activeTextNumber: 0xe1d41c, //0x84cc16,
    dangerText: '#FF7F50',
    pathColor: 0x404040,
    accent: '#e1d41c',
    accentNumber: 0xe1d41c,

    colorWeaponBg: '#FFD700'
  },
  workshop: {
    sideWidth: 600,
    updateSideWidth: 700,
    colorHighProgress: 0x84cc16,
    colorLowProgress: 0xff6347,
    colorValueProgress: 0xe1d41c
  },
  maximum: {
    health: 1000,
    speed: 500,
    speedRotate: 120,
    speedRotateTower: 360,
    accuracy: 100,
    timeRefreshWeapon: 4000,
    distanceView: 1000,
    speedShot: 50,
    distanceShot: 800
  },
  steps: {
    health: 50,
    speed: 30,
    speedRotate: 10,
    speedRotateTower: 10,
    accuracy: 5,
    timeRefreshWeapon: 100,
    distanceView: 50,
    speedShot: 5,
    distanceShot: 50
  },
  optionsOnlyRepair: ['health'],
  costUpdate: {
    health: 20,
    speed: 10,
    speedRotate: 25,
    speedRotateTower: 15,
    accuracy: 40,
    timeRefreshWeapon: 10,
    distanceView: 10,
    speedShot: 200,
    distanceShot: 20
  },
  complexTanks: [
    {
      id: '001',
      name: 'T-000',
      color: '#889869',
      tank: 0,
      tower: 0,
      muzzle: 0,
      cost: 0,
      rank: 0,
      maxTimeBeforeShoot: {
        min: 1500,
        max: 3000
      }
    },
    {
      id: '002',
      name: 'T-110',
      color: '#889869',
      tank: 1,
      tower: 1,
      muzzle: 0,
      cost: 5000,
      rank: 0,
      maxTimeBeforeShoot: {
        min: 1500,
        max: 3000
      }
    },
    {
      id: '003',
      name: 'T-220',
      color: '#889869',
      tank: 2,
      tower: 2,
      muzzle: 0,
      cost: 20000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '004',
      name: 'T-001',
      color: '#889869',
      tank: 0,
      tower: 0,
      muzzle: 1,
      cost: 6000,
      rank: 0,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '005',
      name: 'T-111',
      color: '#889869',
      tank: 1,
      tower: 1,
      muzzle: 1,
      cost: 17000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '006',
      name: 'T-221',
      color: '#889869',
      tank: 2,
      tower: 2,
      muzzle: 1,
      cost: 38000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '007',
      name: 'T-002',
      color: '#889869',
      tank: 0,
      tower: 0,
      muzzle: 2,
      cost: 8000,
      rank: 1,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '008',
      name: 'T-112',
      color: '#889869',
      tank: 1,
      tower: 1,
      muzzle: 2,
      cost: 28000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '009',
      name: 'T-222',
      color: '#889869',
      tank: 2,
      tower: 2,
      muzzle: 2,
      cost: 45000,
      rank: 4,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '010',
      name: 'T-003',
      color: '#889869',
      tank: 0,
      tower: 0,
      muzzle: 3,
      cost: 10000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '011',
      name: 'T-113',
      color: '#889869',
      tank: 1,
      tower: 1,
      muzzle: 3,
      cost: 28000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '012',
      name: 'T-223',
      color: '#889869',
      tank: 2,
      tower: 2,
      muzzle: 3,
      cost: 45000,
      rank: 4,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '013',
      name: 'X-300',
      color: '#889869',
      tank: 3,
      tower: 0,
      muzzle: 0,
      cost: 15000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '014',
      name: 'X-310',
      color: '#889869',
      tank: 3,
      tower: 1,
      muzzle: 0,
      cost: 25000,
      rank: 2,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '015',
      name: 'X-320',
      color: '#889869',
      tank: 3,
      tower: 2,
      muzzle: 0,
      cost: 30000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '016',
      name: 'X-330',
      color: '#889869',
      tank: 3,
      tower: 3,
      muzzle: 0,
      cost: 40000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '017',
      name: 'X-301',
      color: '#889869',
      tank: 3,
      tower: 0,
      muzzle: 1,
      cost: 34000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '018',
      name: 'X-302',
      color: '#889869',
      tank: 3,
      tower: 0,
      muzzle: 2,
      cost: 42000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '019',
      name: 'X-303',
      color: '#889869',
      tank: 3,
      tower: 0,
      muzzle: 3,
      cost: 43000,
      rank: 3,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '020',
      name: 'X-313',
      color: '#889869',
      tank: 3,
      tower: 1,
      muzzle: 3,
      cost: 47000,
      rank: 4,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '021',
      name: 'X-323',
      color: '#889869',
      tank: 3,
      tower: 2,
      muzzle: 3,
      cost: 48000,
      rank: 4,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '022',
      name: 'X-333',
      color: '#889869',
      tank: 3,
      tower: 3,
      muzzle: 3,
      cost: 50000,
      rank: 5,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '023',
      name: 'Z-450',
      color: '#FFEBCD',
      tank: 4,
      tower: 5,
      muzzle: 0,
      cost: 50000,
      rank: 5,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '024',
      name: 'Z-460',
      color: '#FFEBCD',
      tank: 4,
      tower: 6,
      muzzle: 0,
      cost: 53000,
      rank: 5,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '025',
      name: 'Z-470',
      color: '#FFEBCD',
      tank: 4,
      tower: 7,
      muzzle: 0,
      cost: 55000,
      rank: 5,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '026',
      name: 'Z-480',
      color: '#FFEBCD',
      tank: 4,
      tower: 8,
      muzzle: 0,
      cost: 60000,
      rank: 6,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '027',
      name: 'Z-490',
      color: '#FFEBCD',
      tank: 4,
      tower: 9,
      muzzle: 0,
      cost: 65000,
      rank: 6,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '028',
      name: 'Z-561',
      color: '#FFEBCD',
      tank: 5,
      tower: 6,
      muzzle: 1,
      cost: 57000,
      rank: 6,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '029',
      name: 'Z-562',
      color: '#FFEBCD',
      tank: 5,
      tower: 6,
      muzzle: 2,
      cost: 63000,
      rank: 6,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '030',
      name: 'Z-573',
      color: '#FFEBCD',
      tank: 5,
      tower: 7,
      muzzle: 3,
      cost: 70000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '031',
      name: 'Z-683',
      color: '#FFFACD',
      tank: 6,
      tower: 8,
      muzzle: 3,
      cost: 78000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '032',
      name: 'Z-583',
      color: '#FFFACD',
      tank: 5,
      tower: 8,
      muzzle: 3,
      cost: 75000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '033',
      name: 'Z-593',
      color: '#FFFACD',
      tank: 5,
      tower: 9,
      muzzle: 3,
      cost: 80000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '034',
      name: 'Z-752',
      color: '#889869',
      tank: 7,
      tower: 5,
      muzzle: 2,
      cost: 62000,
      rank: 6,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '035',
      name: 'Z-763',
      color: '#FFEBCD',
      tank: 7,
      tower: 6,
      muzzle: 3,
      cost: 68000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '036',
      name: 'Z-773',
      color: '#FFEBCD',
      tank: 7,
      tower: 7,
      muzzle: 3,
      cost: 72000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '040',
      name: 'M-8102',
      color: '#889869',
      tank: 8,
      tower: 10,
      muzzle: 2,
      cost: 95000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 1400,
        max: 2800
      }
    },
    {
      id: '041',
      name: 'M-8103',
      color: '#889869',
      tank: 8,
      tower: 10,
      muzzle: 3,
      cost: 95000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 100,
        max: 300
      }
    },
    {
      id: '042',
      name: 'M-8104',
      color: '#889869',
      tank: 8,
      tower: 10,
      muzzle: 4,
      cost: 95000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 100,
        max: 300
      }
    },
    {
      id: '043',
      name: 'M-8114',
      color: '#FAEBD7',
      tank: 8,
      tower: 11,
      muzzle: 4,
      cost: 95000,
      rank: 7,
      maxTimeBeforeShoot: {
        min: 100,
        max: 300
      }
    },
    {
      id: '044',
      name: 'M-8124 Killer',
      color: '#F5DEB3',
      tank: 8,
      tower: 12,
      muzzle: 4,
      cost: 200000,
      rank: 8,
      maxTimeBeforeShoot: {
        min: 100,
        max: 300
      }
    }
  ],
  excludeFromStretchOptions: ['levelTower', 'levelTank', 'levelMuzzle', 'cb', 'id'],
  weaponObjects: [
    {
      type: WeaponType.default,
      count: 10,
      texture: 'weapon',
      frame: 0,
      vert: [
        { x: 30, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 80 },
        { x: 30, y: 80 }
      ],
      timeRefresh: -1,
      damage: 10,
      cost: -1,
      scaleCrator: 1,
      frameParticleMuzzle: 'white',
      color: 0xffd189,
      configParticlesBoom: {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        // lifespan: 1000,
        // angle: { min: -100, max: -80 },
        color: [0x666666, 0xffd189, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0.5, ease: 'sine.out' },
        speed: 50
        // advance: 1000,
        //duration: 500
      }
    },
    {
      type: WeaponType.subcaliber,
      count: 3,
      texture: 'weapon',
      frame: 3,
      vert: [
        { x: 30, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 80 },
        { x: 30, y: 80 }
      ],
      timeRefresh: 20000,
      damage: 20,
      cost: 20,
      scaleCrator: 1.4,
      frameParticleMuzzle: 'white',
      color: 0x555555,
      configParticlesBoom: {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        lifespan: 1000,
        // angle: { min: -100, max: -80 },
        color: [0x111111, 0x40942f, 0xf89800, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0.5, ease: 'sine.out' },
        speed: 50,
        // advance: 1000,
        duration: 500
      }
    },
    {
      type: WeaponType.cumulative,
      count: 5,
      texture: 'weapon',
      frame: 2,
      vert: [
        { x: 30, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 80 },
        { x: 30, y: 80 }
      ],
      timeRefresh: 30000,
      damage: 30,
      cost: 30,
      scaleCrator: 1.2,
      frameParticleMuzzle: 'red',
      color: 0xbb1919,
      configParticlesBoom: {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        lifespan: 1000,
        // angle: { min: -100, max: -80 },
        color: [0x111111, 0xbb1919, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0.5, ease: 'sine.out' },
        speed: 50,
        // advance: 1000,
        duration: 500
      }
    },
    {
      type: WeaponType.explosive,
      count: 3,
      texture: 'weapon',
      frame: 5,
      vert: [
        { x: 30, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 80 },
        { x: 30, y: 80 }
      ],
      timeRefresh: 40000,
      damage: 50,
      cost: 50,
      scaleCrator: 0.8,
      frameParticleMuzzle: 'yellow',
      color: 0xcab719,
      configParticlesBoom: {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        lifespan: 1000,
        // angle: { min: -100, max: -80 },
        color: [0x111111, 0xbb1919, 0xcab719, 0xf89800, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0.5, ease: 'sine.out' },
        speed: 50,
        // advance: 1000,
        duration: 500
      }
    },
    {
      type: WeaponType.energy,
      count: 3,
      texture: 'weapon',
      frame: 4,
      vert: [
        { x: 30, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 80 },
        { x: 30, y: 80 }
      ],
      timeRefresh: 60000,
      damage: 100,
      cost: 100,
      scaleCrator: 0.5,
      frameParticleMuzzle: 'blue',
      color: 0x6495ed,
      configParticlesBoom: {
        frame: 1,
        // quantity: 0.01,
        blendMode: 'ADD',
        // frequency: 5,
        lifespan: 500,
        // angle: { min: -180, max: 180 },
        color: [0x111111, 0x6495ed, 0x222222],
        colorEase: 'quad.out',
        scale: { start: 0.7, end: 0, ease: 'sine.out' },
        speed: 20,
        // advance: 1000,
        duration: 300
      }
    }
  ],
  destroyObjects: [
    {
      texture: 'building',
      frameStart: 0,
      frameEnd: 1,
      vert: [
        { x: 10, y: 10 },
        { x: 100, y: 10 },
        { x: 100, y: 100 },
        { x: 10, y: 100 }
      ]
    },
    {
      texture: 'building',
      frameStart: 2,
      frameEnd: 3,
      vert: [
        { x: 10, y: 10 },
        { x: 80, y: 10 },
        { x: 80, y: 80 },
        { x: 10, y: 80 }
      ]
    },
    {
      texture: 'building',
      frameStart: 4,
      frameEnd: 5,
      vert: [
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 80, y: 80 },
        { x: 20, y: 80 }
      ]
    },
    {
      texture: 'building',
      frameStart: 6,
      frameEnd: 7,
      vert: [
        { x: 10, y: 10 },
        { x: 100, y: 10 },
        { x: 100, y: 90 },
        { x: 10, y: 90 }
      ]
    },
    {
      texture: 'building',
      frameStart: 8,
      frameEnd: 9,
      vert: [
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 80, y: 80 },
        { x: 20, y: 80 }
      ]
    }
  ],
  ranks: [
    {
      rank: 0,
      range: [0, 5000]
    },
    {
      rank: 1,
      range: [5000, 10000]
    },
    {
      rank: 2,
      range: [10000, 25000]
    },
    {
      rank: 3,
      range: [25000, 50000]
    },
    {
      rank: 4,
      range: [50000, 100000]
    },
    {
      rank: 5,
      range: [100000, 250000]
    },
    {
      rank: 6,
      range: [250000, 500000]
    },
    {
      rank: 7,
      range: [500000, 1000000]
    },
    {
      rank: 8,
      range: [1000000, 10000000000000]
    }
  ]
}
