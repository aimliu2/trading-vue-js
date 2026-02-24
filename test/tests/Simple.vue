<template>
<trading-vue 
  v-bind="currentTheme"
  ref="tvjs"
  :toolbar="true"
  :data="chart" 
  :width="winState.width" 
  :height="winState.height"
  />
</template>

<script setup>
// error tool bar icons disappear
// import Icon from './Datasets/ds.json'
import TradingVue from '@src/TradingVue.vue'

import emitter from '@helpers/eventbus.js'
// import DataCubic from '@composables/datacube-composer.js'
import WindowSize from '@composables/winsize.js'
import { ref, reactive, computed, onBeforeMount, onMounted, onUnmounted} from 'vue';
import DataCube from '@helpers/datacube.js'
import Data from '@data/test-case1-overlay.json'

// props down from parent
const props = defineProps({
  night: Boolean, // use in computed
})

// constant variable
// add adjustment since top bar cause bottom bar disappear
const adjust = -50;
const TESTPATH = '/test-case1-overlay.json';

// internal constant
// emit some constant back up to parent
const emitMsg = {
  name : 'Overlay',
  description :'Test Overlay, indicator KC, Segment, Splitters\n off chart indicator DI + Splines 30/70, light theme',
  icon : '',
  early:false
}

// import state variables, actions from composable
// @state {width:number, height:number} @action onResize
const {state:winState, onResize} = WindowSize(); 
// @state {path:string,isLoading:boolean,chart:Datacube Object} @computed builtDataCube
// const {state:dataState, builtDataCube} = DataCubic();

const tvjs = ref();
const chart = ref(new DataCube(Data))

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
// onBeforeMount(() => {
//   // update state
//   dataState.path = TESTPATH
// }),
onMounted(async () => {
  // init state
  onResize(0, adjust);
  // emitter, dynamic components
  window.dc = chart.value
  window.tv = tvjs
  emitter.emit('testcase-mount', emitMsg); // once
  window.addEventListener('resize', () => onResize(0, adjust))
}),
onUnmounted(() => {
  window.removeEventListener('resize',  () => onResize(0, adjust))
})

</script>
