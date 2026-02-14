<template>
<trading-vue :data="chart" :width="this.width" :height="this.height"
        :chart-config="{DEFAULT_LEN: 120}" ref="tv"
        :overlays="overlays"
        :toolbar="true"
        :color-back="colors.colorBack"
        :color-grid="colors.colorGrid"
        :color-text="colors.colorText">
</trading-vue>
</template>

<script>
import emitter from '@helpers/eventbus.js'
import TradingVue from '../../src/TradingVue.vue'
import DataCube from '../../src/helpers/datacube.js'
import Data from '../data/data_ux.json'
import SplineUx from './Interfaces/SplineUx.vue'

const n =  'Interfaces';
const d = 'Html interfaces: static & interactive';
const i = '';
const e = true;

export default {
    name: n,
    description: d,
    early: e,
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
    mounted() {
        window.addEventListener('resize', this.onResize)
        this.onResize()
        window.dc = this.chart
        window.tv = this.$refs.tv
         emitter.emit('testcase-mount', this.emitMsg); // once
    },
    computed: {
        colors() {
            return this.$props.night ? {} : {
                colorBack: '#fff',
                colorGrid: '#eee',
                colorText: '#333'
            }
        },
        emitMsg() {
            return {
                name : n,
                description :d,
                icon : i,
                early: false
            }
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
    },
    data() {
        return {
            chart: new DataCube(Data), // Data will be here,
            width: window.innerWidth,
            height: window.innerHeight,
            overlays: [SplineUx]
        }
    }
}
</script>

<style>

</style>
