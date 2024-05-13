export const langs = {
  ru: {
    code: 'ru',
    codeName: 'Ру',
    name: 'Русский',
    name_game: 'Battle of tanks',
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
      'Полковник'
    ],
    update: 'Улучшить',
    damage: 'Урон',
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
    bankDescription: 'Здесь можно получить монеты за портальную валюту или просмотр рекламы',
    bankGetMoneyByAdv: 'Получить 100 монет за просмотр рекламы',
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
    roundReward: 'За эту битву вы заработали %s монет!',
    gameOverTitle: 'Поражение',
    winTitle: 'Победа',
    getReward: 'Забрать награду',
    getReward2: 'Забрать удвоенную награду, просмотрев рекламу',
    settings: {
      showArrow: 'Показывать стрелку направления движения прямо',
      showAreol: 'Подсвечивать ваш танк',
      autoShot: 'Автовыстрел при успешном наведении',
      showBar: 'Показать информацию о HP и перезарядке около танка на карте',
      autoCheckWeapon: 'Автоматически устанавливать активными - сильнейшие снаряды, при наличии',
      friendlyFire:
        'Дружественный огонь (снаряды наносят урон всем танкам, а не только из другой команды)',
      towerForward: 'Башня вперед при пассиве',
      showToast: 'Показывать всплывающие сообщения для всех участников боя',
      showAllEnemyEye: 'Показывать сектора обстрела и наведения для всех врагов'
    },
    typeRound: [
      {
        title: 'Один против всех',
        description: 'Вам нужно победить всех противников на карте. Здесь каждый сам за себя!'
      },
      {
        title: 'Команда на команду',
        description:
          'Вам нужно победить всех участников команды соперников. Не подстрелите участников вашей команды!'
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
        text: 'При наличии снарядов, вы всегда можете сменить тип активных снарядов, используя кнопки 0-9 или нажав на выбранные снаряды в правой части экрана.\r\n\r\nВ настройках можно включить автоматический выбор сильнейшего снаряда.'
      },
      markers: {
        title: 'Маркеры',
        text: 'Маркеры, которые расположены по краям экрана, позволят вам видеть где находятся другие танки'
      },
      refreshWeapon: {
        title: 'Перезарядка',
        text: 'После каждого выстрела, каждый танк делает перезарядку. Оранжевая полоска в панели над каждым танком, показывает процесс перезарядки.'
      }
    },
    sell: 'Продать',
    sellTitle: 'Продажа танка %s',
    sellDescription: 'Вы действительно хотите продать танк %s?',
    gerbCheckTitle: 'Выбор лого',
    gerbEdit: 'Изменить лого',
    gerbCheckDescription: 'Лого будет использовано на карте для информации.',
    gerbToast: 'Лого успешно изменено!',

    record: 'Ваш рекорд',
    level: 'Раунд',
    level_completed: 'Раунд завершен',
    pause: 'Пауза',
    create_bomb_help: 'У вас нет доступных молний! Хотите создать молнию за просмотр рекламы?',
    ok: 'Да',
    cancel: 'Нет',
    gameover_title: 'Игра проиграна',
    gameover_btn_continue_by_adv: 'Продолжить за просмотр рекламы',
    gameover_btn_new_game: 'Начать новую игру',
    current_score: 'Текущий счет',
    btnToBattle: 'В бой',
    btn_continue: 'Продолжить игру',
    leaderboard_title: 'Лидеры в игре',
    lang_title: 'Язык в игре',
    close: 'Закрыть',
    add_bomb_max: 'За уничтожение самых больших шаров, вы получаете бонус - огненную молнию!',
    add_bomb_seria: 'За большую серию уничтожений шаров, вы получаете бонус - огненную молнию!',
    next: 'Далее',
    bonusText: [
      '',
      '',
      'Отлично',
      'Прекрасно',
      'Здорово',
      'Блестяще',
      'Так держать',
      'Круто',
      'Искусно',
      'Браво',
      'Фантастика',
      'Чудесно',
      'Ты талант',
      'Ты звезда'
    ],
    job: 'Задание: Уничтожить следующие шары'
  },
  en: {
    code: 'en',
    codeName: 'En',
    name: 'English',
    name_game: 'Battle of tanks',
    workShopTitle: 'Workshop',
    options: {
      health: 'Максимальное HP',
      speed: 'Максимальная скорость',
      speedRotate: 'Максимальная маневренность'
    },

    level: 'Level',
    level_completed: 'Level completed',
    pause: 'Pause',
    create_bomb_help:
      "You don't have any lightning bolts available! Want to create a lightning bolt for viewing an ad?",
    ok: 'Yes',
    cancel: 'No',
    gameover_title: 'The game is lost',
    gameover_btn_continue_by_adv: 'Continue to view ads',
    gameover_btn_new_game: 'Start a new game',
    current_score: 'Current score',
    btnToBattle: 'To battle',
    btn_continue: 'Continue game',
    leaderboard_title: 'Leaders in the game',
    lang_title: 'Language in the game',
    close: 'Close',
    add_bomb_max: 'For destroying the largest balls, you get a bonus - fire lightning!',
    add_bomb_seria: 'For a large series of destruction of balls, you get a bonus - fire lightning!',
    next: 'Далее',
    bonusText: [
      '',
      '',
      'Great',
      'Wonderful',
      'Well done',
      'Brilliantly',
      'Keep it up',
      'Good job',
      'Artfully',
      'Bravo',
      'Fantastic',
      'Very cool',
      'Right On',
      'You are a star'
    ],
    job: 'Objective: Destroy the following balls',
    help: {
      help_move: {
        title: 'Aim and throw the ball',
        text: 'Move the carriage - move the mouse over the field of balls (press your finger on the field of balls and move on mobile devices). Click the mouse button over the field of balls (release your finger on mobile devices) to throw the ball.'
      },
      help_floor: {
        title: 'Floor Movement',
        text: 'When completing the task, the floor will rise according to the timer. When performing a series of broken balls (combos), the floor will go down'
      },
      help_rotate_zoom: {
        title: 'Change next ball',
        text: 'Press the carriage or the arrow button to swap the positions of the balls in the carriage (also the SPACEBAR button).'
      },
      help_bomb: {
        title: 'Wreck the Balls',
        text: 'To destroy the balls on the field, use the close button.'
      },
      help_general: {
        title: 'About the game',
        text: 'In each round of the game it is necessary to remove balls from the task. The game continues until no ball falls out of the basket.'
      }
    }
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
