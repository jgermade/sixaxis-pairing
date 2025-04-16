
<script setup>
import { reactive } from 'vue'

import { SixaxisController } from '../services/sixaxis.service'

const sixaxisCtrl = new SixaxisController()

const sixaxis = reactive({
    isConnecting: false,
    isConnected: false,
    isLoading: false,
    productName: null,
    controllerMac: null,
    pairedMac: null,
    newPairingMac: '',
    isSaving: false,
})

const connectDevice = async () => {
  sixaxis.isConnecting = true

  sixaxisCtrl.connect()
    .then(() => {
      sixaxis.productName = sixaxisCtrl.device.productName
      sixaxis.isConnected = true
    })
    .finally(() => {
      sixaxis.isConnecting = false
    })
    .then(async () => {
      sixaxis.isLoading = true
      sixaxis.controllerMac = await sixaxisCtrl.getSelfMacAddress()
      sixaxis.pairedMac = await sixaxisCtrl.getPairedMacAddress()
      sixaxis.isLoading = false
    })
    .catch(() => {})
}

const disconnectDevice = async () => {
  sixaxis.isConnecting = true
  await sixaxisCtrl.close()
  sixaxis.isConnecting = false

  sixaxis.productName = null
  sixaxis.isConnected = false
}

const savePairingMac = async () => {
  sixaxis.isSaving = true
  
  sixaxisCtrl.setPairedMac(sixaxis.newPairingMac)
    .then(async () => {
      sixaxis.pairedMac = await sixaxisCtrl.getPairedMacAddress()
      sixaxis.newPairingMac = ''
    })
    .catch(err => {
      console.error(err)
      alert(err.message)
    })
    .finally(() => {
      sixaxis.isSaving = false
    })
}
</script>

<template>
  <div sixaxis-widget>
    <header>
      <button type="button" sixaxis-connect
        :class="{ connected: sixaxis.isConnected }"
        @click="sixaxis.isConnected ? disconnectDevice() : connectDevice()"
        :disabled="sixaxis.isConnecting || sixaxis.isLoading"
      >
        {{ sixaxis.isConnected ? 'Disconnect' : 'Connect' }} sixaxis
      </button>
      <div v-if="sixaxis.isConnected">
        <ul device-info>
          <li>
            <div device-name>{{ sixaxis.productName }}</div>
            <div v-if="!sixaxis.isLoading" device-mac>MAC: {{ sixaxis.controllerMac }}</div>
          </li>
          <li v-if="sixaxis.isLoading">loading...</li>
          <li v-else>pairing: <strong>{{ sixaxis.pairedMac }}</strong></li>
        </ul>
      </div>
    </header>
    <form v-if="sixaxis.isConnected && !sixaxis.isLoading" @submit.prevent="savePairingMac()">
      <input v-model="sixaxis.newPairingMac" placeholder="00:00:00:00:00:00">

      <button type="submit" save-pairing-mac :disabled="sixaxis.isSaving || !sixaxis.newPairingMac">
        save pairing MAC
      </button>
    </form>
  </div>
</template>

<style lang="sass" scoped>
[sixaxis-widget]
  background: white
  color: #333a3e
  width: 400px
  padding: 32px

[sixaxis-widget], header, section, form
  display: flex
  flex-direction: column
  gap: 12px

button[sixaxis-connect], button[save-pairing-mac]
  width: 100%
  height: 40px
  background: royalblue
  color: white
  border: 0
  border-radius: 3px
  cursor: pointer

  &[disabled]
    opacity: 0.6

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

[device-info]
  margin: 0

  [device-mac]
    font-size: 10px
    color: #777
  
  li + li
    margin-top: 12px
</style>

