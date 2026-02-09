<template>
<div>
<!-- loading message -->
<div v-if="dataState.isLoading">
  Loading Data... 
</div>
<trading-vue 
    v-else-if="!dataState.isLoading"
    :data="dataState.chart" 
    :width="winState.width" 
    :height="winState.height"
    />
</div>
</template>

<script setup>
import TradingVue from './TradingVue.vue'
// composable, got state var and action
import WindowSize from './composables/winsize.js' // return state {width:number, height:number} action onResize(ah, aw)
import DataCubic from './composables/datacube-composer.js' // return state {path:string,isLoading:boolean,chart:Datacube Object}
import {onMounted, onUnmounted } from 'vue';

// import state variables, actions from composable
const {state:winState, onResize} = WindowSize(); // @state {width:number, height:number}
const {state:dataState} = DataCubic(); // get only state, @state {path:string,isLoading:boolean,chart:Datacube Object}

  // composition API : life-cycle hook
  onMounted(() => {
    // init state - called onResize with 0 adjustment
    onResize()
    window.addEventListener('resize', () => onResize())
  })
  onUnmounted(() => {
    window.removeEventListener('resize',  () => onResize())
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
