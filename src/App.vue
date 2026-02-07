<template>
<trading-vue 
    :data="chart" 
    :width="width" 
    :height="height"
    />
</template>

<script setup>
import TradingVue from './TradingVue.vue'
import Data from '../data/data.json'
import DataCube from '../src/helpers/datacube.js'
import { ref, onMounted, onUnmounted } from 'vue'

// composition api : props down events up
// data and states used in template
const width = ref(window.innerWidth) // pass to TradingVue component
const height = ref(window.innerHeight) // pass to TradingVue component
const chart = ref(new DataCube(Data)) // pass to TradingVue component

// composition api : life-cycle hooks
// resize event listener, fire from client browser
onMounted(() => 
    window.addEventListener('resize', () => onResize())
)
onUnmounted(() => 
    window.removeEventListener('resize',  () => onResize())
)

// helper funtion methods
const onResize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
}

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
