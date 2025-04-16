<script setup>
import SixaxisPairingWidget from './components/SixaxisPairingWidget.vue'
</script>

<template>
  <main>
    <SixaxisPairingWidget />
  </main>
</template>

<style lang="sass" scoped>
main
  background-repeat: no-repeat
  background-position: center 5vh
  background-size: auto 20vh

  background-image: url('./images/ps-controller-dark.svg')
  @media (prefers-color-scheme: dark)
    background-image: url('./images/ps-controller-light.svg')
  
  display: flex
  justify-content: center
  align-items: flex-start
  padding-top: 30vh
  min-height: 100vh
  min-height: 100dvh
</style>
