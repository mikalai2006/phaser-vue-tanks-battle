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
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 2,
      score: 500000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 3,
      score: 400000,
      name: 'Ирина Морозова',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/LDNSLG226WANKWQFBVCPX2IMMERDSE5W4SVY7VPI2BEAQ4SU6KFQ7U4SNBJF64X5FEVACU5SH3I2DYH6SXCVHNHNFXPYLO66BCRR4NDACGVGA6HEWD37O63RE7M347JPEREMLLW5M6U7RUSVXYXWYZPFPDON3YVNVGRSUYTXRG5ETRTMTCZG7XUZXYVKSL4Y7TMZCOL4D3UYXYALCAR622SCZYXBN7XHFCFH3YA=/islands-retina-medium'
    },
    {
      rank: 4,
      score: 200000,
      name: 'Павел Стрельников',
      lang: 'ru',
      photo:
        'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/LDNSLG226WANKWQFBVCPX2IMMERDSE5W4SVY7VPI2BEAQ4SU6KFQ7U4SNBJF64X5FEVACU5SH3I2DYH6SXCVHNHNFXPYLO66BCRR4NDACGVGA6HEWD37O63RE7M347JPEREMLLW5M6U7RUSVXYXWYZPFPDON3YVNVGRSUYTXRG5ETRTMTCZG7XUZXYVKSL4Y7TMZCOL4D3UYXYALCAR622SCZYXBN7XHFCFH3YA=/islands-retina-medium'
    },
    {
      rank: 5,
      score: 100000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
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
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 8,
      score: 10000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 9,
      score: 6000,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
    },
    {
      rank: 10,
      score: 30,
      name: 'Иванов ива Иванович',
      lang: 'ru',
      photo:
        'https://avatars.mds.yandex.net/get-yapic/25358/6FIS4K65AT7Vz9xociqLRPzwH0-1/islands-retina-middle'
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
function resolveAfter2Seconds(duration, answer, name) {
  console.group(name)
  console.log('start ', name)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('end ', name, answer)
      resolve(answer)
      console.groupEnd()
    }, duration * 1000)
  })
}

if (!window.initSDK) {
  window.tobData = false
  window.gameLocalStorageName = 'com.mikalai2006.crazytanks.1'
  window.defaultLang = 'ru'
  // const nameSave = 'crazyt1'
  var lb, player, sdk

  // /**
  //  * Gameplay
  //  */
  // window.onGameplayStart = () => {
  //   console.log('onGamePlayStart')
  // }
  // window.onGameplayStop = () => {
  //   console.log('onGamePlayStop')
  // }

  // /**
  //  * Loading
  //  */
  // window.onSdkGameLoadingStart = () => {
  //   console.log('onSdkGameLoadingStart')
  // }
  // window.onSdkGameLoadingStop = () => {
  //   console.log('onSdkGameLoadingStop')
  // }
  // window.initSDK = function () {
  //   //return YaGames
  //   // .init()
  //   // .then(ysdk => {
  //   //     console.log('Yandex SDK initialized');
  //   //     window.sdk = ysdk;
  //   // });
  //   return resolveAfter2Seconds(0.5, null, 'initSDK')
  // }
  // window.getLang = function () {
  //   // return sdk.environment.i18n.lang
  //   return 'tr1'
  // }

  /**
   * PLAYER
   */
  window.initPlayer = async function () {
    player = await resolveAfter2Seconds(0.2, true, 'initPlayer')

    let playerData

    if (player) {
      playerData = resolveAfter2Seconds(
        0.2,
        {
          uid: '11111',
          name: 'Mikalai Parakhnevich',
          photo: 'test',
          mode: 'lite',
          payStatus: false
        },
        'getPlayerData'
      )
    }

    return playerData
  }

  window.getModePlayer = function () {
    return 'lite'
  }

  // window.getPlayerData = function () {
  //   // return {
  //   //   uid: player.getUniqueID(),
  //   //   name: player.getName(),
  //   //   photo: player.getPhoto('medium'),
  //   //   mode: player.getMode(),
  //   //   payStatus: player.getPayingStatus()
  //   // }
  //   return resolveAfter2Seconds(
  //     1,
  //     {
  //       uid: '11111',
  //       name: 'Mikalai Parakhnevich',
  //       photo: 'test',
  //       mode: 'lite',
  //       payStatus: false
  //     },
  //     'getPlayerData'
  //   )
  // }

  // /**
  //  * DATA
  //  */
  // window.saveGameData = function (data) {
  //   // player.setData(data)
  //   console.log('saveGameData: ', data)
  // }
  // window.loadGameData = function () {
  //   // return player.getData()
  //   return resolveAfter2Seconds(1, null, 'loadData')
  //   // return fetch('https://jsonplaceholder.typicode.com/todos')
  //   //   .then((response) => response.json())
  //   //   .then((json) => json)
  // }

  // /**
  //  * Leaderboard
  //  */
  // window.initLB = async function () {
  //   lb = await resolveAfter2Seconds(0.1, null, 'initLB')
  //   return lb
  //   // return resolveAfter2Seconds(0.1, 'initLB')
  // }

  // window.setLB = function (data) {
  //   // sdk.getLeaderboards().then((lb) => {
  //   //   sdk.isAvailableMethod('leaderboards.setLeaderboardScore').then((status) => {
  //   //     if (status) {
  //   //       lb.setLeaderboardScore('Total', data)
  //   //     }
  //   //   })
  //   // })

  //   console.log('setLB', data)
  // }

  // window.getLB = async function () {
  //   // const result = {}
  //   // if (!sdk) {
  //   //   return result
  //   // }
  //   //   // Получение 10 топов и 3 записей возле пользователя
  //   //   const res =  lb.getLeaderboardEntries('Total', {
  //   //     quantityTop: 5
  //   //     // includeUser: true,
  //   //     // quantityAround: 3
  //   //   })

  //   //     result.leaderboard = {
  //   //       title: []
  //   //     }
  //   //     for (var key of Object.keys(res.leaderboard.title)) {
  //   //       result.leaderboard.title.push({
  //   //         lang: key,
  //   //         value: res.leaderboard.title[key]
  //   //       })
  //   //     }

  //   //     result.userRank = res.userRank
  //   //     result.entries = []

  //   //     for (let i = 0; i < res.entries.length; i++) {
  //   //       const userData = res.entries[i]
  //   //       result.entries.push({
  //   //         rank: userData.rank,
  //   //         score: userData.score,
  //   //         name: userData.player.publicName,
  //   //         lang: userData.player.lang,
  //   //         photo: userData.player.getAvatarSrc('middle')
  //   //       })
  //   //     }

  //   //     // console.group('GetLeaderBoard')
  //   //     // console.log(result)
  //   //     // console.groupEnd()
  //   //     return result

  //   return getLBTestData(10)
  // }

  // /**
  //  * ADV
  //  */
  window.hasAdBlocker = async () => {
    return await resolveAfter2Seconds(0.1, false, 'hasAdBlocker') //window.CrazyGames.SDK.ad.hasAdblock();
  }
  window.showRewardedAdv = async function ({ successC, errorC }) {
    // sdk.adv.showRewardedVideo({
    //   callbacks: {
    //     onOpen: () => {
    //       // console.log("Video ad open.");
    //     },
    //     onRewarded: () => {
    //       // callback && callback()
    //     },
    //     onClose: () => {
    //       callback && callback()
    //     },
    //     onError: function (error) {
    //       callback && callback()
    //       console.log('Video error.', error)
    //     }
    //   }
    // })
    await resolveAfter2Seconds(1, null, 'showRewardedAdv')
    successC()
  }
  window.showFullSrcAdv = async function (callback) {
    // sdk.adv.showFullscreenAdv({
    //   callbacks: {
    //     onClose: function (wasShown) {
    //       callback && callback()
    //     },
    //     onError: function (error) {
    //       callback && callback()
    //       console.log('ShowAdvFullScreen onError ', error)
    //     },
    //     onOffline: function (error) {
    //       callback && callback()
    //       console.log('ShowAdvFullScreen onOffline ', error)
    //     }
    //   }
    // })

    await resolveAfter2Seconds(0.3, null, 'showFullSrcAdv')
    callback()
  }
}
