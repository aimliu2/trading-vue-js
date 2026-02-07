
<template>
    <!-- Main component  -->
    <div 
        v-bind:id="id"
        class="trading-vue" 
        :style="{
            color: this.chart_props.colors.text,
            font: this.font_comp,
            width: this.width+'px',
            height: this.height+'px'}"
        @mousedown="mousedown" 
        @mouseleave="mouseleave"
        >
        <toolbar v-if="toolbar"
            ref="toolbar"
            v-on:custom-event="custom_event"
            v-bind="chart_props"
            v-bind:config="chart_config">
        </toolbar>
        <widgets v-if="controllers.length"
            ref="widgets"
            :map="ws" :width="width" :height="height"
            :tv="this" :dc="data">
        </widgets>
        <chart :key="reset"
            ref="chart"
            v-bind="chart_props"
            v-bind:tv_id="id"
            v-bind:config="chart_config"
            v-on:custom-event="custom_event"
            v-on:range-changed="range_changed"
            v-on:legend-button-click="legend_button">
        </chart>
        <transition name="tvjs-drift">
            <the-tip 
            v-if="tip"
            :data="tip" 
            @remove-me="tip.value = null"
            />
        </transition>
    </div>
</template>

<script setup lang="ts">

import Const from './stuff/constants.js'
import Chart from './components/Chart.vue'
import Toolbar from './components/Toolbar.vue'
import Widgets from './components/Widgets.vue'
import TheTip from './components/TheTip.vue'
import XControl from './mixins/xcontrol.js'

import { withDefaults, defineProps, computed } from 'vue';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface Props {
  titleTxt?: string;
  id?: string;
  skin?: string;
  width?: number;
  height?: number;
  timezone?: number;
  colorTitle?: string;
  colorBack?: string;
  colorGrid?: string;
  colorText?: string;
  colorTextHL?: string;
  colorScale?: string;
  colorCross?: string;
  colorCandleUp?: string;
  colorCandleDw?: string;
  colorWickUp?: string;
  colorWickDw?: string;
  colorWickSm?: string;
  colorVolUp?: string;
  colorVolDw?: string;
  colorPanel?: string;
  colorTbBack?: string;
  colorTbBorder?: string;
  font?: string;
  toolbar?: boolean;
  indexBased?: boolean;
  overlays?: Array<any>;
  legendButtons?: Array<any>;
  extensions?: Array<any>;
  chartConfig?: Object;
  xSettings?: Object;
  colors?: Object;
  data: Object; // required prop
}

// composition api : may receive props from App.vue
// define props here
const props = withDefaults(defineProps<Props>(), {
  titleTxt: 'TradingVue.js',
  id: 'trading-vue-js',
  skin: '',
  width: 800,
  height: 421,
  timezone: 0,
  colorTitle: '#42b883',
  colorBack: '#121826',
  colorGrid: '#2f3240',
  colorText: '#dedddd',
  colorTextHL: '#fff',
  colorScale: '#838383',
  colorCross: '#8091a0',
  colorCandleUp: '#23a776',
  colorCandleDw: '#e54150',
  colorWickUp: '#23a77688',
  colorWickDw: '#e5415088',
  colorWickSm: 'transparent', // deprecated
  colorVolUp: '#79999e42',
  colorVolDw: '#ef535042',
  colorPanel: '#565c68',
  colorTbBack: '#1e2233',
  colorTbBorder: '#8282827d',
  font: Const.ChartConfig.FONT,
  toolbar: true,
  indexBased: false,
  overlays: () =>[],
  legendButtons: () => [],
  extensions: () => [],
  chartConfig: () => {}, // Overwrites ChartConfig values, see constants.js
  xSettings: () => {},
  colors: () => {}
  // data is a required prop
});

// composition api : computed properties
const chart_props = computed(() => {
    let offset = props.toolbar ? chart_config.value.TOOLBAR : 0
    let chart_props = {
        title_txt: props.titleTxt,
        overlays: props.overlays.concat(mod_ovs.value),
        data: decubed.value,
        width: props.width - offset,
        height: props.height,
        font: font_comp.value,
        buttons: props.legendButtons,
        toolbar: props.toolbar,
        ib: props.indexBased || index_based.value || false,
        colors: Object.assign({}, props.colors ||
            colorpack.value),
        skin: skin_proto.value,
        timezone: props.timezone
    }

    parse_colors(chart_props.colors)
    return chart_props
});




// composition api : life-cycle hooks
// resize event listener, fire from client browser


// helper funtion methods
// TODO: reset extensions?

// props from App.vue


export default {
    name: 'TradingVue',
    components: {
        Chart, Toolbar, Widgets, TheTip
    },
    mixins: [ XControl ],
    computed: {
        // Copy a subset of TradingVue props
        chart_props() {
            let offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0
            let chart_props = {
                title_txt: this.$props.titleTxt,
                overlays: this.$props.overlays.concat(this.mod_ovs),
                data: this.decubed,
                width: this.$props.width - offset,
                height: this.$props.height,
                font: this.font_comp,
                buttons: this.$props.legendButtons,
                toolbar: this.$props.toolbar,
                ib: this.$props.indexBased || this.index_based || false,
                colors: Object.assign({}, this.$props.colors ||
                    this.colorpack),
                skin: this.skin_proto,
                timezone: this.$props.timezone
            }

            this.parse_colors(chart_props.colors)
            return chart_props
        },
        chart_config() {
            return Object.assign({},
                Const.ChartConfig,
                this.$props.chartConfig,
            )
        },
        decubed() {
            let data = this.$props.data
            if (data.data !== undefined) {
                // DataCube detected
                data.init_tvjs(this)
                return data.data
            } else {
                return data
            }
        },
        index_based() {
            const base = this.$props.data
            if (base.chart) {
                return base.chart.indexBased
            }
            else if (base.data) {
                return base.data.chart.indexBased
            }
            return false
        },
        mod_ovs() {
            let arr = []
            for (var x of this.$props.extensions) {
                arr.push(...Object.values(x.overlays))
            }
            return arr
        },
        font_comp() {
            return this.skin_proto && this.skin_proto.font ?
                this.skin_proto.font : this.font
        }
    },
    beforeDestroy() {
        this.custom_event({ event: 'before-destroy' })
        this.ctrl_destroy()
    },
    methods: {
        // TODO: reset extensions?
        resetChart(resetRange = true) {
            this.reset++
            let range = this.getRange()
            if (!resetRange && range[0] && range[1]) {
                this.$nextTick(() => this.setRange(...range))
            }
            this.$nextTick(() => this.custom_event({
                event: 'chart-reset', args: []
            }))
        },
        goto(t) {
            // TODO: limit goto & setRange (out of data error)
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                t = ti_map.gt2i(t, this.$refs.chart.ohlcv)
            }
            this.$refs.chart.goto(t)
        },
        setRange(t1, t2) {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                const ohlcv = this.$refs.chart.ohlcv
                t1 = ti_map.gt2i(t1, ohlcv)
                t2 = ti_map.gt2i(t2, ohlcv)
            }
            this.$refs.chart.setRange(t1, t2)
        },
        getRange() {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                // Time range => index range
                return this.$refs.chart.range
                    .map(x => ti_map.i2t(x))
            }
            return this.$refs.chart.range
        },
        getCursor() {

            let cursor = this.$refs.chart.cursor
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                let copy = Object.assign({}, cursor)
                copy.i = copy.t
                copy.t = ti_map.i2t(copy.t)
                return copy
            }
            return cursor
        },
        showTheTip(text, color = "orange") {
            this.tip = { text, color }
        },
        legend_button(event) {
            this.custom_event({
                event: 'legend-button-click', args: [event]
            })
        },
        custom_event(d) {
            if ('args' in d) {
                this.$emit(d.event, ...d.args)
            } else {
                this.$emit(d.event)
            }
            let data = this.$props.data
            let ctrl = this.controllers.length !== 0
            if (ctrl) this.pre_dc(d)
            if (data.tv) {
                // If the data object is DataCube
                data.on_custom_event(d.event, d.args)
            }
            if (ctrl) this.post_dc(d)
        },
        range_changed(r) {
            if (this.chart_props.ib) {
                const ti_map = this.$refs.chart.ti_map
                r = r.map(x => ti_map.i2t(x))
            }
            this.$emit('range-changed', r)
            this.custom_event(
                {event: 'range-changed', args: [r]}
            )
            if (this.onrange) this.onrange(r)
        },
        set_loader(dc) {
            this.onrange = r => {
                let pf = this.chart_props.ib ? '_ms' : ''
                let tf = this.$refs.chart['interval' + pf]
                dc.range_changed(r, tf)
            }
        },
        parse_colors(colors) {
            for (var k in this.$props) {
                if (k.indexOf('color') === 0 && k !== 'colors') {
                    let k2 = k.replace('color', '')
                    k2 = k2[0].toLowerCase() + k2.slice(1)
                    if (colors[k2]) continue
                    colors[k2] = this.$props[k]
                }
            }
        },
        mousedown() {
            this.$refs.chart.activated = true
        },
        mouseleave() {
            this.$refs.chart.activated = false
        }
    },
    data() {
        return { reset:0, tip:null }
    }
}
</script>
<style>
/* Anit-boostrap tactix */
.trading-vue *, ::after, ::before {
    box-sizing: content-box;
}
.trading-vue img {
    vertical-align: initial;
}
</style>
