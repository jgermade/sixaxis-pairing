
<script setup>
import { ref } from 'vue'

import { BlueretroService } from '../services/blueretro.service'
import { blueretroDBService } from '../services/brDB.service'

const devices = ref([])

blueretroDBService.onUpdateList((updatedDevices) => {
  devices.value = updatedDevices
})

const selectDevice = async () => {
  const device = await BlueretroService.requestBlueretroDevice()

  const mac = await BlueretroService.getMAC(device)

  console.log('Device Info:', {
    name: device.name,
    id: device.id,
    mac,
  })

  await blueretroDBService.addDevice({
    id: device.id,
    name: device.name,
    mac,
  })
}
</script>

<template>
  <div class="bluetooth-device-selector">
    <button @click="selectDevice">
      <img src="/images/Bluetooth.svg" alt="Bluetooth Icon" class="bluetooth" />
      <img src="/images/BRE_Logo_Color.png" alt="BlueRetro Logo" class="blueretro" />
    </button>
  </div>

  <div style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
    Click the button above to select a Bluetooth device and save it to the database.
  </div>

  <div class="devices-list">
    <h3>Paired Devices:</h3>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }} (MAC: {{ device.mac }})
      </li>
    </ul>
  </div>
</template>

<style lang="sass" scoped>
.bluetooth-device-selector
  margin-top: 40px
  display: flex
  justify-content: center

  button
    display: flex
    align-items: center
    gap: 12px
    padding: 10px 20px
    font-size: 16px
    cursor: pointer
    border: none
    border-radius: 4px
    color: white
    filter: grayscale(100%) brightness(150%)
    background: dimgray

    &:hover, &:focus
      filter: none
      background: royalblue

    &:active
      // filter: grayscale(100%) brightness(150%)
      background: dimgray

    .bluetooth
      height: 32px

    .blueretro
      height: 40px
</style>