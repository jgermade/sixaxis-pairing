<script setup>
import { reactive, ref, watch } from 'vue'

import SixaxisConnect from './components/SixaxisConnect.vue'
import RegisterInSixasis from './components/RegisterInSixasis.vue'
import BluetoothDeviceSelector from './components/BluetoothDeviceSelector.vue'

import { sixasisService } from './services/sixaxis.service'

const colorScheme = ref(sessionStorage.getItem('colorScheme') || 'auto')

watch(colorScheme, (newScheme) => {
  sessionStorage.setItem('colorScheme', newScheme)
})

// ----

const scope = reactive({
  isConnecting: false,
  currentDevice: null,
  selectedDevice: null,
})

sixasisService.onConnect((device) => {
  scope.currentDevice = device
})

const connectSixaxis = async () => {
  scope.isConnecting = true

  try {
    await sixasisService.connect()
  } catch (error) {
    console.error('Failed to connect to Sixaxis controller:', error)
  } finally {
    scope.isConnecting = false
  }
}

const refreshSixaxis = async () => {
  scope.isConnecting = true

  try {
    await sixasisService.refresh()
    scope.isConnecting = false
  } catch (error) {
    console.error('Failed to refresh Sixaxis connection:', error)
  }
}

const registerInSixasis = async () => {
  try {
    await sixasisService.setPairedMac()
    alert('Registered in Sixaxis successfully!')
  } catch (error) {
    console.error('Failed to register in Sixaxis:', error)
    alert('Failed to register in Sixaxis. See console for details.')
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
        <!-- <div logo></div> -->
        <SixaxisConnect
          :isConnecting="scope.isConnecting"
          :currentDevice="scope.currentDevice"
          @connect="connectSixaxis()"
          @refresh="refreshSixaxis()"
          @disconnect="sixasisService.close()"
        />
        <RegisterInSixasis
          v-if="scope.currentDevice"
          :disabled="!scope.selectedDevice"
          @register="sixasisService.registerInSixasis()"
        />
        <div v-else padding-bottom />
      </div>
    </section>
    <!-- <hr v-if="!scope.currentDevice" style="margin: 1rem 2rem 2rem" /> -->
    <section bluetooth-selector>
      <div container>
        <BluetoothDeviceSelector
          @selected="device => scope.selectedDevice = device"
        />
      </div>
    </section>
  </main>

  <div color-scheme
    v-html="`<style rel='stylesheet'>
      :root {
        color-scheme: ${
          colorScheme === 'auto'
            ? 'light dark'
            : colorScheme
        } !important;
      }
    </style>
    `"
  />
</template>

<style lang="sass" scoped>

button[color-scheme-selector]
  position: fixed
  top: 20px
  left: 20px
  z-index: 1000
  padding: 8px 12px
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px

  color: light-dark(#333, #c2c1c1)
  background-color: light-dark(#eee, #444)

main
  // padding: 6vw 0

  section[connection]
    padding: 6vw 0 0
    background-color: light-dark(#fff, #333)
    color: light-dark(#333a3e, white)

    [padding-bottom]
      padding-bottom: 2rem

  section[bluetooth-selector]
    padding: 2rem 0

  [container]
    max-width: 460px
    margin: 0 auto

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
