
class GoogleLoginService {
  constructor() {
    this.isLoggedIn = false
  }

  async login() {
    console.log('Initiating Google login...')

    google.accounts.oauth2.initCodeClient({
      client_id: import.meta.env.GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      ux_mode: 'popup',
      callback: (tokenResponse) => {
        console.log('Google OAuth token obtained:', tokenResponse)

        blueretroDBService.initReplication({
          oauthClientId: GOOGLE_CLIENT_ID,
          authToken: tokenResponse.code,
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
    }).requestCode()

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
