
<script setup>
import { reactive } from 'vue'

import { SixaxisController } from '../services/sixaxis.service'

const sixaxisCtrl = new SixaxisController()

const sixasis = reactive({
    isConnecting: false,
    isConnected: false,
    isLoading: false,
    productName: null,
    controllerMac: null,
    pairedMac: null,
    newPairingMac: null,
})

const connectDevice = async () => {
  sixasis.isConnecting = true

  sixaxisCtrl.connect()
    .then(() => {
      sixasis.productName = sixaxisCtrl.device.productName
      sixasis.isConnected = true
    })
    .finally(() => {
      sixasis.isConnecting = false
    })
    .then(async () => {
      sixasis.isLoading = true
      sixasis.controllerMac = await sixaxisCtrl.getSelfMacAddress()
      sixasis.pairedMac = await sixaxisCtrl.setPairedMac()
      sixasis.isLoading = false
    })
    .catch(() => {})
}

const disconnectDevice = async () => {
  sixasis.isConnecting = true
  await sixaxisCtrl.close()
  sixasis.isConnecting = false

  sixasis.productName = null
  sixasis.isConnected = false
}
</script>

<template>
  <div sixasis-widget>
    <header>
      <button type="button" sixaxis-connect
        :class="{ connected: sixasis.isConnected }"
        @click="sixasis.isConnected ? disconnectDevice() : connectDevice()"
        :disabled="sixasis.isConnecting"
      >
        {{ sixasis.isConnected ? 'Disconnect' : 'Connect' }}
      </button>
      <div v-if="sixasis.isConnected">
        <input readonly :value="sixasis.productName">
      </div>
    </header>
    <section v-if="sixasis.isConnected">
      <div v-if="sixasis.isLoading">
        loading info
      </div>
      <ul>
        <li>device MAC: {{ sixasis.controllerMac }}</li>
      </ul>
      <form>
        <input :value="sixasis.pairedMac">
      </form>
    </section>
  </div>
</template>

<style lang="sass" scoped>
[sixasis-widget]
  background: white
  width: 400px
  padding: 32px

[sixasis-widget], header, section, [inputs-details]
  display: flex
  flex-direction: column
  gap: 12px

button[sixaxis-connect]
  width: 100%
  height: 40px
  background: royalblue
  border: 0
  border-radius: 3px
  cursor: pointer

  &.connected
    background: grey
    
    &:hover
      background: firebrick
  
input
  width: 100%
  height: 40px
  background: white
  color: #333a3e
  outline: 0
  border: 2px solid royalblue
  border-radius: 3px
  padding: 0 12px
</style>

