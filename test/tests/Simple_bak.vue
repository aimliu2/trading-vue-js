<template>
<trading-vue 
  :data="chart" 
  :toolbar="true"
  :color-back="colors.colorBack"
  :color-grid="colors.colorGrid"
  :color-text="colors.colorText"
  :width="winState.width" 
  :height="winState.height"
  />
</template>

<script>
// import Icon from './Datasets/ds.json'
import TradingVue from '../../src/TradingVue.vue'
// import Data from '../data/data_btc.json'

import dataCubic from '../../src/composables/datacube-composer.js'
import windowSize from '../../src/composables/winsize.js'
import { onMounted, onUnmounted } from 'vue';

// accessible by parent component
// defineExpose({
//   name,
//   description,
//   icon
// });

// import state variables, actions from composable
const {state:winState, onResize} = windowSize(); // @state {width:number, height:number}
const dataState = dataCubic(); //@state {path:string,isLoading:boolean,chart:Datacube Object}

// constant variable
const adjustHeight = -50;

// composiiton API : life-cycle hook
// mutated state on DOM, App.vue component
onMounted(() => {
  // init state - called onResize
  onResize();
  window.addEventListener('resize', () => onResize(0,adjustHeight))
  // window.dc = this.chart // set object for Debugging
})
onUnmounted(() => {
  window.removeEventListener('resize',  () => onResize(0,adjustHeight))
})

export default {
    name: 'Simple',
    description: 'Simple rendering chart data with btc data, light theme',
    props: ['night'],
    components: {
        TradingVue
    },
    methods: {
        onResize(event) {
            this.width = window.innerWidth
            this.height = window.innerHeight - 50
        }
    },
    computed: {
        colors() {
            return this.$props.night ? {} : {
                colorBack: '#fff',
                colorGrid: '#eee',
                colorText: '#333'
            }
        },
    },
    data() {
        return {
            chart: new DataCube(Data),
            width: window.innerWidth,
            height: window.innerHeight
        }
    }
}
</script>

<style>

</style>
