
<script setup>
import { BlueretroService } from '../services/blueretro.service'

const selectDevice = async () => {
  const device = await BlueretroService.requestBlueretroDevice()

  const mac = await BlueretroService.getMAC(device)

  console.log('Device Info:', {
    name: device.name,
    id: device.id,
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