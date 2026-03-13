import { blueretroDBService } from './blueretroDB.service'

class GoogleLoginService {
  constructor() {
    this.isLoggedIn = false
  }

  async login() {
    console.log('Initiating Google login...')

    const clientId =
      (typeof GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID) ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      import.meta.env.GOOGLE_CLIENT_ID

    if (!clientId) {
      console.error('Google client ID is not configured.')
      throw new Error('Google client ID is not configured')
    }

    if (typeof window === 'undefined' || !window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.error('Google API is not loaded on window.google.accounts.oauth2.')
      throw new Error('Google API is not loaded')
    }

    window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse) => {
        console.log('Google OAuth token obtained:', tokenResponse)

        if (!tokenResponse?.access_token) {
          console.error('Google OAuth access token was not returned')
          return
        }

        blueretroDBService.initReplication({
          oauthClientId: clientId,
          authToken: tokenResponse.access_token,
        })
          .then(() => {
            console.log('Replication initialized successfully')
            this.isLoggedIn = true
          })
          .catch(err => {
            console.error('Failed to initialize replication:', err)
            alert('Failed to initialize replication. Please check the console for more details.')
          })
      },
    }).requestAccessToken({ prompt: 'consent' })

    // try {
    //   const authResult = await new Promise((resolve, reject) => {
    //     google.accounts.id.initialize({
    //       client_id: '644614190946-k1oakeu4dgva1onbq6jo6d87oa1ui4ba.apps.googleusercontent.com',
    //       callback: (response => {
    //         if (response.credential) {
    //           console.log('Google login successful:', response)
    //           resolve(response)
    //         } else {
    //           reject(new Error('Google login failed: No credential received'))
    //         }
    //       })
    //     })
    //   })

    //   this.isLoggedIn = true
    //   return authResult
    // } catch (error) {
    //   console.error('Google login failed:', error)
    //   throw error
    // }
  }
}

export const googleLoginService = new GoogleLoginService()
