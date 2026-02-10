<template>
<trading-vue 
  v-bind="currentTheme"
  ref="tvjs"
  :toolbar="true"
  :data="builtDataCube" 
  :width="winState.width" 
  :height="winState.height"
  />
</template>

<script setup>
// error tool bar icons disappear
// import Icon from './Datasets/ds.json'
import TradingVue from '../../src/TradingVue.vue'

import emitter from '../../src/helpers/eventbus.js'
import DataCubic from '../../src/composables/datacube-composer.js'
import WindowSize from '../../src/composables/winsize.js'
import { ref,reactive, computed, onMounted, onUnmounted , defineProps} from 'vue';

// props down from parent
const props = defineProps({
  night: Boolean, // use in computed
})

// constant variable
// add adjustment since top bar cause bottom bar disappear
const adjust = -50;
const TESTPATH = '/BTCUSD.json';

// internal constant
// emit some constant back up to parent
const emitMsg = {
  name : 'Simple',
  description :'Simple rendering chart data with BTCUSD, light theme',
  icon : '',
  early:false
}

// import state variables, actions from composable
// @state {width:number, height:number} @action onResize
const {state:winState, onResize} = WindowSize(); 
// @state {path:string,isLoading:boolean,chart:Datacube Object} @computed builtDataCube
const {state:dataState, builtDataCube} = DataCubic();

const tvjs = ref(null);

// night theme was defined by default
const dayTheme = reactive({
  // light theme
  colorBack: '#fff',
  colorGrid: '#eee',
  colorText: '#333'
})

// composition API : computed
const currentTheme = computed(() => {
    return props.night ? {} : dayTheme
})

// composiiton API : life-cycle hook
// mutated state on DOM, App.vue component
onMounted(async () => {
  // init state
  onResize(0, adjust);
  // emitter evt if any
  emitter.emit('testcase-mount', emitMsg); // once
  window.addEventListener('resize', () => onResize(0, adjust))
})

onUnmounted(() => {
  window.removeEventListener('resize',  () => onResize(0, adjust))
})

</script>
