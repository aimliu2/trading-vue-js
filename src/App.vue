<template>
<trading-vue 
    :data="chart" 
    :width="width" 
    :height="height"
    :color-back="colors.colorBack"
    :color-grid="colors.colorGrid"
    :color-text="colors.colorText"
    />
</template>

<script setup>
import TradingVue from './TradingVue.vue'
import Data from '../data/data.json'
import DataCube from '../src/helpers/datacube.js'
import { ref, onMounted, onUnmounted } from 'vue'

// composition api : props down events up
// mutable state accessing .value
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)
const chart = ref(new DataCube(Data)) // case 1 data from json file
const colors = ref({
    colorBack: '#fff',
    colorGrid: '#eee',
    colorText: '#333',
})

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
