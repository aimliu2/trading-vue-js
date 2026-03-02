<template>
<trading-vue 
    ref="tvjs"
    :data="chart" 
    :toolbar="true"
    :width="width" 
    :height="height"
    :key="stateKey"
    />
</template>

<script setup>
import TradingVue from './TradingVue.vue'

import UseCleanup from '@composables/cUseCleanup.js'
import {debounce} from '@stuff/utilities.js'

import {ref, onMounted} from 'vue';
import DataCube from '@helpers/datacube.js'
import Data from '@data/dummy-data.json'

/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
/* ----------------------------- state-variables ---------------------------- */
const tvjs = ref();
const chart = ref(new DataCube(Data)) // should be markRaw
const width = ref(800)
const height = ref(600)
const aw = ref(0)
const ah = ref(0)
const stateKey = ref(0) // state key
const { addCleanup } = UseCleanup()
/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const onResize = (aw=0,ah=0) =>{
  width.value = window.innerWidth+aw;
  height.value = window.innerHeight+ah;
  // trigger re-render by update state key
  stateKey.value += 1
}
const debouncedOnResize = debounce(onResize,100);

/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(() => {
  window.tv = tvjs
  window.dc = chart.value
  onResize() // init
  // store reference so the same fn can be passed to both add and removeEventListener
  const resizeHandler = () => debouncedOnResize(0, 0)
  window.addEventListener('resize', resizeHandler)

  // clean up on unmount — wrap in arrow fn so addCleanup receives a function, not undefined
  addCleanup(() => window.removeEventListener('resize', resizeHandler))
})

</script>

<style>
html,
body {
    background-color: #000;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>
