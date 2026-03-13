
import { createApp } from 'vue'

import { blueretroDBService } from './services/brDB.service'
import './style.sass'
import App from './App.vue'

blueretroDBService.connect()
  .then(() => {
    createApp(App).mount('#app')
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error)
    alert('Failed to connect to database. Please check the console for more details.')
  })
