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
// composable, got only state var
import windowSize from './composables/winsize.js' // return state {width:number, height:number}
import dataCubic from './composables/datacube-composer.js' // return state {path:string,isLoading:boolean,chart:Datacube Object}

// import state variable from composable
const winState = windowSize();
const dataState = dataCubic();

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
