<template>
<div>
<!-- loading message -->
<div v-if="dataState.isLoading">
  Loading Data... 
</div>
<trading-vue 
    v-else-if="!dataState.isLoading"
    :data="builtDataCube" 
    :toolbar="true"
    :width="winState.width" 
    :height="winState.height"
    />
</div>
</template>

<script setup>
import TradingVue from './TradingVue.vue'
// composable, got state var and action
import WindowSize from './composables/winsize.js' 
import DataCubic from './composables/datacube-composer.js' 
import {onMounted, onUnmounted } from 'vue';

// import state variables, actions from composable
// @state {width:number, height:number} @action onResize
const {state:winState, onResize} = WindowSize(); 
// @state {path:string,isLoading:boolean,json:json} @computed async buildDataCube
const {state:dataState, builtDataCube} = DataCubic(); 

  // composition API : life-cycle hook
  onMounted(async () => {
    // init state
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
