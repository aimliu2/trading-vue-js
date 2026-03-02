
<template>
    <!-- Main component  -->
    <!-- export to build :) -->
    <div class="trading-vue" 
        v-bind:id="id"
        @mousedown="mousedown" 
        @mouseleave="mouseleave"
        :ref="mainCompRef"
        :style="{
        color: chart_props.colors.text,
        font: font_comp,
        width: props.width+'px',
        height: props.height+'px'}">
        <toolbar v-if="toolbar"
            ref="toolbar"
            v-on:custom-event="custom_event"
            v-bind="tool_props"
            v-bind:config="chart_config">
        </toolbar>
        <!-- TODO: what do we pass into :tv in widget ? -->
        <widgets v-if="controllers.length"
            ref="widgets"
            :map="ws" :width="width" :height="height"
            :tv="mainCompRef" :dc="data">
        </widgets>
        <chart :key="reset"
            ref="chartRef"
            v-bind="chart_props"
            v-bind:tv_id="id"
            v-bind:config="chart_config"
            v-on:custom-event="custom_event"
            v-on:range-changed="range_changed"
            v-on:legend-button-click="legend_button">
        </chart>
        
    </div>
</template>

<script setup>
/** TheTip.Vue
 * <transition name="tvjs-drift">
        <the-tip :data="tip" v-if="false" @remove-me="tip = null"/>
    </transition>
 */

import Const from './stuff/constants.js'
import Dataset from './helpers/dataset.js'

// self as component's Finale
import Chart from './components/Chart.vue' // next3
import Toolbar from '@components/Toolbar.vue' // V3s
import Widgets from '@components/Widgets.vue' // V3

// mixins
import XControl from './mixins/xcontrol.js'

import {ref, computed, onBeforeMount ,onMounted, nextTick, watch} from 'vue'
import UseCleanup from '@composables/cUseCleanup.js'
/* -------------------------------------------------------------------------- */
/*                                 constants                                  */
/* -------------------------------------------------------------------------- */
/* -------------------------------- state-var ------------------------------- */
const reset = ref(0);
const controllers = ref([]);
const tip = ref(''); // tip when open page
const onrange = ref(); // function set by set_loader()
/* ------------------------------ component ref ----------------------------- */
const chartRef = ref();
const mainCompRef = ref();
const { addCleanup } = UseCleanup()
/* ---------------------------------- props --------------------------------- */
// TO-DO : props drilling here, is there a better way ?
const props = defineProps({ 
        titleTxt: {type: String, default: 'TradingVue.js'},
        id: {type: String,default: 'trading-vue-js'},
        width: {type: Number,default: 800},
        height: {type: Number,default: 421},
        // colors section
        colorTitle: {type: String,default: '#42b883'},
        colorBack: {type: String,default: '#121826'},
        colorGrid: {type: String,default: '#2f3240'},
        colorText: {type: String,default: '#dedddd'},
        colorTextHL: {type: String,default: '#fff'},
        colorScale: {type: String,default: '#838383'},
        colorCross: {type: String,default: '#8091a0'},
        colorCandleUp: {type: String,default: '#23a776'},
        colorCandleDw: {type: String,default: '#e54150'},
        colorWickUp: {type: String,default: '#23a77688'},
        colorWickDw: {type: String,default: '#e5415088'},
        colorWickSm: {type: String,default: 'transparent' }, // deprecated
        colorVolUp: {type: String,default: '#79999e42'},
        colorVolDw: {type: String,default: '#ef535042'},
        colorPanel: {type: String,default: '#565c68'},
        colorTbBack: {type: String},
        colorTbBorder: {type: String,default: '#8282827d'},
        colors: {type: Object},
        font: {type: String,default: Const.ChartConfig.FONT},
        toolbar: {type: Boolean,default: false},
        data: {type: Object,required: true},
        // Overlay classes here
        overlays: {type: Array,default: function () { return [] }},
        // Overwrites ChartConfig values - see constants.js
        chartConfig: {type: Object,default: function () { return {} }},
        legendButtons: {type: Array,default: function () { return [] }},
        indexBased: {type: Boolean,default: false},
        extensions: {type: Array,default: function () { return [] }},
        xSettings: {type: Object,default: function () { return {} }},
        skin: {type: String }, // Skin Name
        timezone: {type: Number,default: 0}
    })

/* --------------------------------- emitter -------------------------------- */
const emit = defineEmits([
    'before-destroy',
    'chart-reset',
    'legend-button-click',
    'range-changed',
    'data-len-changed',
    'remove-layer-meta',
    'remove-shaders',
    'grid-mousedown',
    'register-tools', // tools
    'tool-selected', 
    'scroll-lock',
    'drawing-mode-off',
    'change-settings',
    'object-selected',
    'remove-tool'


])

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
// TODO: reset extensions?
const resetChart = (resetRange = true) => {
    reset.value++
    let range = getRange()
    if (!resetRange && range[0] && range[1]) {
        nextTick(() => setRange(...range))
    }
    nextTick(() => custom_event({event: 'chart-reset', args: []}))
}
const goto =(t) => {
    // TODO: limit goto & setRange to retrun within data range
    // (out of data error)
    if (chart_props.value.ib) {
        const ti_map = chartRef.value.ti_map
        t = ti_map.gt2i(t, chartRef.value.ohlcv)
    }
    chartRef.value.goto(t)
}

const setRange = (t1, t2) => {
    if (chart_props.value.ib) {
        const ti_map = chartRef.value.ti_map
        const ohlcv = chartRef.value.ohlcv
        t1 = ti_map.gt2i(t1, ohlcv)
        t2 = ti_map.gt2i(t2, ohlcv)
    }
    chartRef.value.setRange(t1, t2)
}

const getRange = () => {
    if (chart_props.value.ib) {
        const ti_map = chartRef.value.ti_map
        // Time range => index range
        return chartRef.value.range
            .map(x => ti_map.i2t(x))
    }
    return chartRef.value.range
}

const getCursor = () => {
    let cursor = chartRef.value.cursor
    if (chart_props.value.ib) {
        const ti_map = chartRef.value.ti_map
        let copy = Object.assign({}, cursor)
        copy.i = copy.t
        copy.t = ti_map.i2t(copy.t)
        return copy
    }
    return cursor
}

// show the tip on chart mounted
// TODO : if Tips was placed on mounted, it always re-mounted when chart resized, LOL
const showTheTip = (text, color = "orange") => tip.value = { text, color }
const legend_button = (event) => custom_event({event: 'legend-button-click', args: [event]})

// received all emits from descendents
const custom_event = (d) => { 
    if ('args' in d) {emit(d.event, ...d.args)} 
    else {emit(d.event)}
    let data = props.data
    // from mixin
    let ctrl = controllers.value.length !== 0
    // if (ctrl) this.pre_dc(d)
    if (data.tv) {
        // If the data object is DataCube
        // pass emit event into datacube (dc_event.js)
        data.on_custom_event(d.event, d.args)
    }
    // from mixin
    if (ctrl) post_dc(d)
}
const range_changed = (r) => {
            if (chart_props.value.ib) {
                const ti_map = chartRef.value.ti_map
                r = r.map(x => ti_map.i2t(x))
            }
            emit('range-changed', r)
            custom_event({event: 'range-changed', args: [r]})
            if (onrange.value) onrange.value(r) 
}

// TODO : Who invoke set_loader ?
const set_loader =(dc) =>{
            onrange.value = r => {
                let pf = chart_props.value.ib ? '_ms' : ''
                let tf = chartRef.value['interval' + pf]
                dc.range_changed(r, tf)
            }
}

const parse_colors = (colors) => {
            for (var k in props) {
                if (k.indexOf('color') === 0 && k !== 'colors') {
                    let k2 = k.replace('color', '')
                    k2 = k2[0].toLowerCase() + k2.slice(1)
                    if (colors[k2]) continue
                    colors[k2] = props[k]
                }
            }
}

const mousedown = () => chartRef.value.activated = true
const mouseleave = () => chartRef.value.activated = false

// TODO : all extension has Main() to initiate data
// also pass tv instance, data and settings as constructor
// do it later
// const ctrllist = () => {
//             ctrl_destroy()
//             controllers.value = []

//             for (let x of props.extensions) {
//                 let name = x.Main.__name__
//                 if (!props.xSettings[name]) {props.xSettings[name] = {}}
//                 let nc = new x.Main(
//                     mainCompRef.value,      // (this)tv instance ?
//                     props.data, // data, required
//                     props.xSettings[name] // settings
//                 )
//                 nc.name = name
//                 controllers.value.push(nc)
//             }
//             return controllers.value
// }
        
// TODO: preventDefault
const pre_dc = (e) => {
    for (var ctrl of controllers.value) {
        if (ctrl.update) {
            ctrl.update(e)
        }
    }
}
const post_dc = (e) => {
            for (var ctrl of controllers.value) {
                if (ctrl.post_update) {
                    ctrl.post_update(e)
                }
            }
        }

const ctrl_destroy = () => {
    for (var ctrl of controllers.value) {
        if (ctrl.destroy) ctrl.destroy()
    }
}
const skin_styles = () => {
            let id = 'tvjs-skin-styles'
            let stbr = document.getElementById(id)
            if (stbr) {
                let parent = stbr.parentNode
                parent.removeChild(stbr)
            }
            if (skin_proto.value && skin_proto.value.styles) {
                let sheet = document.createElement('style')
                sheet.setAttribute("id", id)
                sheet.innerHTML = skin_proto.value.styles
                // TODO use template ref or gracefully mount css later
                mainCompRef.value.appendChild(sheet)
            }
}

/* -------------------------------------------------------------------------- */
/*                                  computed                                  */
/* -------------------------------------------------------------------------- */
const tool_props = computed(() => {
    let tool_props = {
        data: decubed.value,
        height: props.height,
        colors: Object.assign({}, props.colors || colorpack.value), 
    }
    return tool_props
})
        // Copy a subset of TradingVue props
const chart_props = computed(() => {
    let offset = props.toolbar ?
        chart_config.value.TOOLBAR : 0
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
        colors: Object.assign({}, props.colors || colorpack.value),
        skin: skin_proto.value,
        timezone: props.timezone
    }

    parse_colors(chart_props.colors)
    return chart_props
})
const chart_config = computed(()=> Object.assign({},Const.ChartConfig,props.chartConfig))

const decubed = computed(() => {
    let data = props.data
    return data.data !== undefined ? data.data : data  // pure now
    // if (data.data !== undefined) {
    //     // DataCube is provide -> move to dc_core.js
    //     // data.init_tvjs(this) mainCompRef
    //     // data.init_tvjs(mainCompRef)
    //     return data.data
    // } else {
    //     return data
    // }
})

// show index base instead of timestamp
const index_based = computed(() => {
    const base = props.data
    if (base.chart) {
        return base.chart.indexBased
    }
    else if (base.data) {
        return base.data.chart.indexBased
    }
    return false
})
const mod_ovs = computed(()=> {
    let arr = []
    for (var x of props.extensions) {
        arr.push(...Object.values(x.overlays))
    }
    return arr
})

const font_comp = computed(()=> (skin_proto.value && skin_proto.value.font) ? skin_proto.value.font : props.font)
const ws = computed(() => {
            let ws = {}
            for (var ctrl of controllers.value) {
                if (ctrl.widgets) {
                    for (var id in ctrl.widgets) {
                        ws[id] = ctrl.widgets[id]
                        ws[id].ctrl = ctrl
                    }
                }
            }
            return ws
})

const skins = computed(() => {
            let sks = {}
            for (var x of props.extensions) {
                for (var id in x.skins || {}) {
                    sks[id] = x.skins[id]
                }
            }
            return sks
})

const skin_proto = computed(() => skins.value[props.skin])
const colorpack = computed(() => {
            let sel = skins.value[props.skin]
            return sel ? sel.colors : undefined
        })

const isDataCube = computed(() => props.data?.data !== undefined)

/* -------------------------------------------------------------------------- */
/*                                    watch                                   */
/* -------------------------------------------------------------------------- */
// use watch to quick fix reactivity problem
// TODO: fast & dirty fix, need
// to fix the actual reactivity problem
watch(()=>props.skin, (n, p) => {
            if (n !== p) resetChart()
            skin_styles()
        })

// if new extension was added
// watch(()=>props.extensions,()=> ctrllist())
watch(()=>props.xSettings,(n,p) => {
                for (var ctrl of controllers.value) {
                    if (ctrl.onsettings) {
                        ctrl.onsettings(n, p)
                    }
                }
            },{deep: true })

// Migrated from dc_core.init_tvjs (Vue 2 $watch → Vue 3 watch)
// TODO : All these watch must be initialize after init_tvjs()


/* -------------------------------------------------------------------------- */
/*                              Vue setup execute                             */
/* -------------------------------------------------------------------------- */
/* ------------------------ execute code in setup tag ----------------------- */
// init_tvjs must be init -- parse all chart json into an object
// Doesn't handle props.data swapping at runtime (edge case — probably fine).
/**
 * 
this.tv.$refs.chart.* → needs chartRef.value (already handled)

dc_events.js:127,235,251,272,316 — .interval_ms
dc_core.js:202,225 — .interval_ms
dc_core.js:533-534 — .cursor.locked, .last_candle
this.tv.getRange() → TradingVue setup-scope function, not accessible

dc_events.js:129,237,253,274,318
dc_core.js:539
this.tv.goto() → same problem — dc_core.js:540

this.tv.showTheTip() → same — dc_events.js:348

this.tv.set_loader() → same — datacube.js:191

this.tv.$emit() → Vue 2 instance method — dc_events.js:48

this.tv.$nextTick() → Vue 2 instance method — dc_events.js:355

this.tv.controllers → setup-scope ref([]) — dc_events.js:19,51
 */
// Dirty fixed : I haven't upgraded dc_core, dc_event, datacube yet
// use this quickfix for now
// TradingVue.vue — replace init_tvjs(mainCompRef, chartRef) with:
const tvAPI = {
    get chart()       { return chartRef.value },
    get controllers() { return controllers.value },
    getRange:    () => getRange(),
    goto:        (t) => goto(t),
    showTheTip:  (text, color) => showTheTip(text, color),
    set_loader:  (dc) => set_loader(dc),
    $emit:       (event, ...args) => emit(event, ...args),
    $nextTick:   (fn) => nextTick(fn),
}

if (isDataCube.value) {
    props.data.init_tvjs(tvAPI)
}


// or just omitted these 3 watches
// Watch 1: re-exec scripts when overlay settings change
watch(
    () => isDataCube.value ? props.data.get_by_query('.settings') : [],
    (n, p) => { if (isDataCube.value) props.data.on_settings(n, p) },
    { deep: true }
)

// Watch 2: remove WW scripts when overlays are deleted ($uuid disappears)
watch(
    () => isDataCube.value ? props.data.get('.').map(x => x.settings.$uuid) : [],
    (n, p) => { if (isDataCube.value) props.data.on_ids_changed(n, p) }
)

// Watch 3: create/remove Dataset WW proxies when datasets array changes
watch(
    () => isDataCube.value ? props.data.get('datasets') : [],
    (n, p) => { if (isDataCube.value) Dataset.watcher.call(props.data, n, p) }
)


/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(()=>{
    // ctrllist() -- nope let it sleep for now
    skin_styles()

    addCleanup(()=>{
        custom_event({ event: 'before-destroy' })
        ctrl_destroy()
    })
})

// export default {name: 'TradingVue'}
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
