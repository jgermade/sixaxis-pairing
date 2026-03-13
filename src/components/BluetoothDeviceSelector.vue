
<script setup>
import { ref } from 'vue'

import { BlueretroService } from '../services/blueretro.service'
import { blueretroDBService } from '../services/brDB.service'

const devices = ref([])
const newDeviceId = ref('')
const newDeviceMac = ref('')
const newDeviceName = ref('')

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

const macMask = ({ target }) => {
  const endsWithColon = /:$/.test(target.value)
  const newValue = (
    target.value
      .toUpperCase()
      .replace(/[^0-9A-F]/g, '')
      .match(/..?/g) ?? []
  ).join(':')

  target.value = (
    newValue + ((newValue.length%3 === 2) && endsWithColon ? ':' : '')
  ).toLowerCase()

  // if completed mac address, emit 'complete' event with the value
  if (/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(target.value)) {
    target.dispatchEvent(new CustomEvent('complete', { detail: target.value }))
  }
}

const onSubmit = async (event) => {
  if (event.target.checkValidity() === false) return

  event.preventDefault()

  await blueretroDBService.addDevice({
    id: newDeviceId.value || crypto.randomUUID(),
    name: newDeviceName.value,
    mac: newDeviceMac.value,
  })

  newDeviceId.value = ''
  newDeviceMac.value = ''
  newDeviceName.value = ''
}
</script>

<template>
  <!-- <div class="bluetooth-device-selector">
    <button @click="selectDevice">
      <img src="/images/Bluetooth.svg" alt="Bluetooth Icon" class="bluetooth" />
      <img src="/images/BRE_Logo_Color.png" alt="BlueRetro Logo" class="blueretro" />
    </button>
  </div> -->

  <div class="devices-list">
    <form @submit="onSubmit">
      <div input-group>
        <div inputs>
          <input
            v-model="newDeviceMac"
            pattern="^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$"
            placeholder="00:00:00:00:00:00"
            maxlength="17"
            required
            @input="macMask"
            @complete="
              // focus next invalid input or submit form if all valid
              $event.target.form.querySelector(':invalid').focus()
            "
            @keyup.esc="newDeviceMac = ''"
          >
          <input 
            v-if="newDeviceMac"
            v-model="newDeviceName"
            placeholder="Device Name"
            required
          >
          <div v-else load-blueretro>
            <button type="button" @click="selectDevice">
              <!-- <img src="/images/Bluetooth.svg" alt="Bluetooth Icon" class="bluetooth" /> -->
              <img src="/images/BRE_Logo_Color.png" alt="BlueRetro Logo" class="blueretro" />
            </button>
          </div>
        </div>
        <div label>
          New Device
        </div>
      </div>
      <button type="submit">
        Add Device
      </button>
    </form>
    <ul devices-list>
      <li v-for="device in devices" :key="device.id" device-item>
        {{ device.name }} <code>{{ device.mac }}</code>
      </li>
    </ul>
  </div>
</template>

<style lang="sass" scoped>

[input-group]
  display: flex
  flex-direction: column
  position: relative
  margin-bottom: 16px
  background: white
  border: 1px solid light-dark(#444, #ccc)
  border-radius: 4px

  [inputs]
    display: flex

  input
    flex: 1 1 auto
    appearance: none
    border: none
    outline: none
    padding: 24px 12px 4px
    font-size: 1rem
    background: transparent
    color: black
    height: 48px

  [label]
    position: absolute
    top: 4px
    left: 0
    font-size: 14px
    color: #333
    padding: 0 12px
    font-size: 75%

  &:focus-within
    border-color: royalblue
    box-shadow: 0 0 0 2px light-dark(rgba(65, 105, 225, 0.2), rgba(65, 105, 225, 0.4))

    [label]
      color: royalblue
      font-weight: bold

[load-blueretro]
  padding: 6px

  button
    display: flex
    align-items: center
    gap: 12px
    padding: 4px 12px
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
      height: 24px

    .blueretro
      height: 28px
</style>