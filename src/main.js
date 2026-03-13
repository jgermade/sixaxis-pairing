
import { createApp } from 'vue'

import './style.sass'
import App from './App.vue'

import { blueretroDBService } from './services/blueretroDB.service'

blueretroDBService.connect()
  .then(() => {
    createApp(App).mount('#app')
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error)
    alert('Failed to connect to database. Please check the console for more details.')
  })

if (import.meta.env.DEV) {
  console.log('Google Client ID:', GOOGLE_CLIENT_ID)
}

globalThis.onload = function () {
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        console.error('Failed to obtain access token:', tokenResponse)
        alert('Failed to obtain access token. Please check the console for more details.')
        return
      }

      blueretroDBService.initReplication({
        oauthClientId: GOOGLE_CLIENT_ID,
        authToken: tokenResponse.access_token,
      }).catch(err => {
        console.error('Failed to initialize replication:', err)
        alert('Failed to initialize replication. Please check the console for more details.')
      })
    },
  })

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    itp_support: true,
    native_callback: true,
    callback: (response => {
      if (response.credential) {
        console.log('Google login successful:', response)

        tokenClient.requestAccessToken({ prompt: 'consent' })

      } else {
        console.error('Google login failed: No credential received')
      }
    })
  })
  google.accounts.id.renderButton(
    document.querySelector(".g_id_signin"),
    {
      // theme: 'outline',
      // size: 'large',
    }
  )
  // google.accounts.id.prompt(); // Opcional: mostrar One Tap
}
