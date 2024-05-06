<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'
// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits([
  'current-active-scene',
  'save-data',
  'start-create',
  'show-reward-adv',
  'show-fullscreen-adv',
  'toggle-lang-list',
  'toggle-lang',
  'start-game',
  'show-lb'
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

  EventBus.on('start-create', (data) => {
    emit('start-create', data)
  })
  EventBus.on('toggle-lang-list', () => {
    emit('toggle-lang-list')
  })
  EventBus.on('toggle-lang', () => {
    emit('toggle-lang')
  })
  EventBus.on('start-game', (currentScene) => {
    emit('start-game', currentScene)
  })
  EventBus.on('show-lb', (status) => {
    emit('show-lb', status)
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
