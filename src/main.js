
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

const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID

console.log('Google Client ID:', import.meta.env)

// globalThis.onload = function () {
//   google.accounts.id.initialize({
//     client_id: GOOGLE_CLIENT_ID,
//     itp_support: true,
//     native_callback: true,
//     callback: (response => {
//       if (response.credential) {
//         console.log('Google login successful:', response)

//         // google.accounts.oauth2.initCodeClient({
//         //   client_id: GOOGLE_CLIENT_ID,
//         //   scope: 'https://www.googleapis.com/auth/drive.appdata',
//         //   ux_mode: 'popup',
//         //   callback: (tokenResponse) => {
//         //     if (tokenResponse.access_token) {
//         //       console.log('Google OAuth token obtained:', tokenResponse)

//         //       blueretroDBService.initReplication({
//         //         oauthClientId: GOOGLE_CLIENT_ID,
//         //         authToken: tokenResponse.access_token,
//         //       }).catch(err => {
//         //         console.error('Failed to initialize replication:', err)
//         //         alert('Failed to initialize replication. Please check the console for more details.')
//         //       })
//         //     } else {
//         //       console.error('Failed to obtain access token:', tokenResponse)
//         //       alert('Failed to obtain access token. Please check the console for more details.')
//         //     }
//         //   },
//         // }).requestCode()

//         blueretroDBService.initReplication({
//           oauthClientId: GOOGLE_CLIENT_ID,
//           authToken: response.credential,
//         }).catch(err => {
//           console.error('Failed to initialize replication:', err)
//           alert('Failed to initialize replication. Please check the console for more details.')
//         })

//       } else {
//         console.error('Google login failed: No credential received')
//       }
//     })
//   })
//   google.accounts.id.renderButton(
//     document.querySelector(".g_id_signin"),
//     {
//       // theme: 'outline',
//       // size: 'large',
//     }
//   )
//   // google.accounts.id.prompt(); // Opcional: mostrar One Tap
// }
