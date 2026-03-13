
<script setup>
import { computed, ref, watch } from 'vue'

import { BlueretroService } from '../services/blueretro.service'
import { blueretroDBService } from '../services/blueretroDB.service'

const devices = ref([])
const newDeviceId = ref('')
const newDeviceMac = ref('')
const newDeviceName = ref('')

const RE_MAC = /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i

const model = defineModel({
  type: Object,
  default: null,
})

const newMacIsValid = computed(() => RE_MAC.test(newDeviceMac.value))
const newMacNotSaved = computed(() => newMacIsValid.value && !devices.value.some(device => device.mac === newDeviceMac.value))

watch(model, (newModel) => {
  newDeviceId.value = newModel?.id || ''
  newDeviceMac.value = newModel?.mac || ''
  newDeviceName.value = newModel?.name || ''
})

watch(newDeviceMac, (newMac) => {
  if (RE_MAC.test(newMac)) return

  newDeviceId.value = ''
  newDeviceName.value = ''
})

blueretroDBService.onUpdateList((updatedDevices) => {
  devices.value = updatedDevices.slice().reverse()
})

const readBlueretroDevice = async () => {
  const device = await BlueretroService.requestBlueretroDevice()

  const mac = await BlueretroService.getMAC(device)

  const deviceModel = {
    id: device.id,
    name: device.name,
    mac,
  }

  await blueretroDBService.addDevice(deviceModel)

  console.log('Selected BlueRetro device:', deviceModel)

  model.value = deviceModel
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
    id: newDeviceId.value,
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
              $event.target.form.querySelector(':invalid')?.focus()
            "
            @keyup.esc="newDeviceMac = ''"
          >
          <input 
            v-if="newMacIsValid"
            v-model="newDeviceName"
            placeholder="Device Name"
            minlength="3"
            required
          >
          <div v-if="newDeviceId" blueretro-icon>
            <img src="/images/blueretro-icon.png" alt="BlueRetro Logo" class="blueretro" />
          </div>
          <div v-if="!newMacIsValid" load-blueretro>
            <button type="button" @click="readBlueretroDevice()">
              <!-- <img src="/images/Bluetooth.svg" alt="Bluetooth Icon" class="bluetooth" /> -->
              <img src="/images/BRE_Logo_Color.png" alt="BlueRetro Logo" class="blueretro" />
            </button>
          </div>
        </div>
        <div label>
          New Device
        </div>
      </div>
      <div v-if="newMacIsValid && newDeviceName?.length < 3" new-target-action label>
        Please enter a name for the device (at least 3 characters)
      </div>
      <div v-show="newMacNotSaved && newDeviceName?.length >= 3" new-target-action add-button>
        <button type="submit">
          Add Device
        </button>
      </div>
    </form>
    <ul devices-list>
      <li
        v-for="device in devices" :key="device.mac"
        device-item :class="{ selected: model?.mac === device.mac }"
        @click="model = device"
      >
        <div device-info>
          <code>{{ device.mac }}</code> {{ device.name }}
        </div>
        <button type="button" remove-btn @click.stop="blueretroDBService.removeDeviceByMAC(device.mac)">
          <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 256 256">
            <path d="M78.052 14.538H11.948a2 2 0 0 1 0-4h66.104a2 2 0 0 1 0 4" style="fill:currentColor;fill-rule:nonzero" transform="translate(1.407 1.407)scale(2.81)"/>
            <path d="M57.711 14.538H32.289a2 2 0 0 1-2-2V7.36c0-4.059 3.302-7.36 7.36-7.36h14.703c4.058 0 7.359 3.302 7.359 7.36v5.178a2 2 0 0 1-2 2m-23.422-4h21.422V7.36A3.363 3.363 0 0 0 52.352 4H37.649a3.363 3.363 0 0 0-3.36 3.36z" style="fill:currentColor;fill-rule:nonzero" transform="translate(1.407 1.407)scale(2.81)"/>
            <path d="M208.703 55.892a5.62 5.62 0 0 0-4.088-1.764H51.101a5.62 5.62 0 0 0-5.611 5.949l10.22 174.554c.646 11.032 9.81 19.676 20.864 19.676h102.562c11.055 0 20.218-8.644 20.87-19.679l10.22-174.554a5.64 5.64 0 0 0-1.523-4.182m-80.846 159.364a5.62 5.62 0 0 1-5.62-5.62V99.726a5.621 5.621 0 0 1 11.24 0v109.91a5.62 5.62 0 0 1-5.62 5.62m-34.681 0a5.62 5.62 0 0 1-5.606-5.291l-6.435-109.911a5.62 5.62 0 0 1 5.283-5.937c3.057-.174 5.757 2.183 5.937 5.283l6.435 109.907a5.62 5.62 0 0 1-5.614 5.949m69.362 0q-.165 0-.335-.011a5.617 5.617 0 0 1-5.28-5.938L163.358 99.4c.177-3.1 2.79-5.485 5.938-5.283a5.62 5.62 0 0 1 5.282 5.937l-6.437 109.911a5.62 5.62 0 0 1-5.603 5.291" style="fill:currentColor;fill-rule:nonzero"/>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="sass" scoped>

[input-group]
  display: flex
  flex-direction: column
  position: relative
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

[new-target-action]
  display: flex
  justify-content: center
  align-items: center

  height: 3rem
  padding: 0 .75rem
  font-size: .875rem
  color: white

  &[label]
    color: #c2c1c1

  &[add-button] button
    appearance: none
    border: none
    border-radius: 4px
    padding: 6px 12px
    color: white
    cursor: pointer

    &:hover
      background: color-mix(in srgb, royalblue 96%, white)

    &, &:active
      background: royalblue

[blueretro-icon]
  display: flex
  align-items: center
  padding: 6px

  img
    height: 28px

[devices-list]
  list-style: none
  padding: 0
  margin: 1rem 0 0 0

  [device-item]
    display: flex
    justify-content: space-between
    align-items: center
    cursor: pointer
    border-left: .25rem solid transparent

    &.selected
      border-color: royalblue
      background: rgba(white, 0.05)

    & + [device-item]
      border-top: 1px solid #777

    &:hover
      background: rgba(white, 0.1)
  
  [device-info]
    padding: .5rem

  [remove-btn]
    flex: 0 0 auto
    display: flex
    align-items: center
    justify-content: center
    height: 2.5rem
    width: 2.5rem
    border: none
    background: transparent
    cursor: pointer

    color: color-mix(in srgb, firebrick 30%, light-dark(white, grey))

    &:hover
      color: firebrick
      background: rgba(white, 0.4)

    &:active
      background: transparent

    svg
      height: 16px
      width: 16px

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