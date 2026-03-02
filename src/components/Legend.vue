<template>
<div class="trading-vue-legend"
     v-bind:style="calc_style">
    <div v-if="grid_id === 0"
         class="trading-vue-ohlcv"
        :style = "{ 'max-width': common.width + 'px' }">
        <span class="t-vue-title"
             :style="{ color: common.colors.title }">
              {{common.title_txt}}
        </span>
        <span v-if="show_values">
            O<span class="t-vue-lspan" >{{ohlcv[0]}}</span>
            H<span class="t-vue-lspan" >{{ohlcv[1]}}</span>
            L<span class="t-vue-lspan" >{{ohlcv[2]}}</span>
            C<span class="t-vue-lspan" >{{ohlcv[3]}}</span>
            V<span class="t-vue-lspan" >{{ohlcv[4]}}</span>
        </span>
        <span v-if="!show_values" class="t-vue-lspan"
            :style="{color: common.colors.text}">
            {{(common.meta.last || [])[4]}}
        </span>
    </div>
    <div class="t-vue-ind" v-for="ind in indicators">
        <span class="t-vue-iname">{{ind.name}}</span>
        <button-group
            v-bind:buttons="common.buttons"
            v-bind:config="common.config"
            v-bind:ov_id="ind.id"
            v-bind:grid_id="grid_id"
            v-bind:index="ind.index"
            v-bind:tv_id="common.tv_id"
            v-bind:display="ind.v"
            v-on:legend-button-click="button_click">
        </button-group>
        <span class="t-vue-ivalues" v-if="ind.v">
            <span class="t-vue-lspan t-vue-ivalue"
                v-if="show_values"
                v-for="v in ind.values" :style="{ color: v.color }">
                {{v.value}}
            </span>
        </span>
        <span v-if="ind.unk" class="t-vue-unknown">
            (Unknown type)
        </span>
        <transition name="tvjs-appear">
            <spinner :colors="common.colors" v-if="ind.loading">
            </spinner>
        </transition>
    </div>
</div>
</template>

<script setup>
import ButtonGroup from './ButtonGroup.vue' // V3
import Spinner from './Spinner.vue' // V3
import {computed} from 'vue'

/* -------------------------------------------------------------------------- */
/*                                  constant                                  */
/* -------------------------------------------------------------------------- */
const props = defineProps({
    common: Object,
    values: Object,
    grid_id: Number,
    meta_props: Object
})

/* --------------------------------- emitter -------------------------------- */
const emit = defineEmits(['legend-button-click'])

/* -------------------------------------------------------------------------- */
/*                                  computed                                  */
/* -------------------------------------------------------------------------- */
const show_values = computed(() => props.common.cursor.mode !== 'explore')

const main_type = computed(() => {
    let f = props.common.data.find(x => x.main)
    return f ? f.type : undefined
})

const off_data = computed(() => props.common.offchart)

const json_data = computed(() => props.common.data)

const calc_style = computed(() => {
    let top = layout.value.height > 150 ? 10 : 5
    let grids = props.common.layout.grids
    let w = grids[0] ? grids[0].width : undefined
    return {
        top: `${layout.value.offset + top}px`,
        width: `${w-20}px`
    }
})

const layout = computed(() => {
    const id = props.grid_id
    return props.common.layout.grids[id]
})

// TODO: add support for { grid: { id : N }}
const indicators = computed(() => {
    const values = props.values
    var types = {}

    return json_data.value.filter(
        x => x.settings.legend !== false && !x.main
    ).map(x => {
        if (!(x.type in types)) types[x.type] = 0
        const id = x.type + `_${types[x.type]++}`
        return {
            v: 'display' in x.settings ? x.settings.display : true,
            name: x.name || id,
            index: (off_data.value || json_data.value).indexOf(x),
            id: id,
            values: values ? format(id, values) : n_a(1),
            unk: !(id in (props.meta_props || {})),
            loading: x.loading
        }
    })
})

const ohlcv = computed(() => {
    if (!props.values || !props.values.ohlcv) {
        return Array(6).fill('n/a')
    }
    let prec = layout.value.prec

    // TODO: make the main legend more customizable
    let id = main_type.value + '_0'
    let meta = props.meta_props[id] || {}
    if (meta.legend) {
        return (meta.legend() || []).map(x => x.value)
    }

    return [
        props.values.ohlcv[1].toFixed(prec),
        props.values.ohlcv[2].toFixed(prec),
        props.values.ohlcv[3].toFixed(prec),
        props.values.ohlcv[4].toFixed(prec),
        props.values.ohlcv[5] ? props.values.ohlcv[5].toFixed(2):'n/a'
    ]
})



/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const button_click = (event) => emit('legend-button-click', event)

const n_a = (len) => Array(len).fill({ value: '∅' })

const format = (id, values) => {
    let meta = props.meta_props[id] || {}
    // Matches Overlay.data_colors with the data values
    // (see Spline.vue)
    if (!values[id]) return n_a(1)

    // Custom formatter
    if (meta.legend) return meta.legend(values[id])

    return values[id].slice(1).map((x, i) => {
        const cs = meta.data_colors ? meta.data_colors() : []
        if (typeof x == 'number') {
            // TODO: make the formatting more customizable, e.g. allow passing a custom formatter function in meta.legend or meta.format
            // i.e. shib or doge price
            x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8)
        }
        return {
            value: x,
            color: cs ? cs[i % cs.length] : undefined
        }
    })
}

// export default {name: 'ChartLegend'}
</script>

<style>
.trading-vue-legend {
    position: relative;
    z-index: 100;
    font-size: 1.25em;
    margin-left: 10px;
    pointer-events: none;
    text-align: left;
    user-select: none;
    font-weight: 300;
}
@media (min-resolution: 2x) {
    .trading-vue-legend {
        font-weight: 400;
    }
}
.trading-vue-ohlcv {
    pointer-events: none;
    margin-bottom: 0.5em;
}
.t-vue-lspan {
    font-variant-numeric: tabular-nums;
    font-size: 0.95em;
    color: #999999; /* TODO: move => params */
    margin-left: 0.1em;
    margin-right: 0.2em;
}
.t-vue-title {
    margin-right: 0.25em;
    font-size: 1.45em;
}
.t-vue-ind {
    margin-left: 0.2em;
    margin-bottom: 0.5em;
    font-size: 1.0em;
    margin-top: 0.3em;
}
.t-vue-ivalue {
    margin-left: 0.5em;
}
.t-vue-unknown {
    color: #999999; /* TODO: move => params */
}

.tvjs-appear-enter-active,
.tvjs-appear-leave-active
{
    transition: all .25s ease;
}

.tvjs-appear-enter, .tvjs-appear-leave-to
{
    opacity: 0;
}
</style>
