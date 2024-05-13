<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'
import { IGameData } from './types'
// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits([
  'current-active-scene',
  'save-data',
  'show-reward-adv',
  'show-fullscreen-adv',
  'toggle-lang',
  // 'start-game',
  'set-lb',
  'get-lb',
  'set-lang',
  'set-data',
  'set-player-data'
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

  EventBus.on('show-reward-adv', (callback) => {
    emit('show-reward-adv', callback)
  })

  EventBus.on('show-fullscreen-adv', (callback) => {
    emit('show-fullscreen-adv', callback)
  })

  // EventBus.on('start-game', (data) => {
  //   emit('start-game', data)
  // })
  EventBus.on('toggle-lang', () => {
    emit('toggle-lang')
  })
  EventBus.on('get-lb', () => {
    emit('get-lb')
  })

  EventBus.on('set-lang', (code: string) => {
    emit('set-lang', code)
  })
  EventBus.on('set-data', (data: IGameData) => {
    return emit('set-data', data)
  })
  EventBus.on('set-player-data', (data: IGameData) => {
    return emit('set-player-data', data)
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
  <div id="game-container"></div>
</template>
