<script setup>
import SixaxisPairingWidget from './components/SixaxisPairingWidget.vue'
</script>

<template>
  <main>
    <div container>
      <div logo></div>
      <SixaxisPairingWidget />
    </div>
  </main>
</template>

<style lang="sass" scoped>
main

  [container]
    max-width: 540px
    margin: 0 auto
    padding: 4vw 20px
  // display: flex
  // justify-content: center
  // align-items: flex-start
  // padding-top: 30vh
  // min-height: 100vh
  // min-height: 100dvh

  // background-repeat: no-repeat
  // background-position: center 5vh
  // background-size: 240px, 10%

  [logo]
    // width: 240px
    // height: 120px
    aspect-ratio: 2 / 1
    margin: 0 auto 40px auto
    background-repeat: no-repeat
    background-position: center
    background-size: contain

    background-image: url('/images/ps-controller-dark.svg')
    @media (prefers-color-scheme: dark)
      background-image: url('/images/ps-controller-light.svg')

  // background-image: url('/images/ps-controller-dark.svg')
  // @media (prefers-color-scheme: dark)
  //   background-image: url('/images/ps-controller-light.svg')
</style>
