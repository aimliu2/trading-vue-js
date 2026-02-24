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

/**
 * @name state-var 
 */
const tvjs = ref();
const chart = ref(new DataCube(Data)) // should be markRaw
const width = ref(800)
const height = ref(600)
const aw = ref(0)
const ah = ref(0)
const stateKey = ref(0) // state key

/**
 * @name methods
 * @function onResize
 * @param aw - adjust width
 * @param ah - adjust height
 * @return {void} - adjust state var
 */
const onResize = (aw=0,ah=0) =>{
  width.value = window.innerWidth+aw;
  height.value = window.innerHeight+ah;
  // trigger re-render by update state key
  stateKey.value += 1
}

// onResize with debounce, to prevent too many resize events
// onResize does not have 'this' constructor.
const debouncedOnResize = debounce(onResize,100);

/**
 * @name internal-constant
 */
const { addCleanup } = UseCleanup()

/**
 * @name life-cycle hook
 */
onMounted(() => {
  window.tv = tvjs
  window.dc = chart.value
  onResize() // init
  window.addEventListener('resize', () => debouncedOnResize(0, 0))

  // clean up on unmount
  addCleanup(window.removeEventListener('resize', () => debouncedOnResize(0, 0)))
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
