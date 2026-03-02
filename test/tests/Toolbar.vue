<template>
<trading-vue :data="chart" :width="this.width" :height="this.height"
        ref="tvjs"
        title-txt="The King"
        :toolbar="true"
        :color-back="colors.colorBack"
        :color-grid="colors.colorGrid"
        :color-text="colors.colorText">
</trading-vue>
</template>

<script>
import emitter from '@helpers/eventbus.js'
import TradingVue from '../../src/TradingVue.vue'
import Data from '../data/data_tools.json'
// import Utils from '../../src/stuff/utils.js'
import DataCube from '../../src/helpers/datacube.js'

const n =  'Toolbar';
const i = '🔪';
const d = 'Test : Datacube bundled with "tools" in data_tools.json';

export default {
    name: n,
    icon: i,
    description: d,
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
        window.tv = this.$refs.tvjs
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
            chart: new DataCube(Data),
            width: window.innerWidth,
            height: window.innerHeight
        }
    }
}
</script>
