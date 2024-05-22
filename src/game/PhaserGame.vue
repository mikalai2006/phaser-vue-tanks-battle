<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'
import { IGameData, IPlayerData } from './types'
// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits([
  'current-active-scene',
  'save-data',
  'toggle-lang',
  // 'start-game',
  'set-lb',
  'get-lb',
  'set-lang',
  'set-data',
  'set-player-data',
  'sync-player-data',
  'set-ad-blocker'
])

onMounted(() => {
  game.value = StartGame('game-container')

  EventBus.on('current-scene-ready', (currentScene) => {
    emit('current-active-scene', currentScene)

    scene.value = currentScene
  })

  EventBus.on('save-data', (data) => {
    emit('save-data', data)
  })
  EventBus.on('set-data', (stringData: string) => {
    emit('set-data', stringData)
  })

  // EventBus.on('start-game', (data) => {
  //   emit('start-game', data)
  // })
  EventBus.on('toggle-lang', (code: string) => {
    emit('toggle-lang', code)
  })
  EventBus.on('set-lb', (score: number) => {
    emit('set-lb', score)
  })

  EventBus.on('get-lb', () => {
    emit('get-lb')
  })

  EventBus.on('set-lang', (code: string) => {
    emit('set-lang', code)
  })
  EventBus.on('set-player-data', (data: IPlayerData) => {
    emit('set-player-data', data)
  })
  EventBus.on('sync-player-data', (data: IGameData) => {
    emit('sync-player-data', data)
  })
  EventBus.on('set-ad-blocker', (status: boolean) => {
    emit('set-ad-blocker', status)
  })
})

onUnmounted(() => {
  if (game.value) {
    game.value.destroy(true)
    game.value = null
  }
})

defineExpose({ scene, game })
</script>

<template>
  <div id="game-container" class="noselect"></div>
</template>
