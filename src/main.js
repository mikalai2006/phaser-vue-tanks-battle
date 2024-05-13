import App from './App.vue'
import { createApp } from 'vue'

window.game = createApp(App).mount('#app')

// Test SDK
const testLBData = {
  leaderboard: {
    title: [{ lang: 'ru', value: 'Leader Board' }]
  },
  userRank: 1000,
  entries: [
    {
      rank: 1,
      score: 1000000000,
      name: 'Mikalai Parakhnevich',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 2,
      score: 500000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 3,
      score: 400000,
      name: 'Ирина Морозова',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/AT52VCNVWCUXO45B2LUL6ZWR35BL54HM3NZICBVV2F6TY4IEJ4OY37ZBJVLXEEUGXCMDKTYJSWIDA6KEBMWXD6PVCKTKV2MNOTZABUJHZW7ZGDVZEJO43BMDZWOEWDJWEW6PDCF25AQUSMYRGLMR5ZHK5QNNMNJEZ5OO7JY=/islands-retina-medium'
    },
    {
      rank: 4,
      score: 200000,
      name: 'Павел Стрельников',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 5,
      score: 100000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 6,
      score: 50000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 7,
      score: 36000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 8,
      score: 10000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 9,
      score: 6000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    },
    {
      rank: 10,
      score: 30,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/MQ47UVFWZIHKDOVI3M23NP4P4CMFEHPM3KIAYKRFGUMWEC6IKRZUJLG56Q532GQVGX646ZJAYDN42MPN2KMK7R6GFCRPZ2MUPITUIARZUEECBDD6MI6NOZRSGUZTLHTRXGD6NZBKGLGE4HWP537HAYJ7YBH63BHLZONSQOL5DHUKC2WIQBXPOLKKF745HA5CEUAJQXL7NEDMAD7VBKQSRTYRDZWRDITAHE7CKGY=/islands-retina-medium'
    }
  ]
}
const getLBTestData = (count) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // переведёт промис в состояние fulfilled с результатом "result"
      const testData = JSON.parse(JSON.stringify(testLBData))
      testData.entries = testData.entries.slice(0, count)
      resolve(testData)
    }, 500)
  })
function resolveAfter2Seconds(x, y) {
  console.log('start ', y)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(y)
    }, x * 1000)
  })
}

// window.initSDK = function () {
//   return resolveAfter2Seconds(1, 'initSDK')
// }
// window.getLang = function () {
//   var lang = 'ru'
//   return lang
// }

// /**
//  * PLAYER
//  */
// window.initPlayer = function () {
//   return resolveAfter2Seconds(1, 'initPlayer')
// }
// window.getModePlayer = async function () {
//   return promise
// }
// window.getPlayerData = async function () {
//   return resolveAfter2Seconds(1, {
//     name: 'Mikalai Parakhnevich',
//     photo: 'test'
//   })
// }

// /**
//  * DATA
//  */
// window.saveGameData = function (data) {
//   console.log('saveGameData', data)
//   // player.setData(data)
// }
// window.loadGameData = function (data) {
//   return resolveAfter2Seconds(1, null)
//   // await fetch('https://jsonplaceholder.typicode.com/todos')
//   //   .then((response) => response.json())
//   //   .then((json) => json)
// }

/**
 * Leaderboard
 */
window.initLB = function (data) {
  return resolveAfter2Seconds(0.1, 'initLB')
}
window.setLB = function (data) {
  console.log('setLB', data)
}
window.getLB = async function () {
  return getLBTestData(1)
}

/**
 * ADV
 */
window.hasAdBlocker = async () => {}
window.showRewardedAdv = function (callback) {
  console.log('showRewardedAdv')
  callback()
}
window.showFullSrcAdv = function (callback) {
  console.log('showFullSrcAdv')
  callback()
}
