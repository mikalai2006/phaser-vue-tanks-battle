<script setup lang="ts">
import { Ref, computed, ref, toRaw } from 'vue'
import { debounce } from 'lodash'

import PhaserGame from './game/PhaserGame.vue'
import { getLocalStorage, setLocalStorage } from './game/utils/storageUtils'
import { GameOptions } from './game/options/gameOptions'

import { langs } from './game/lang'
import { IGameData, ILeaderBoard, IPlayerData, TLang } from './game/types'
import { isValidJSON } from './game/utils/utils'

const phaserRef = ref()

// Game data default.
const defaultGameData: IGameData = {
  score: 0,
  coin: 10000,
  activeTankIndex: 0,
  rank: 0,
  tanks: [
    {
      ...GameOptions.tanks.items[0].game,
      ...GameOptions.towers.items[0].game,
      ...GameOptions.muzzles.items[0].game,
      cb: 0,
      id: GameOptions.complexTanks[0].id
    }
  ],
  cb: 0,
  cw: 0,
  gerbId: 0,
  name: '',
  lang: '',
  settings: {
    friendlyFire: true,
    showToast: false,
    autoShot: false,
    showAreol: true,
    showArrow: true,
    showBar: true,
    autoCheckWeapon: false,
    towerForward: false,
    showAllEnemyEye: false,
    showHintKill: true
  },
  weapons: {},
  help: {}
}

const userName = ref('')
const onSetUserName = () => {
  gameData.value.name = userName.value
  onSaveGameData(gameData.value)
}

/**
 * Player data
 */
const playerData = ref<Ref<IPlayerData | null>>(null)
const onSetPlayerData = (data: IPlayerData) => {
  playerData.value = data
  if (data) {
    defaultGameData.name = data.name || ''
  }
  // console.log('onSetPlayerData: ', playerData.value)
}

/**
 * Game data
 */
const gameData = ref<Ref<IGameData | null>>(null)
const setData = (stringData: string) => {
  if (!stringData) {
    stringData = JSON.stringify(getLocalStorage(window.gameLocalStorageName, defaultGameData))
    // if (GameOptions.tobData && typeof stringData == 'string') {
    //   stringData = JSON.parse(decodeURIComponent(window.atob(dataFromStorage)))
    // } else {
    //   stringData = dataFromStorage
    // }
  }

  let data: IGameData
  if (isValidJSON(stringData)) {
    data = JSON.parse(stringData)
  } else {
    throw new Error('Not valid JSON')
  }

  if (typeof data == 'string') {
    // stringData = stringData.replace(/"/g, '').replace(/\\/g, '')
    data = JSON.parse(decodeURIComponent(atob(data)))
  }

  if (typeof data == 'object') {
    // set user name
    if (!data.name && playerData.value?.name) {
      data.name = playerData.value.name
    }

    // set lang from data
    if (data.lang) {
      langCode.value = data.lang
    }

    // set lang to data
    if (langCode.value && !data.lang) {
      data.lang = langCode.value
    }

    // set status ad blocker
    if (statusAdBlocker.value != undefined) {
      data.adb = statusAdBlocker.value
    }

    if (!data.playDay) {
      data.playDay = 0
    }

    if (data.lastDay) {
      const nowDay = new Date() // '2024-05-16T00:59:59.132Z'
      const lastDay = new Date(data.lastDay) // '2024-05-16T00:00:34.132Z'
      const diff = Math.floor((nowDay - lastDay) / (1000 * 60 * 60 * 24))
      // console.log(lastDay, nowDay, diff)

      if (diff == 1) {
        data.playDay += 1
      } else if (diff > 0) {
        data.playDay = 0
      }
    }

    data.lastDay = new Date()

    gameData.value = data ? JSON.parse(JSON.stringify(data)) : defaultGameData
  }
}

const onSaveToSdk = (data) => {
  window.saveGameData(data)
}
const debounceOnSaveToSdk = debounce(onSaveToSdk, 1000)

const onSaveGameData = (data: IGameData) => {
  let newData: string | IGameData = data
  if (window.tobData) {
    newData = btoa(encodeURIComponent(JSON.stringify(data)))
  }

  if (window.sdk) {
    debounceOnSaveToSdk(newData)
  } else {
    setLocalStorage(window.gameLocalStorageName, newData)
  }

  // console.log(data)
  // const a = btoa(encodeURIComponent(JSON.stringify(data)))
  // console.log(a)
  // const b = decodeURIComponent(window.atob(a))
  // console.log(JSON.parse(b))

  gameData.value = data

  syncScenes()
}

/**
 * Lang game.
 */
const langCode = ref(window.defaultLang)
const currentLang = computed<TLang>(() => langs[langCode.value])
const setLang = (code: string) => {
  if (!langs[code] || !code) {
    code = window.defaultLang
  }
  langCode.value = code

  userName.value = `${currentLang.value.notName}${Math.floor(Math.random() * 1000000)}`
}

const onToggleLang = (code: string) => {
  // if (langCode.value === 'ru') {
  //   onChangeLang('en')
  // } else {
  //   onChangeLang('ru')
  // }
  onChangeLang(code)
}

const onChangeLang = (code: string) => {
  langCode.value = code

  if (gameData.value) {
    gameData.value.lang = langCode.value
    // syncScenes()
    onSaveGameData(gameData.value)
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

const onSetLB = (value: number) => {
  // lb.value = _lb
  window?.setLB && window.setLB(value)
}

const onGetLB = async () => {
  let _lb: ILeaderBoard

  if (GameOptions.isLeaderBoard && window?.getLB) {
    _lb = window?.getLB && (await window.getLB())
    _lb && onLoadLB(_lb)

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

/**
 * AD
 */
const statusAdBlocker = ref(false)
const setAdBlocker = (status: boolean) => {
  statusAdBlocker.value = status
}

const onSyncPlayerData = () => {
  const game = toRaw(phaserRef.value.game)

  for (const scene of game.scene.scenes) {
    scene?.onSyncPlayerData && scene.onSyncPlayerData(toRaw(playerData.value || {}))
  }
}

const syncScenes = () => {
  const game = toRaw(phaserRef.value.game)

  for (const scene of game.scene.scenes) {
    scene?.onSync && scene.onSync(toRaw(gameData.value), toRaw(currentLang.value))
  }
}

defineExpose({
  currentLang: computed(() => currentLang.value),
  gameData: computed(() => gameData.value),
  playerData: computed(() => playerData.value || {})
})

const currentScene = (scene) => {}
</script>

<template>
  <!-- @start-game="startGame" -->
  <PhaserGame
    ref="phaserRef"
    @current-active-scene="currentScene"
    @save-data="onSaveGameData"
    @toggle-lang="onToggleLang"
    @get-lb="onGetLB"
    @set-lb="onSetLB"
    @set-lang="setLang"
    @set-data="setData"
    @set-player-data="onSetPlayerData"
    @sync-player-data="onSyncPlayerData"
    @set-ad-blocker="setAdBlocker"
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
.noselect,
body,
canvas {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
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
