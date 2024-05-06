import App from './App.vue'
import { createApp } from 'vue'

window.game = createApp(App).mount('#app')

// Test SDK
window.showRewardedAdv = function (callback) {
  console.log('ShowRewarded')
  callback()
}
