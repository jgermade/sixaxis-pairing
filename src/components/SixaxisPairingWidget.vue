
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
    .then(() => updateDeviceInfo())
    .catch(() => {})
}

const updateDeviceInfo = async () => {
  if (!sixaxis.isConnected) return

  sixaxis.isLoading = true
  sixaxis.controllerMac = await sixaxisCtrl.getSelfMacAddress()
  sixaxis.pairedMac = await sixaxisCtrl.getPairedMacAddress()
  sixaxis.isLoading = false
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

const macMask = ({ target: { value } }) => {
  const endsWithColon = /:$/.test(value)
  const newValue = (
    value
      .toUpperCase()
      .replace(/[^0-9A-F]/g, '')
      .match(/..?/g) ?? []
  ).join(':')

  sixaxis.newPairingMac = newValue + ((newValue.length%3 === 2) && endsWithColon ? ':' : '')
}
</script>

<template>
  <div sixaxis-widget>
    <header>
      <div v-if="!sixaxis.isConnected" actions>
        <button type="button" sixaxis-connect
          :class="{ connected: sixaxis.isConnected }"
          @click="connectDevice()"
          :disabled="sixaxis.isConnecting || sixaxis.isLoading"
        >
          {{ sixaxis.isConnecting ? 'connecting...' : 'connect PS3 sixaxis' }}
        </button>
      </div>
      <div v-else actions>
        <button type="button" sixaxis-update
          :class="{ connected: sixaxis.isConnected }"
          @click="updateDeviceInfo()"
          :disabled="sixaxis.isConnecting || sixaxis.isLoading"
        >
          {{ sixaxis.isLoading ? 'loading...' : 'refresh' }}
        </button>
        <button type="button" sixaxis-disconnect
          :class="{ connected: sixaxis.isConnected }"
          @click="sixaxis.isConnected ? disconnectDevice() : connectDevice()"
          :disabled="sixaxis.isConnecting || sixaxis.isLoading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
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
      <input
        v-model="sixaxis.newPairingMac"
        pattern="^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$"
        placeholder="00:00:00:00:00:00"
        maxlength="17"
        @input="macMask"
      >

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
  // width: 400px
  padding: 2rem

[sixaxis-widget], header, section, form
  display: flex
  flex-direction: column
  gap: .75rem

[actions]
  display: flex
  gap: .5rem

  button[sixaxis-connect],
  button[save-pairing-mac],
  button[sixaxis-disconnect],
  button[sixaxis-update]
    width: 100%
    height: 2.5rem
    background: royalblue
    color: white
    border: 0
    border-radius: .1875rem
    cursor: pointer

    &[disabled]
      opacity: 0.6

    &[sixaxis-connect]
      &.connected
        background: grey
        
        &:hover
          background: firebrick

    &[sixaxis-update]
      &:hover
        background: dimgray

      &, &:active
        background: grey

    &[sixaxis-disconnect]
      width: 2.5rem
      flex: 0 0 auto
      &.connected
        background: firebrick

      svg
        vertical-align: middle
        pointer-events: none
  
input
  width: 100%
  height: 2.5rem
  background: white
  color: #333a3e
  outline: 0
  border: .125rem solid royalblue
  border-radius: .1875rem
  padding: 0 .75rem

[device-info]
  margin: 0
  padding-left: 1.4rem

  [device-mac]
    font-size: .625rem
    color: #777
  
  li + li
    margin-top: .75rem
</style>

