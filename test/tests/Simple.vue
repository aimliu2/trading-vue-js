<template>
<trading-vue 
  v-bind="currentTheme"
  :data="dataState.chart" 
  :toolbar="true"
  :width="winState.width" 
  :height="winState.height"
  />
</template>

<script setup>
// import Icon from './Datasets/ds.json'
import TradingVue from '../../src/TradingVue.vue'

import emitter from '../../src/helpers/eventbus.js'
import DataCubic from '../../src/composables/datacube-composer.js'
import WindowSize from '../../src/composables/winsize.js'
import { reactive, computed, onMounted, onUnmounted , defineProps} from 'vue';

// props down from parent
const props = defineProps({
  night: Boolean, // use in computed
})

// internal constant
// emit some constant back up to parent
const emitMsg = {
  name : 'Simple',
  description :'Simple rendering chart data with BTCUSD, light theme',
  icon : ''
}
const TESTPATH = './dummy-data.json'

// import state variables, actions from composable
const {state:winState, onResize} = WindowSize(); // @state {width:number, height:number}
const {state:dataState, buildDataCube} = DataCubic(); //@state {path:string,isLoading:boolean,chart:Datacube Object}

// constant variable
// add adjustment since top bar cause bottom bar disappear
const adjust = -50;

// night theme was defined by default
const dayTheme = reactive({
    colorBack: '#fff',
    colorGrid: '#eee',
    colorText: '#333'
})

// composiiton API : computed
const currentTheme = computed(() => {
    return props.night ? {} : dayTheme
})

// composiiton API : life-cycle hook
// mutated state on DOM, App.vue component
onMounted(() => {
  // init state
  onResize(0, adjust);
  buildDataCube(TESTPATH);
  // get btc data instead of dummy data
  // emitter evt if any
  emitter.emit('testcase-mount', emitMsg); // once
  window.addEventListener('resize', () => onResize(0, adjust))
})

onUnmounted(() => {
  window.removeEventListener('resize',  () => onResize(0, adjust))
})

</script>
