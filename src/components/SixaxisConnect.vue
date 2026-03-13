
<script setup>
import DS3 from './DS3.vue'

defineProps({
  isConnecting: {
    type: Boolean,
    default: false,
  },
  currentDevice: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div sixaxis-connect>
    <DS3 :is-connected="Boolean(currentDevice)" />
    <div actions>
      <div v-if="isConnecting" connecting-state>
        Connecting...
      </div>
      <div v-else-if="currentDevice" current-device>
        <div product-name>{{ currentDevice.name }}</div>
        <div self-mac-address><code>{{ currentDevice.macAddress }}</code></div>
        <div connected-data>
          <button type="button" refresh-button @click="$emit('refresh')">
            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 65 65">
              <g fill="currentColor">
                <path d="M32.5 4.999a27.3 27.3 0 0 0-14.699 4.282l-5.75-5.75v16.11h16.11l-6.395-6.395a21.83 21.83 0 0 1 10.734-2.82c12.171 0 22.073 9.902 22.073 22.074 0 2.899-.577 5.664-1.599 8.202l4.738 2.762A27.3 27.3 0 0 0 60 32.5C60 17.336 47.663 4.999 32.5 4.999M43.227 51.746c-3.179 1.786-6.826 2.827-10.726 2.827-12.171 0-22.073-9.902-22.073-22.073 0-2.739.524-5.35 1.439-7.771l-4.731-2.851A27.3 27.3 0 0 0 5 32.5C5 47.664 17.336 60 32.5 60c5.406 0 10.434-1.584 14.691-4.289l5.758 5.759V45.358H36.838z"/>
              </g>
            </svg>
          </button>
          <div paired-mac-address><code>{{ currentDevice.pairedMacAddress }}</code></div>
          <button type="button" disconnect-button @click="$emit('disconnect')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28">
              <path fill="currentColor" d="M22.74 6.327a5.5 5.5 0 0 1-.495 7.212l-1.944 1.944a.75.75 0 0 1-1.06 0l-6.718-6.717a.75.75 0 0 1 0-1.06l1.944-1.945a5.5 5.5 0 0 1 7.212-.495l3.045-3.044a.75.75 0 0 1 1.06 1.06zM12.778 12.276a.75.75 0 0 0-1.06-1.061L9.59 13.341l-.822-.822a.75.75 0 0 0-1.061 0l-1.945 1.944a5.5 5.5 0 0 0-.494 7.212L2.224 24.72a.75.75 0 1 0 1.06 1.06l3.045-3.044a5.5 5.5 0 0 0 7.212-.494l1.945-1.945a.75.75 0 0 0 0-1.06l-.827-.828 2.125-2.125a.75.75 0 1 0-1.06-1.06l-2.126 2.125-2.947-2.947z"/>
            </svg>
          </button>
        </div>
      </div>
      <div v-else default-state>
        <button type="button" btn @click="$emit('connect')">
          Connect
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
[connecting-state], [default-state]
  text-align: center
  padding: 1rem
  color: light-dark(#c2c1c1, #333)

[current-device]
  display: flex
  flex-direction: column
  align-items: center
  gap: .25rem

  position: relative

  [refresh-button], [disconnect-button]
    // position: absolute
    // bottom: 0
    border: none
    background: transparent
    cursor: pointer
    padding: 0

    svg
      display: block
      width: 24px      

  [refresh-button]
    // left: -2.5rem

    &:hover svg
      color: royalblue

    & svg, &:active svg
      color: color-mix(in srgb, royalblue 60%, light-dark(white, black))

  [disconnect-button]
    // right: -2.5rem

    &:hover svg
      color: firebrick

    & svg, &:active svg
      color: color-mix(in srgb, firebrick 60%, light-dark(white, black))

[sixaxis-connect]
  display: flex
  flex-direction: column
  align-items: center
  gap: 20px
  position: relative

  svg
    width: 100%

  [actions]
    position: absolute
    bottom: 0
    width: 60%
    aspect-ratio: 4 / 1
    // background: red
    display: flex
    justify-content: center
    align-items: flex-end
    // flex-direction: column
    // justify-content: center
    // align-items: center
    line-height: 1

    & > *
      flex: 1 1 auto

    [product-name]
      color: var(--text-bold-color)

    [self-mac-address]
      text-align: center
      font-size: 0.9rem
      color: #777

    [connected-data]
      font-size: .9rem
      margin-top: .5rem
      width: 100%
      display: flex
      justify-content: space-between
      align-items: center
      gap: .25em
      background: light-dark(#eee, #222)
      padding: .5em 1em
      border-radius: 1em
      color: light-dark(black, white)

    [paired-mac-address]
      text-align: center
      color: light-dark(black, white)

    [btn]
      width: 100%
      height: 2.5rem
      border: none
      border-radius: 4px
      font-size: 16px
      cursor: pointer
      color: white

      &:hover
        background: color-mix(in srgb, royalblue 80%, black)

      &, &:active
        background: royalblue
        
</style>