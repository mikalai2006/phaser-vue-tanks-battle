<script setup lang="ts">
import { Ref, computed, ref, toRaw } from 'vue'
import PhaserGame from './game/PhaserGame.vue'
import { getLocalStorage, setLocalStorage } from './game/utils/storageUtils'
import { GameOptions } from './game/options/gameOptions'

import { langs } from './game/lang'
import { IGameData, ILeaderBoard, IUserData, TLang } from './game/types'

const phaserRef = ref()

// Game data default.
const defaultGameData: IGameData = {
  score: 10000000,
  coin: 100000000,
  activeTankIndex: 0,
  tanks: [
    {
      ...GameOptions.tanks.items[0].game,
      ...GameOptions.towers.items[0].game,
      ...GameOptions.muzzles.items[0].game,
      cb: 0,
      id: GameOptions.complexTanks[0].id
    }
  ],
  gerbId: 0,
  name: '',
  lang: GameOptions.lang,
  settings: {
    friendlyFire: true,
    showToast: false,
    autoShot: false,
    showAreol: false,
    showArrow: true,
    showBar: true,
    autoCheckWeapon: false,
    towerForward: false,
    showAllEnemyEye: true
  },
  weapons: {},
  help: {}
}

const playerData = ref<IUserData>({})
const onSetPlayerData = (data: IUserData) => {
  playerData.value = data
  defaultGameData.name = gameData.value.name = data?.name || ''
}

const syncScenes = () => {
  const scene = toRaw(phaserRef.value.scene)

  scene.scene.get('Home').onSync(toRaw(gameData.value), toRaw(currentLang.value))
  scene.scene.get('Message').onSync(toRaw(gameData.value), toRaw(currentLang.value))
  scene.scene.get('Bank').onSync(toRaw(gameData.value), toRaw(currentLang.value))
  scene.scene.get('WorkShop').onSync(toRaw(gameData.value), toRaw(currentLang.value))
  scene.scene.get('Control').onSync(toRaw(gameData.value), toRaw(currentLang.value))
  scene.scene.get('Game')?.onSync(toRaw(gameData.value), toRaw(currentLang.value))
}

/**
 * Data game
 */
const gameData = ref<Ref<IGameData | null>>(null)
const setData = (data: IGameData) => {
  if (!data) {
    data = getLocalStorage(GameOptions.localStorageName, defaultGameData)
  }

  gameData.value = data ? JSON.parse(JSON.stringify(data)) : defaultGameData
}

const onSaveGameData = (data: IGameData) => {
  if (window.initSDK) {
    window.saveGameData(data)
    window.setLB(data.score)
  } else {
    setLocalStorage(GameOptions.localStorageName, data)
  }
  gameData.value = data

  syncScenes()
}

/**
 * Lang game.
 */
const langCode = ref(GameOptions.lang)
const currentLang = computed<TLang>(() => langs[langCode.value])
const setLang = (code: string) => {
  langCode.value = code || GameOptions.lang
}

const onToggleLang = () => {
  if (langCode.value === 'ru') {
    onChangeLang('en')
  } else {
    onChangeLang('ru')
  }
}

const onChangeLang = (code: string) => {
  langCode.value = code

  if (gameData.value) {
    gameData.value.lang = langCode.value
    syncScenes()
  }
}

/**
 * Leaderboard.
 */
const lb = ref<ILeaderBoard>({
  entries: [],
  leaderboard: {
    title: []
  },
  userRank: 0
})

const onSetLB = (_lb: ILeaderBoard) => {
  lb.value = _lb
}

const onGetLB = async () => {
  let _lb

  if (GameOptions.isLeaderBoard) {
    _lb = await window?.getLB()
    _lb && onSetLB(_lb)

    const scene = toRaw(phaserRef.value)
    const homeScene = toRaw(scene.game.scene.getScene('Home'))
    if (homeScene) {
      homeScene.onSetLeaderBoard(toRaw(lb.value))
    }
  }

  return _lb
}

const onLoadLB = (data: ILeaderBoard) => {
  lb.value = data
}

const showFullscreenAdv = (callback: any) => {
  if (window.showFullSrcAdv) {
    window.showFullSrcAdv(callback)
  } else {
    callback && callback()
  }
}
const showRewardAdv = (callback: any) => {
  if (window.showRewardedAdv) {
    window.showRewardedAdv(callback)
  } else {
    callback && callback()
  }
}

defineExpose({
  currentLang: computed(() => currentLang.value),
  gameData: computed(() => gameData.value)
})

const currentScene = (scene) => {}

const userName = ref('Noname')
const onSetUserName = () => {
  gameData.value.name = userName.value
  onSaveGameData(gameData.value)
}
</script>

<template>
  <!-- @start-game="startGame" -->
  <PhaserGame
    ref="phaserRef"
    @current-active-scene="currentScene"
    @save-data="onSaveGameData"
    @show-fullscreen-adv="showFullscreenAdv"
    @show-reward-adv="showRewardAdv"
    @toggle-lang="onToggleLang"
    @get-lb="onGetLB"
    @set-lb="onSetLB"
    @set-lang="setLang"
    @set-data="setData"
    @set-player-data="onSetPlayerData"
  />
  <div id="banner"></div>
  <div id="banner_gameover"></div>
  <div v-if="gameData && !gameData.name" class="panel">
    <div class="overlay"></div>
    <div class="form">
      <h3 class="title">{{ currentLang.inputName }}</h3>
      <input v-model="userName" class="input" />
      <button class="button" @click="onSetUserName">ok</button>
    </div>
  </div>
</template>

<style>
.title {
  margin: 0;
  padding-bottom: 10px;
}
.panel {
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: start;
  justify-content: center;
}
.overlay {
  position: absolute;
  inset: 0;
  background: #000000;
  opacity: 0.9;
}
.input {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  padding: 8px;
  border: 0;
}
.button {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  width: 50px;
  border: 0;
  background: #555555;
  padding: 8px;
}
.button:focus,
.button:hover {
  border: 0;
  color: #000000;
}
.form {
  background: #000000;
  opacity: 0.9;
  margin-top: 10vh;
  padding: 25px;
}
</style>
