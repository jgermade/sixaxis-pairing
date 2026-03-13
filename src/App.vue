<script setup>
import { computed, reactive, ref, watch } from 'vue'

import SixaxisConnect from './components/SixaxisConnect.vue'
import RegisterInSixaxis from './components/RegisterInSixaxis.vue'
import BluetoothDeviceSelector from './components/BluetoothDeviceSelector.vue'

import { sixaxisService } from './services/sixaxis.service'
import { googleLoginService } from './services/googleLogin.service'

const colorScheme = ref(sessionStorage.getItem('colorScheme') || 'auto')

watch(colorScheme, (newScheme) => {
  sessionStorage.setItem('colorScheme', newScheme)

  document.documentElement.style.colorScheme = newScheme === 'auto'
    ? 'light dark'
    : newScheme
}, { immediate: true })

// ----

const scope = reactive({
  isConnecting: false,
  currentDS3Device: null,
  currentTargetDevice: null,
  pairedMacUpdatedInfo: false,
})

sixaxisService.onConnect((device) => {
  scope.currentDS3Device = device
})

const connectSixaxis = async () => {
  scope.isConnecting = true

  try {
    await sixaxisService.connect()
  } catch (error) {
    console.error('Failed to connect to Sixaxis controller:', error)
  } finally {
    scope.isConnecting = false
  }
}

const refreshSixaxis = async () => {
  scope.isConnecting = true

  try {
    await sixaxisService.refresh()
  } catch (error) {
    console.error('Failed to refresh Sixaxis connection:', error)
  } finally {
    scope.isConnecting = false
  }
}

const registerInsixaxis = async () => {
  try {
    await sixaxisService.setPairedMac(scope.currentTargetDevice.mac)

    scope.currentDS3Device.pairedMacAddress = scope.currentTargetDevice.mac

    scope.pairedMacUpdatedInfo = true
    setTimeout(() => {
      scope.pairedMacUpdatedInfo = false
    }, 2000)
  } catch (error) {
    console.error('Failed to register in Sixaxis:', error)
  }
}

const loginGoogle = () => {
  try {
    // Initiate the Google login flow; this does not wait for completion.
    googleLoginService.login()
  } catch (error) {
    console.error('Google login failed to start:', error)
  }
}



</script>

<template>
  <main>
    <section connection>
      <div container connection>
        <button
          type="button" color-scheme-selector
          @click="
            colorScheme = colorScheme === 'auto'
              ? 'light'
              : colorScheme === 'light' ? 'dark' : 'auto'
          "
        >
          {{ colorScheme }}
        </button>

        <!-- <button type="button" btn-login-google @click="loginGoogle()">
          Login Google
        </button> -->
        <!-- <div logo></div> -->
        <SixaxisConnect
          :isConnecting="scope.isConnecting"
          :currentDevice="scope.currentDS3Device"
          @connect="connectSixaxis()"
          @refresh="refreshSixaxis()"
          @disconnect="sixaxisService.close()"
        />
        <div v-if="scope.pairedMacUpdatedInfo" paired-notification>
          Paired MAC updated!
        </div>
        <RegisterInSixaxis
          v-if="scope.currentDS3Device && !scope.pairedMacUpdatedInfo"
          :disabled="!scope.currentTargetDevice"
          @register="registerInsixaxis()"
        />
        <div v-if="!scope.pairedMacUpdatedInfo && !scope.currentDS3Device" padding-bottom />
      </div>
    </section>
    <!-- <hr v-if="!scope.currentDevice" style="margin: 1rem 2rem 2rem" /> -->
    <section bluetooth-selector>
      <div container>
        <BluetoothDeviceSelector
          v-model="scope.currentTargetDevice"
        />
      </div>
      <footer>
        <a href="/privacy-policy/">Privacy Policy</a>
        <span style="margin: 0 1rem">|</span>
        <a href="/service-conditions/">Terms of Service</a>
      </footer>
    </section>
  </main>
</template>

<style lang="sass" scoped>

button[color-scheme-selector]
  position: fixed
  top: 1rem
  left: 1rem
  z-index: 1000
  padding: 8px 12px
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px

  color: light-dark(#333, #c2c1c1)
  background-color: light-dark(#eee, #444)

button[btn-login-google]
  position: fixed
  top: 2rem
  right: 2rem
  z-index: 1000
  padding: 8px 12px
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px

main
  min-height: 100vh
  min-height: 100dvh
  display: flex
  flex-direction: column

  // padding: 6vw 0

  section[connection]
    padding: 6vw 0 0
    background-color: light-dark(#fff, #333)
    color: light-dark(#333a3e, white)

    [padding-bottom]
      padding-bottom: 2rem

  section[bluetooth-selector]
    flex: 1 1 auto
    display: flex
    flex-direction: column
    justify-content: space-between
    padding: 2rem 0 0

  [container]
    max-width: 460px
    margin: 0 auto

  [paired-notification]
    display: flex
    justify-content: center
    align-items: center
    height: 5rem

footer
  position: sticky
  bottom: 0
  text-align: center
  padding: 10px 0
  
  a
    color: #ddd

  // [logo]
  //   // width: 240px
  //   // height: 120px
  //   aspect-ratio: 2 / 1
  //   margin: 0 auto 40px auto
  //   background-repeat: no-repeat
  //   background-position: center
  //   background-size: contain

  //   background-image: url('/images/ps-controller-dark.svg')
  //   @media (prefers-color-scheme: dark)
  //     background-image: url('/images/ps-controller-light.svg')

  // background-image: url('/images/ps-controller-dark.svg')
  // @media (prefers-color-scheme: dark)
  //   background-image: url('/images/ps-controller-light.svg')
</style>
