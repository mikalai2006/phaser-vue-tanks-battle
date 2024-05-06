<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'
import PhaserGame from './game/PhaserGame.vue'
import { getLocalStorage, setLocalStorage } from './game/utils/storageUtils'
import { GameOptions } from './game/options/gameOptions'

import { langs } from './game/lang'
import { IGameData, ILeaderBoard, IUserData, TLang } from './game/types'

const canMoveSprite = ref()

// states.
const defaultGameData: IGameData = {
  name: 'Mikalai Parakhnevich',
  gerbId: 0,
  score: 123,
  lang: GameOptions.lang,
  coin: 1555000,
  activeTankIndex: 0,
  tanks: [
    {
      level: 0,
      levelTank: 0,
      ...GameOptions.tanks.items[0].game,
      levelTower: 0,
      ...GameOptions.towers.items[0].game,
      levelMuzzle: 0,
      ...GameOptions.muzzles.items[0].game
    }
  ],
  bullet: [],
  rank: 8
}

const showLB = ref(false)
const lb = ref<ILeaderBoard>({
  entries: [],
  leaderboard: {
    title: []
  },
  userRank: 0
})
const onLoadLB = (data: ILeaderBoard) => {
  lb.value = data

  if (GameOptions.isLeaderBoard) {
    const scene = toRaw(phaserRef.value)
    const homeScene = toRaw(scene.game.scene.getScene('Home'))
    if (homeScene) {
      homeScene.onSetLeaderBoard(toRaw(lb.value))
    }
  }
}

const showLangList = ref(false)
const userState = ref<IUserData>({})
const onSetUserData = (data: IUserData) => {
  userState.value = data
}

const gameState = ref<IGameData | null>(null)

const onLoadGameData = (data: IGameData) => {
  if (data) {
    gameState.value = data
  } else {
    gameState.value = defaultGameData
  }
  if (!data.score) {
    gameState.value = defaultGameData
  }

  const scene = toRaw(phaserRef.value.scene)

  const workShopScene = toRaw(scene.game.scene.getScene('WorkShop'))
  if (workShopScene) {
    workShopScene.onSetGameData(toRaw(gameState.value))
  }
  const homeScene = toRaw(scene.game.scene.getScene('Home'))
  const controlScene = toRaw(scene.game.scene.getScene('Control'))
  if (controlScene) {
    controlScene.onSetGameData(toRaw(gameState.value))
  }
  const MessageScene = toRaw(scene.game.scene.getScene('Message'))
  if (MessageScene) {
    MessageScene.onSetGameData(toRaw(gameState.value))
  }
  if (homeScene) {
    // if (!gameState.value.tree) {
    //   gameState.value = defaultGameData
    // }
    homeScene.onSetGameData(toRaw(gameState.value))
    // console.log('gameScene=',gameScene)
  }
  onChangeLang(gameState.value.lang)
}

const onSendGameData = () => {
  const scene = toRaw(phaserRef.value.scene)
  scene.scene.get('Home').onSetGameData(toRaw(gameState.value))
  scene.scene.get('Message').onSetGameData(toRaw(gameState.value))
  scene.scene.get('Bank').onSetGameData(toRaw(gameState.value))
  scene.scene.get('WorkShop').onSetGameData(toRaw(gameState.value))
  scene.scene.get('Control').onSetGameData(toRaw(gameState.value))
}

const onSaveGameData = (data: IGameData) => {
  // console.log('onSaveGameData', data)
  if (window.initSDK) {
    // console.log('onSaveGameData ysdk')
    window.saveGameData(data)
    window.setLB(data.score)
  } else {
    setLocalStorage(GameOptions.localStorageName, data)
  }
  gameState.value = data

  onSendGameData()
}

onMounted(() => {
  if (!window.initSDK) {
    gameState.value = getLocalStorage(GameOptions.localStorageName, defaultGameData)
  }

  if (!gameState.value) {
    gameState.value = defaultGameData
  }
  // else {
  //   window.getLB()
  // }
  // console.log('Mounted game end: window.initSDK=', window.initSDK, gameState.value)
})

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref()
const spritePosition = ref({ x: 0, y: 0 })

const changeScene = () => {
  const scene = toRaw(phaserRef.value.scene)

  if (scene) {
    //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
    scene.changeScene()
  }
}

// const moveSprite = () => {
//   const scene = toRaw(phaserRef.value.scene)

//   if (scene) {
//     //  Call the `moveLogo` method in the `MainMenu` Scene and capture the sprite position
//     scene.moveLogo(({ x, y }) => {
//       spritePosition.value = { x, y }
//     })
//   }
// }

// const addSprite = () => {
//   const scene = toRaw(phaserRef.value.scene)

//   if (scene) {
//     //  Add a new sprite to the current scene at a random position
//     const x = Phaser.Math.Between(64, scene.scale.width - 64)
//     const y = Phaser.Math.Between(64, scene.scale.height - 64)

//     //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
//     const star = scene.add.sprite(x, y, 'star')

//     //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
//     //  You could, of course, do this from within the Phaser Scene code, but this is just an example
//     //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
//     scene.add.tween({
//       targets: star,
//       duration: 500 + Math.random() * 1000,
//       alpha: 0,
//       yoyo: true,
//       repeat: -1
//     })
//   }
// }

//  This event is emitted from the PhaserGame component:
const currentScene = (scene) => {
  canMoveSprite.value = scene.scene.key !== 'MainMenu'
}

const showFullscreenAdv = (callback: any) => {
  if (window.showFullSrcAdv) {
    window.showFullSrcAdv(callback)
  } else {
    // showButtonNext(true)
    callback && callback()
  }
}
const showRewardAdv = (callback: any) => {
  if (window.showRewardedAdv) {
    window.showRewardedAdv(callback)
  } else {
  }
}

const onToggleLangList = () => {
  showLangList.value = !showLangList.value

  if (showLangList.value == false) {
    const scene = toRaw(phaserRef.value.scene)
    const controlScene = scene.scene.get('Control')
    controlScene && controlScene.onHideLangList()
  }
}
const onToggleLang = () => {
  if (activeLangCode.value === 'ru') {
    onChangeLang('en')
  } else {
    onChangeLang('ru')
  }
}

const onToggleLB = (status) => {
  showLB.value = status
  if (status) {
    if (window.ysdk) {
      window?.getLB()
    } else {
      onLoadLB({
        leaderboard: {
          title: [{ lang: 'ru', value: 'Leader Board' }]
        },
        userRank: 1000,
        entries: [
          {
            rank: 1,
            score: 123123,
            name: 'Mikalai Parakhnevich',
            lang: 'ru',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/21493/enc-949461d55ad8e9deb5fb42767a562a9cb258976f2c3ad874aa76c9afbae08952/islands-middle'
          },
          {
            rank: 2,
            score: 12313,
            name: 'Иванов ива Иванович',
            lang: 'ru',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/24700/enc-2e30d8dfbf381f3d17fa77cbb712cc5320d6fa4e581d699e083721a522e5e84f/islands-middle'
          },
          {
            rank: 2,
            score: 12313,
            name: 'Ирина Морозова',
            lang: 'ru',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/30955/CsHa5Y1FJfmq0NfuwMDskweoY1s-1/islands-middle'
          },
          {
            rank: 2,
            score: 12313,
            name: 'Павел Стрельников',
            lang: 'ru',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/56823/H5GfBpMufdQ1OWi0TmcE3wSchpE-1/islands-middle'
          },
          {
            rank: 2,
            score: 12313,
            name: 'Иванов ива Иванович',
            lang: 'ru',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/21493/enc-949461d55ad8e9deb5fb42767a562a9cb258976f2c3ad874aa76c9afbae08952/islands-middle'
          }
        ]
      })
    }
  }
}

const activeLangCode = ref(GameOptions.lang)
const currentLang = computed<TLang>(() => langs[activeLangCode.value])

const onChangeLang = (langCode: string) => {
  activeLangCode.value = langCode
  const currentLanguage = toRaw(currentLang.value)
  if (gameState.value) {
    gameState.value.lang = langCode
    onSendGameData()
  }
  const scene = toRaw(phaserRef.value.scene)
  // console.log('paused ', scene.scene.get('Game').scene.isPaused())

  // if (scene.scene.get('Game').scene.isPaused() || scene.scene.get('Game').scene.isVisible()) {
  //   scene.scene.get('Game')?.changeLocale(currentLanguage)
  // }
  scene.scene.get('Home').setLocale(currentLanguage)
  scene.scene.get('WorkShop').setLocale(currentLanguage)
  scene.scene.get('Control').setLocale(currentLanguage)
  // scene.scene.get('NextLevel').changeLocale(currentLanguage)
  // scene.scene.get('GameOver').changeLocale(currentLanguage)
  scene.scene.get('Message').setLocale(currentLanguage)
  scene.scene.get('Bank').setLocale(currentLanguage)
  // scene.scene.get('Help').changeLocale(currentLanguage)
}

const startCreate = () => {
  onLoadGameData(toRaw(gameState.value))
  onChangeLang(gameState.value.lang)

  if (!window.initSDK) {
    onToggleLB(true)
  }
}

const startGame = () => {
  const scene = toRaw(phaserRef.value.scene)

  scene.scene.get('Game').onSetGameData(toRaw(gameState.value))
  scene.scene.get('Game').changeLocale(toRaw(currentLang.value))
}
const showButtonNext = (wasShow: boolean) => {
  const scene = toRaw(phaserRef.value.scene)

  scene.scene.get('NextLevel').showButtonNext(wasShow)
}

const onInitLang = (langCode: string) => {
  console.log('langCode=', langCode)
  if (langCode) {
    gameState.value.lang = langCode
    // onSaveGameData(toRaw(gameState.value))
    onChangeLang(gameState.value.lang)
  }
}

defineExpose({
  onInitLang: onInitLang,
  onLoadGameData: onLoadGameData,
  onLoadLB: onLoadLB,
  showButtonNext: showButtonNext
  // callbackSaveGameData
})
</script>

<template>
  <PhaserGame
    v-if="gameState"
    ref="phaserRef"
    @current-active-scene="currentScene"
    @save-data="onSaveGameData"
    @start-create="startCreate"
    @show-fullscreen-adv="showFullscreenAdv"
    @show-reward-adv="showRewardAdv"
    @toggle-lang-list="onToggleLangList"
    @toggle-lang="onToggleLang"
    @start-game="startGame"
    @show-lb="onToggleLB"
  />
  <div id="banner"></div>
  <div id="banner_gameover"></div>
  <div class="panel">
    <!-- <div class="panelBox">
      <div v-show="showLB && lb.entries.length" class="lb_box">
        <div class="lb">
          <div class="lb_title">{{ currentLang.leaderboard_title }}</div>
          <div class="lb_list">
            <div v-for="item in lb.entries" class="lb_item">
              <img :src="item.photo" class="lb_ava" />
              <div class="lb_text">
                <div class="lb_name">{{ item.name }}</div>
                <div class="lb_score">{{ item.score }}</div>
              </div>
              <div>
                {{ item.rate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    <div class="panelLb">
      <div v-show="showLangList" class="box">
        <div class="wrapper">
          <div class="box_title">
            {{ currentLang.lang_title }}
          </div>
          <div class="list">
            <div
              v-for="(lang, key) of langs"
              :key="key"
              class="item"
              @click="onChangeLang(key.toString()), onToggleLangList()"
            >
              {{ lang.name }}
            </div>
          </div>
          <div class="footer">
            <button class="btn" @click="onToggleLangList">{{ currentLang.close }}</button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div>
      <button class="button" @click="changeScene">Change Scene</button>
    </div>
    <div>
      <button :disabled="canMoveSprite" class="button" @click="moveSprite">Toggle Movement</button>
    </div>
    <div class="spritePosition">
      Sprite Position:
      <pre>{{ spritePosition }}</pre>
    </div>
    <div>
      <button class="button" @click="addSprite">Add New Sprite</button>
    </div> -->
    <!-- <div>
      <button
        class="button"
        @click="
          onSetGameData({
            bestScore: 0,
            level: 1,
            score: 0,
            levelScore: 100,
            tree: []
          })
        "
      >
        Add test gameData
      </button>
      <button
        class="button"
        @click="
          onSetUserData({
            name: 'Mikalai2006',
            photo:
              'https://avatars.mds.yandex.net/get-yapic/39249/enc-dcdb53645012cb8dc73ec9e23d44f7e6a836be1cfcfac6542456e1435d2b4796/islands-middle',
            uid: 'uid1'
          })
        "
      >
        Add test userData
      </button>
    </div> -->
  </div>
</template>

<style>
#banner {
  /* position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center; */
}
/* .panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
} */
/* .panelBox {
  position: relative;
} */
.box {
  font-size: 20px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  /* background: rgba(0, 0, 0, 0.8); */
  display: flex;
  align-items: center;
  justify-content: center;
}
.box_title {
  /* font-size: 20px; */
  font-size: 15px;
  text-align: center;
  padding-bottom: 30px;
}
.wrapper {
  margin-top: 5vh;
  background: #4a5449;
  border-radius: 15px;
  width: 250px;
  padding: 20px;
}
.list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.item {
  background: #eee;
  border-radius: 15px;
  color: black;
  cursor: pointer;
  /* padding: 15px; */
  font-size: 15px;
  padding: 10px;
}
.item:hover {
  background: #ccc;
}

@media screen and (max-width: 600px) {
  .box_title {
    font-size: 15px;
  }
  .item {
    font-size: 15px;
    padding: 10px;
  }
}
/* .panelLb {
  position: relative;
} */
.lb_box {
  font-size: 20px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  /* background: rgba(0, 0, 0, 0.8); */
  display: flex;
  align-items: start;
  justify-content: start;
  pointer-events: none;
}
.lb {
  margin-top: 35%;
  margin-left: 20%;
  width: 300px;
  background: transparent;
  padding: 20px;
  border-radius: 15px;
}
.lb_title {
  font-size: 30px;
  text-align: center;
  margin-bottom: 20px;
}
.lb_list {
  width: 100%;
}
.lb_item {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 10px;
}
.lb_ava {
  flex-shrink: 0;
  background: #000000;
  width: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.lb_text {
  flex-shrink: 1;
}
.lb_name {
  padding: 10px 0;
}
.lb_score {
  font-weight: bold;
}
@media screen and (max-width: 800px) {
  .lb_box {
    font-size: 15px;
  }
  .lb {
    margin-top: 10%;
    margin-left: 10%;
    padding: 0px;
  }
  .lb_title {
    font-size: 20px;
    margin-bottom: 5px;
  }
  .lb_ava {
    width: 30px;
    height: 30px;
  }
  .lb_name {
    padding: 2px 0;
  }
}
.footer {
  width: 100%;

  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  background: #222222;
  color: #fff;
  border: 0;
  appearance: none;
  border-radius: 15px;
  cursor: pointer;
  /* margin-top: 20px;
  padding: 20px 40px;
  font-size: 20px; */
  font-size: 15px;
  padding: 10px 20px;
  margin-top: 10px;
}
.btn:hover {
  background: #111;
}
@media screen and (max-width: 600px) {
  .btn {
    font-size: 15px;
    padding: 10px 20px;
    margin-top: 10px;
  }
}
</style>
