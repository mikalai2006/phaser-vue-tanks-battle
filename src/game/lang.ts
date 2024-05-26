export const langs = {
  ru: {
    code: 'ru',
    codeName: 'Ру',
    name: 'Русский',
    name_game: 'Crazy tanks',
    workShopTitle: 'Мастерская',
    options: {
      health: 'HP',
      speed: 'Скорость передвижения',
      speedRotate: 'Маневренность',
      speedRotateTower: 'Скорость вращения башни',
      accuracy: 'Точность наведения',
      timeRefreshWeapon: 'Время перезарядки',
      distanceView: 'Дистанция наведения',
      speedShot: 'Скорость снарядов',
      distanceShot: 'Дистанция стрельбы'
    },
    weapons: {
      default: 'Обычный',
      cumulative: 'Кумулятивный',
      armor: 'Бронебойный',
      energy: 'Энергетический',
      subcaliber: 'Подкалиберный',
      explosive: 'Бронебойно-фугасный'
    },
    weapon: 'снаряд',
    activeWeapon: 'Активный снаряд - %s',
    noneWeapon: 'Закончился %s снаряд!',
    norank: 'Требуется звание - \r\n',
    rank: [
      'Ефрейтор',
      'Мл. сержант',
      'Сержант',
      'Лейтенант',
      'Ст. лейтенант',
      'Капитан',
      'Майор',
      'Подполковник',
      'Полковник',
      'Генерал-майор',
      'Генерал-лейтенант',
      'Генерал-полковник',
      'Маршал'
    ],
    update: 'Улучшить',
    giftHint: 'До получения подарка осталось %s мин. %s сек.',
    giftTitle: 'Ежедневный подарок',
    giftGet: 'Получить подарок',
    giftDescription:
      'Вы получаете небольшой подарок! Такой подарок будет доступен вам каждый день!',
    damage: 'Базовый урон',
    my: 'Мои ',
    updateTitle: 'Улучшение ТТХ',
    updateText: 'Вы хотите улучшить %s на ~%s% за %s монет?',
    updateTextSlider:
      'Перетаскивайте слайдер(белый круг), чтобы выбрать необходимый уровень улучшения',
    cartWeaponsText: 'Вы хотите совершить покупку: %s %s - %s шт. за %s монет?',
    cartWeaponsTextSlider:
      'Перетаскивайте слайдер(белый круг), чтобы указать сколько хотите купить снарядов',
    shopTitle: 'Магазин',
    pc: 'шт.',
    stretch: 'Сила',
    check: 'Выбрать',
    cart: 'Купить',
    cartTitle: 'Покупка',
    cartText: 'Вы хотите купить %s за %s монет?',
    inGaraz: 'В гараже',
    tanksPage: 'Танки',
    weaponsPage: 'Снаряды',
    exist: 'В наличии:',
    repair: 'Восстановление',
    maxValue: 'Максимум',
    notMany: 'Не хватает монет',
    bank: 'Банк',
    bankDescription: 'Здесь можно получить монеты',
    return: 'Назад',
    getAdv: 'Получить за просмотр рекламы',
    getYan: 'Получить за %s янов',
    getCoinSuccess: '%s монет успешно добавлены на ваш счет!',
    backToBank: 'Заходите за монетами в любое время!',
    controlTitle: 'Настройки',
    exitFromRound: 'Завершить раунд',
    gameOverPlayer: 'Ваш танк подбит, но не отчаивайтесь, вы всегда можете начать новый раунд!',
    winTeam: 'Ваша команда одержала победу',
    winAlone: 'Вы одержали победу',
    roundReward: 'В этом бою вы заработали %s монет!',
    gameOverTitle: 'Поражение',
    winTitle: 'Победа',
    getReward: 'Забрать награду',
    getReward2: 'Забрать удвоенную награду, посмотрев рекламу',
    settings: {
      showArrow: 'Показывать стрелку направления движения прямо для вашего танка',
      showAreol: 'Подсвечивать ваш танк',
      autoShot: 'Автоматическая стрельба при успешном наведении',
      showBar: 'Показать информацию о HP и перезарядке около танка на карте',
      autoCheckWeapon:
        'Автоматическое управление снарядами. Если включено - будет устанавливать активными сильнейшие снаряды из тех что есть',
      friendlyFire:
        'Дружественный огонь. Если включено - снаряды наносят урон всем танкам, в том числе и дружественным',
      towerForward: 'Поворачивать башню вперед в походном режиме',
      showToast:
        'Показывать всплывающие сообщения для всех участников боя. Если включено - вы будете видеть сообщения других танков обо всех действиях с объектами карты',
      showAllEnemyEye:
        'Показывать сектора обстрела и наведения для всех врагов. Если включено - вы будете видеть сектора наблюдения и обстрела не только ближайшего танка, а всех',
      showHintKill: 'Показывать список сообщений об уничтожении техники на карте'
    },
    typeRound: [
      {
        title: 'Одиночный бой',
        description: 'Вам нужно победить всех противников на карте. Здесь каждый сам за себя!'
      },
      {
        title: 'Командный бой',
        description:
          'Вам нужно победить команду соперников. Не подстрелите участников вашей команды!'
      }
    ],
    exitFromBattleTitle: 'Уход с поля боя',
    exitFromBattleDescription:
      'Если вы уйдете сейчас с поля боя, вы не получите никакой награды! Хотите уйти?',
    sound: 'Звук %s',
    on: 'включен',
    off: 'выключен',
    enableAutoCheckWeapon:
      'Включена автоматическая смена снарядов, отключите в настройках, чтобы вручную управлять снарядами',
    loading: 'Загрузка',
    loadingAssets: 'Загрузка ресурсов',
    loadingData: 'Загрузка данных',
    init: 'Инициализация SDK',
    inputName: 'Введите ваше имя',
    yourTeam: 'Моя команда',
    enemyTeam: 'Команда противников',
    bonusBar: 'Мои текущие бонусы:',
    help: {
      move: {
        title: 'Управление танком',
        text: 'В игре вы управляете базой танка и стрельбой. Наведение башни осуществляется автоматически, если враги подходят к вам на некоторую дистанцию.\r\n\r\nИспользуйте клавиши:\r\nW,A,S,D(или стрелки) - для перемещения и поворота базы танка\r\nПробел - для выстрела.'
      },
      moveMobile: {
        title: 'Перемещение танка',
        text: 'Используйте виртуальный джойстик для перемещения и поворота базы танка. Нажмите круглую кнопку в нижней правой части экрана для выстрела.'
      },
      friendly: {
        title: 'Дружественный огонь',
        text: 'Если в настройках игры активирован режим дружественного огня, снаряды всех участников команды будут наносить урон дружественным танкам. \r\nБудьте осторожны, поражая дружественные танки, вы теряете монеты!'
      },
      distanceView: {
        title: 'Дистанция наведения вражеского танка',
        text: 'Если вражеский танк замечает противника, на экране появляется граница дистанции наведения в виде фиолетовой окружности и он начинает наводить башню на замеченный танк.'
      },
      distanceViewMy: {
        title: 'Дистанция наведения',
        text: 'Когда ваш танк подходит к вражескому танку на расстояние равное дистанции наведения - башня танка автоматически начинает наводиться на этот танк. \r\nНа экране появляется граница в виде желтой окружности, которая показывает максимальную дистанцию наведения.\r\n\r\nДистанция наведения может быть улучшена в мастерской.'
      },
      distanceShotMy: {
        title: 'Дистанция стрельбы',
        text: 'После наведения башни вы можете выстрелить, однако учитывайте дистанцию стрельбы, которая на экране показана белой окружностью и белый сектор показывает место куда полетит снаряд. \r\n\r\nДистанция стрельбы может быть улучшена в мастерской.'
      },
      distanceShot: {
        title: 'Дистанция стрельбы вражеского танка',
        text: 'Красная окружность показывает границу дистанции стрельбы вражеского танка. Красным сектором отмечена зона поражения. Старайтесь избегать красного сектора, иначе можете быть подстрелены.'
      },
      destroyObject: {
        title: 'Разрушения',
        text: 'Многие постройки на карте могут быть разрушены тараном или снарядом. После разрушения каждая постройка может выдать какой-либо бонус'
      },
      bonus: {
        title: 'Бонусы',
        text: 'После разрушения постройки, может появиться бонус для улучшения(понижения) характеристик танка.\r\n\r\nВНИМАНИЕ: бонус может как повысить так и понизить характеристики танка! \r\nКрасные индикаторы - понижают характеристику\r\nЖелтые и зеленые индикаторы - повышают характеристику\r\nБонусы есть временные и постоянные. В левой верхней части экрана, вы можете увидеть статус ваших бонусов.'
      },
      weapon: {
        title: 'Снаряды',
        text: 'На каждой локации вы можете найти снаряды.\r\n\r\nВНИМАНИЕ: Не стоит особо рассчитывать на снаряды на карте, ведь их могут подобрать и другие танки! \r\n\r\nВы всегда можете купить снаряды в магазине перед боем.'
      },
      checkWeapon: {
        title: 'Смена снарядов',
        text: 'При наличии снарядов, вы всегда можете сменить тип активных снарядов, используя кнопки 1-5 или нажав на выбранные снаряды в правой части экрана.\r\n\r\nВ настройках можно включить автоматический выбор сильнейшего снаряда.'
      },
      markers: {
        title: 'Маркеры',
        text: 'Маркеры, которые расположены по краям экрана, позволяют вам видеть где находятся другие танки'
      },
      refreshWeapon: {
        title: 'Перезарядка',
        text: 'После каждого выстрела, каждый танк делает перезарядку. Оранжевая полоска в панели над каждым танком, показывает процесс перезарядки.'
      }
    },
    hint: 'Подсказка',
    hints: [
      'В магазине всегда можно купить различные снаряды',
      'Каждый танк имеет определенный потенциал прокачки(как правило, все параметры прокачиваются на 100% от начального значения). При выборе танка обращайте внимание на его силу.',
      'Прокачивая танк, вы получаете тактическое преимущество перед противником',
      'Разрушая тараном объекты на карте, будьте осторожны! Вы можете автоматически получить бонус, который понижает параметры вашего танка',
      'Установив в настройках автоматические выстрелы, вы можете больше внимания уделить управлению танком',
      'Ручное управление снарядами способствует экономии арсенала',
      'Каждый танк автоматически наводит башню на ближайшую вражескую технику',
      'Улучшение маневренности позволит быстрее совершать повороты при управлении танком',
      'Улучшение скорости передвижения позволит быстрее передвигаться по карте и собрать все лучшие бонусы и снаряды',
      'Улучшение скорости вращения башни позволит быстрее наводить башню на танк противника',
      'Улучшение точности наведения позволит более точно наводить башню на противника',
      'Улучшение времени перезарядки позволит сократить время между выстрелами',
      'Улучшение дистанции наведения позволит увеличить радиус наблюдения за техникой противника',
      'Улучшение дистанции стрельбы позволит увеличить радиус обстрела техники противника',
      'Улучшение начальной скорости полета снарядов сделает ваши снаряды быстрее'
    ],
    sell: 'Продать',
    sellTitle: 'Продажа танка %s',
    sellDescription: 'Вы действительно хотите продать танк %s?',
    gerbCheckTitle: 'Выбор лого',
    gerbEdit: 'Изменить лого',
    gerbCheckDescription: 'Лого будет использовано на карте для информации.',
    gerbToast: 'Лого успешно изменено!',
    ok: 'Да',
    well: 'Хорошо',
    countBattle: 'Всего боев - %s',
    cancel: 'Нет',
    btnToBattle: 'В бой',
    leaderboard_title: 'Лидеры в игре',
    langTitle: 'Язык в игре',
    newRankTitle: 'Новое звание',
    newRankDescription: 'Ваш опыт, полученный на поле боя, способствует повышению до звания - %s!',
    aloneTextBar: 'Танков на карте: %s',
    kills: 'уничтожил',
    fill: 'Пополнить',
    notName: 'Безымянный',
    supportWeapons: 'Использует снаряды',
    adbMessage:
      'К сожалению функционал банка ограничен, так как у вас включен блокировщик рекламы. Отключите блокировщик, чтобы воспользоваться всеми услугами!',
    notAvailable: 'Не доступно',
    initPlayer: 'Инициализация пользователя',
    loadingLB: 'Инициализация лидерборда',
    loadingScenes: 'Подготовка игры',
    coinByDestroy: 'Бонус за уничтожение +%s монет'
  },
  en: {
    code: 'en',
    codeName: 'En',
    name: 'English',
    name_game: 'Crazy tanks',
    workShopTitle: 'Workshop',
    options: {
      health: 'HP',
      speed: 'Movement speed',
      speedRotate: 'Maneuverability',
      speedRotateTower: 'Tower rotation speed',
      accuracy: 'Pointing accuracy',
      timeRefreshWeapon: 'Recharge time',
      distanceView: 'Targeting distance',
      speedShot: 'Projectile speed',
      distanceShot: 'Firing distance'
    },
    weapons: {
      default: 'Ordinary',
      cumulative: 'Cumulative',
      armor: 'Armor-piercing',
      energy: 'Energy',
      subcaliber: 'Sub-caliber',
      explosive: 'Armor-piercing high-explosive'
    },
    weapon: 'projectile',
    activeWeapon: 'Active projectile - %s',
    noneWeapon: 'Out of %s projectile!',
    norank: 'Rank required - \r\n',
    rank: [
      'Corporal',
      'Jr. sergeant',
      'Sergeant',
      'Lieutenant',
      'Art. lieutenant',
      'Captain',
      'Major',
      'Lieutenant colonel',
      'Colonel',
      'Major General',
      'Lieutenant General',
      'Colonel General',
      'Marshal'
    ],
    update: 'Upgrade',
    giftHint: 'There are %s min. %s sec. left before receiving the gift.',
    giftTitle: 'Daily gift',
    giftGet: 'Receive a gift',
    giftDescription: 'You receive a small gift! Such a gift will be available to you every day!',
    damage: 'Base damage',
    my: 'My ',
    updateTitle: 'Upgrade characteristics',
    updateText: 'Do you want to upgrade %s by ~%s% for %s coins?',
    updateTextSlider: 'Drag the slider (white circle) to select the desired level of improvement',
    cartWeaponsText: 'You want to make a purchase: %s %s - %s pcs. for %s coins?',
    cartWeaponsTextSlider:
      'Drag the slider (white circle) to indicate how many shells you want to buy',
    shopTitle: 'Shop',
    pc: 'pc.',
    stretch: 'Force',
    check: 'Choose',
    cart: 'Buy',
    cartTitle: 'Purchase',
    cartText: 'Do you want to buy %s for %s coins?',
    inGaraz: 'In the garage',
    tanksPage: 'Tanks',
    weaponsPage: 'Shells',
    exist: 'In stock:',
    repair: 'Recovery',
    maxValue: 'Maximum',
    notMany: 'Not enough coins',
    bank: 'Bank',
    bankDescription: 'Here you can get coins',
    return: 'Back',
    getAdv: 'Get paid for watching ads',
    getYan: 'Receive for %s yang',
    getCoinSuccess: '%s coins have been successfully added to your account!',
    backToBank: 'Come in for coins anytime!',
    controlTitle: 'Settings',
    exitFromRound: 'Complete a round',
    gameOverPlayer:
      "Your tank is knocked out, but don't despair, you can always start a new round!",
    winTeam: 'Your team won',
    winAlone: 'You have won',
    roundReward: 'You earned %s coins for this battle!',
    gameOverTitle: 'Defeat',
    winTitle: 'Victory',
    getReward: 'Collect your reward',
    getReward2: 'Get a double reward by watching an ad',
    settings: {
      showArrow: 'Show direction arrow straight ahead',
      showAreol: 'Highlight your tank',
      autoShot: 'Auto-shot upon successful aiming',
      showBar: 'Show information about HP and reload near the tank on the map',
      autoCheckWeapon:
        'Automatic projectile control. If enabled, it will install the strongest projectiles that are active',
      friendlyFire:
        'Friendly fire. If enabled, shells cause damage to all tanks, including friendly ones',
      towerForward: 'Rotate the tower forward in traveling mode',
      showToast:
        'Show pop-up messages for all participants in the battle. If enabled, you will see messages from other tanks about all actions with map objects',
      showAllEnemyEye:
        'Show firing and targeting sectors for all enemies. If enabled, you will see the observation and firing sectors not only of the nearest tank, but of all',
      showHintKill: 'Show a list of messages about the destruction of equipment on the map'
    },
    typeRound: [
      {
        title: 'Single battle',
        description: "You need to defeat all opponents on the map. It's every man for himself here!"
      },
      {
        title: 'Team fight',
        description: "You need to defeat the opposing team. Don't shoot your team members!"
      }
    ],
    exitFromBattleTitle: 'Leaving the battlefield',
    exitFromBattleDescription:
      'If you leave the battlefield now, you will not receive any reward! Do you want to leave?',
    sound: 'Sound %s',
    on: 'on',
    off: 'off',
    enableAutoCheckWeapon:
      'Automatic change of projectiles is enabled, disable in settings to manually manage projectiles',
    loading: 'Loading',
    loadingAssets: 'Loading resources',
    loadingData: 'Loading data',
    init: 'Initializing the SDK',
    inputName: 'Enter your name',
    yourTeam: 'My team',
    enemyTeam: 'Opposing team',
    bonusBar: 'My current bonuses:',
    help: {
      move: {
        title: 'Tank control',
        text: "In the game, you control the tank's base and shooting. The tower is aimed automatically if enemies approach you at a certain distance.\r\n\r\nUse the keys:\r\nW,A,S,D (or arrows) - to move and rotate the tank base\r\nSpace - for a shot."
      },
      moveMobile: {
        title: 'Moving the tank',
        text: 'Use the virtual joystick to move and rotate the tank base. Press the round button at the bottom right of the screen to fire.'
      },
      friendly: {
        title: 'Friendly fire',
        text: 'If friendly fire mode is activated in the game settings, the shells of all team members will cause damage to friendly tanks. \r\nBe careful when hitting friendly tanks, you will lose coins!'
      },
      distanceView: {
        title: 'Targeting distance of an enemy tank',
        text: 'If an enemy tank spots an enemy, the targeting range boundary appears on the screen in the form of a purple circle and it begins to point the tower at the spotted tank.'
      },
      distanceViewMy: {
        title: 'Targeting distance',
        text: "When your tank approaches an enemy tank at a distance equal to the aiming distance, the tank's tower automatically begins to aim at this tank. \r\nA yellow circle border appears on the screen, which shows the maximum aiming distance.\r\n\r\nThe aiming distance can be improved in the workshop."
      },
      distanceShotMy: {
        title: 'Firing distance',
        text: 'After aiming the tower, you can fire, but take into account the firing distance, which is shown on the screen by a white circle and the white sector shows the place where the projectile will fly. \r\n\r\nFiring distance can be improved in the workshop.'
      },
      distanceShot: {
        title: 'Firing distance of an enemy tank',
        text: "The red circle shows the limit of the enemy tank's firing range. The red sector marks the affected area. Try to avoid the red sector, otherwise you may get shot."
      },
      destroyObject: {
        title: 'Destruction',
        text: 'Many buildings on the map can be destroyed by a ram or a shell. After destruction, each building can give out some kind of bonus'
      },
      bonus: {
        title: 'Bonuses',
        text: 'After the destruction of the building, a bonus may appear to improve (lower) the characteristics of the tank.\r\n\r\nATTENTION: the bonus can either increase or decrease the characteristics of the tank! \r\nRed indicators - lower the characteristic\r\nYellow and green indicators - increase the characteristic\r\nBonuses are temporary and permanent. At the top left of the screen, you can see the status of your bonuses.'
      },
      weapon: {
        title: 'Shells',
        text: "At each location you can find shells.\r\n\r\nATTENTION: Don't count too much on shells on the map, because other tanks can pick them up too! \r\n\r\nYou can always buy shells in the store before the battle."
      },
      checkWeapon: {
        title: 'Changing shells',
        text: 'If you have projectiles, you can always change the type of active projectiles using buttons 1-5 or by clicking on the selected projectiles on the right side of the screen.\r\n\r\nIn the settings you can enable automatic selection of the strongest projectile.'
      },
      markers: {
        title: 'Markers',
        text: 'Markers that are located along the edges of the screen allow you to see where other tanks are'
      },
      refreshWeapon: {
        title: 'Reloading the tank',
        text: 'After each shot, each tank reloads. An orange stripe in the panel above each tank shows the reloading process.'
      }
    },
    hint: 'Hint',
    hints: [
      'You can always buy various shells in the store',
      'Each tank has a certain pumping potential (usually all parameters are pumped to 100% of the initial value). When choosing a tank, pay attention to its strength.',
      'By upgrading your tank, you gain a tactical advantage over the enemy',
      'When destroying objects on the map with a ram, be careful! You can automatically receive a bonus that lowers the parameters of your tank',
      'By setting the settings to automatic shots, you can pay more attention to controlling the tank',
      'Manual control of projectiles helps save arsenal',
      'Each tank automatically points its tower at the nearest enemy vehicle',
      'Improving maneuverability will allow you to make turns faster when driving a tank',
      'Improving movement speed will allow you to move around the map faster and collect all the best bonuses and shells',
      'Improving the rotation speed of the tower will allow the tower to be aimed at the enemy tank faster',
      'Improving the targeting accuracy will allow the tower to be more accurately aimed at the enemy',
      'Improving the reload time will reduce the time between shots',
      'Improving the targeting distance will increase the observation radius of enemy equipment',
      'Improving the firing distance will increase the firing radius of enemy equipment',
      'Improving the muzzle velocity of projectiles will make your projectiles faster'
    ],
    sell: 'Sell',
    sellTitle: 'Selling tank %s',
    sellDescription: 'Are you sure you want to sell tank %s?',
    gerbCheckTitle: 'Choose logo',
    gerbEdit: 'Change logo',
    gerbCheckDescription: 'The logo will be used on the map for information.',
    gerbToast: 'Logo changed successfully!',
    ok: 'Ok',
    well: 'Ok',
    countBattle: 'Total battles - %s',
    cancel: 'No',
    btnToBattle: 'To battle',
    leaderboard_title: 'Leaders in the game',
    langTitle: 'Language in the game',
    newRankTitle: 'New rank',
    newRankDescription:
      'Your experience gained on the battlefield contributes to promotion to the rank - %s!',
    aloneTextBar: 'Tanks on the map:: %s',
    kills: 'kills',
    fill: 'Replenish',
    notName: 'Anonymous',
    supportWeapons: 'Uses projectiles',
    adbMessage:
      "Unfortunately, the bank's functionality is limited because you have an ad blocker enabled. Disable the blocker to use all services!",
    notAvailable: 'Not available',
    initPlayer: 'User initialization',
    loadingLB: 'Leaderboard initialization',
    loadingScenes: 'Game preparation',
    coinByDestroy: 'Destroy Bonus +%s couns'
  }
  // tr: {
  //   code: 'tr',
  //   name: 'Türkçe',
  //   name_game: '2048 balls Deluxe',
  //   record: 'Rekorunuz',
  //   level: 'Seviye',
  //   level_completed: 'Seviye tamamlandı',
  //   pause: 'Duraklat',
  //   create_bomb_help:
  //     'Kullanılabilir yıldırım işaretiniz yok! Bir reklamı görüntülemek için bir şimşek mi oluşturmak istiyorsunuz?',
  //   ok: 'Evet',
  //   cancel: 'Hayir',
  //   gameover_title: 'Oyun kaybedildi',
  //   gameover_btn_continue_by_adv: 'Reklamları görüntülemeye devam et',
  //   gameover_btn_new_game: 'Yeni bir oyun başlat',
  //   current_score: 'Mevcut hesap',
  //   btn_startgame: 'Oyunu başlat',
  //   btn_continue: 'Oyuna Devam Et',
  //   leaderboard_title: 'Oyundaki liderler',
  //   lang_title: 'Oyundaki dil',
  //   close: 'Kapalı',
  //   add_bomb_max: 'En büyük topları yok ettiğinizde bir bonus kazanırsınız - ateş yıldırımı!',
  //   add_bomb_seria: 'Çok sayıda topun yok edilmesi için bir bonus kazanırsınız - ateşli yıldırım!',
  //   next: 'Daha öte',
  //   bonusText: [
  //     '',
  //     '',
  //     'Harika',
  //     'Muhteşem',
  //     'Harika',
  //     'Güzel yapmıştın',
  //     'Parlak',
  //     'İyi uğraştın',
  //     'Aferin',
  //     'İyi iş',
  //     'Fantastik',
  //     'Çok iyi',
  //     'Bu övgüye layık',
  //     'Her zamankinden iyi'
  //   ],
  //   job: 'Amaç: Aşağıdaki topları yok edin'
  // },
  // es: {
  //   code: 'es',
  //   name: 'Español',
  //   name_game: '2048 balls Deluxe',
  //   record: 'Tu récord',
  //   level: 'Nivel',
  //   level_completed: 'Nivel completado',
  //   pause: 'Pausa',
  //   create_bomb_help:
  //     '¡No tienes ningún rayo disponible! ¿Quiere crear un rayo para ver un anuncio?',
  //   ok: 'Sí',
  //   cancel: 'No',
  //   gameover_title: 'el juego esta perdido',
  //   gameover_btn_continue_by_adv: 'Continuar viendo anuncios',
  //   gameover_btn_new_game: 'Empezar un nuevo juego',
  //   current_score: 'Cuenta actual',
  //   btn_startgame: 'Comenzar el juego',
  //   btn_continue: 'Continua el juego',
  //   leaderboard_title: 'Líderes en el juego',
  //   lang_title: 'Idioma en el juego',
  //   close: 'Cerca',
  //   add_bomb_max:
  //     'Por destruir las bolas más grandes, obtienes una bonificación: ¡dispara un rayo!',
  //   add_bomb_seria:
  //     'Por una gran serie de destrucción de bolas, obtienes una bonificación: ¡un rayo de fuego!',
  //   next: 'Más',
  //   bonusText: [
  //     '',
  //     '',
  //     'Excelente',
  //     'Maravilloso',
  //     '¡Bien hecho',
  //     '¡Buen trabajo',
  //     '¡Sigue así',
  //     'Fresco',
  //     'Estupendo',
  //     'БраBravoво',
  //     'Fantástico',
  //     '¡Eres una máquina',
  //     '¡Eres un crack',
  //     'Eres una estrella'
  //   ],
  //   job: 'Objetivo: Destruir las siguientes bolas.'
  // },
  // zh: {
  //   code: 'zh',
  //   name: '中文',
  //   name_game: '2048 balls Deluxe',
  //   record: '你的記錄',
  //   level: '等級',
  //   level_completed: '關卡已完成',
  //   pause: '暫停',
  //   create_bomb_help: '你沒有可用的閃電！ 想要創建閃電來觀看廣告嗎？',
  //   ok: '是的',
  //   cancel: '不',
  //   gameover_title: '比賽輸了',
  //   gameover_btn_continue_by_adv: '繼續查看廣告',
  //   gameover_btn_new_game: '開始新遊戲',
  //   current_score: '往來帳戶',
  //   btn_startgame: '開始遊戲',
  //   btn_continue: '繼續遊戲',
  //   leaderboard_title: '遊戲中的領導者',
  //   lang_title: '遊戲中的語言',
  //   close: '關閉',
  //   add_bomb_max: '摧毀最大的球，您將獲得獎勵 - 火焰閃電！',
  //   add_bomb_seria: '對於大量的破壞球，您將獲得獎勵 - 熾熱的閃電！',
  //   next: '更遠',
  //   bonusText: [
  //     '',
  //     '',
  //     '偉大的',
  //     '精彩的',
  //     '偉大的',
  //     '輝煌地',
  //     '繼續努力吧',
  //     '涼爽的',
  //     '巧妙地',
  //     '布拉沃',
  //     '極佳的',
  //     '精彩的',
  //     '你是一個人才',
  //     '你是個明星'
  //   ],
  //   job: '目標： 摧毀下列球'
  // },
  // ja: {
  //   code: 'ja',
  //   name: '日本語',
  //   name_game: '2048 balls Deluxe',
  //   record: 'あなたの記録',
  //   level: 'レベル',
  //   level_completed: 'レベル完了',
  //   pause: '一時停止',
  //   create_bomb_help: '利用可能な稲妻がありません! 広告を表示するための稲妻を作成したいですか?',
  //   ok: 'はい',
  //   cancel: 'いいえ',
  //   gameover_title: '試合は負けました',
  //   gameover_btn_continue_by_adv: '引き続き広告を表示する',
  //   gameover_btn_new_game: '新しいゲームを始める',
  //   current_score: '当座預金',
  //   btn_startgame: 'ゲームを始める',
  //   btn_continue: 'ゲームを続ける',
  //   leaderboard_title: 'ゲームのリーダー',
  //   lang_title: 'ゲーム内の言語',
  //   close: '近い',
  //   add_bomb_max: '最大のボールを破壊すると、ボーナスとして火の稲妻が得られます。',
  //   add_bomb_seria: 'ボールを大量に破壊すると、ボーナスとして燃えるような稲妻が得られます。',
  //   next: 'さらに遠く',
  //   bonusText: [
  //     '',
  //     '',
  //     '素晴らしい',
  //     '素晴らしい',
  //     '素晴らしい',
  //     '華麗に',
  //     'それを維持する',
  //     'いいね',
  //     '巧みに',
  //     'ブラボー',
  //     '素晴らしい',
  //     '素晴らしい',
  //     'あなたは才能があります',
  //     '君はスター'
  //   ],
  //   job: '目標: 次のボ ー ルを破壊する'
  // },
  // de: {
  //   code: 'de',
  //   name: 'Deutsch',
  //   name_game: '2048 balls Deluxe',
  //   record: 'Ihre Akte',
  //   level: 'Ebene',
  //   level_completed: 'Level abgeschlossen',
  //   pause: 'Pause',
  //   create_bomb_help:
  //     'Sie haben keine Blitze zur Verfügung! Möchten Sie einen Blitz zum Anzeigen einer Anzeige erstellen?',
  //   ok: 'Ja',
  //   cancel: 'Nein',
  //   gameover_title: 'Das Spiel ist verloren',
  //   gameover_btn_continue_by_adv: 'Sehen Sie sich weiterhin Anzeigen an',
  //   gameover_btn_new_game: 'Starten Sie ein neues Spiel',
  //   current_score: 'Aktuelles Konto',
  //   btn_startgame: 'Starte das Spiel',
  //   btn_continue: 'Weiterspielen',
  //   leaderboard_title: 'Anführer im Spiel',
  //   lang_title: 'Sprache im Spiel',
  //   close: 'Schließen',
  //   add_bomb_max: 'Für die Zerstörung der größten Kugeln erhalten Sie einen Bonus – Feuerblitze!',
  //   add_bomb_seria:
  //     'Für eine große Serie der Zerstörung von Bällen erhalten Sie einen Bonus – feurige Blitze!',
  //   next: 'Weiter',
  //   bonusText: [
  //     '',
  //     '',
  //     'Großartig',
  //     'Wunderbar',
  //     'Fein',
  //     'Prima',
  //     'Toll',
  //     'Klasse',
  //     'Sehr schön',
  //     'Gut',
  //     'Fantastisch',
  //     'Ausgezeichnet',
  //     'Du bist ein Talent',
  //     'Du bist ein Star'
  //   ],
  //   job: 'Ziel: Zerstöre die folgenden Bälle',
  //   help: {
  //     help_move: {
  //       title: 'Zielen und den Ball werfen',
  //       text: 'Bewegen Sie die Kutsche – bewegen Sie die Maus über das Ballfeld (drücken Sie Ihren Finger auf das Ballfeld und bewegen Sie sich auf mobilen Geräten). Klicken Sie mit der Maustaste über das Ballfeld (lassen Sie Ihren Finger auf Mobilgeräten los), um den Ball zu werfen.'
  //     },
  //     help_floor: {
  //       title: 'Bodenbewegung',
  //       text: 'Bei Abschluss der Aufgabe wird der Boden entsprechend dem Timer angehoben.“ Bei der Ausführung einer Reihe gebrochener Bälle (Combos) sinkt der Boden'
  //     },
  //     help_rotate_zoom: {
  //       title: 'Nächsten Ball ändern',
  //       text: 'Drücken Sie den Schlitten oder die Pfeiltaste, um die Positionen der Kugeln im Schlitten zu vertauschen (auch die LEERTASTE-Taste).'
  //     },
  //     help_bomb: {
  //       title: 'Wreck the Balls',
  //       text: 'Um die Bälle auf dem Spielfeld zu zerstören, verwenden Sie die Schließen-Taste.'
  //     },
  //     help_general: {
  //       title: 'Über das Spiel',
  //       text: 'In jeder Spielrunde gilt es, Kugeln aus der Aufgabe zu entfernen. Das Spiel wird so lange fortgesetzt, bis kein Ball mehr aus dem Korb fällt.'
  //     }
  //   }
  // }
}
