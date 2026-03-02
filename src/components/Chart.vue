<template>
    <!-- Chart components combined together -->
    <div class="trading-vue-chart" :style="styles">
        <keyboard ref="keyboardRef"></keyboard>
        <template v-if="layoutRef && layoutRef.grids">
            <grid-section
                v-for="(grid, i) in layoutRef.grids"
                :key="grid.id" ref="sec"
                v-bind:common="section_props(i)"
                v-bind:grid_id="i"
                v-on:register-kb-listener="register_kb"
                v-on:remove-kb-listener="remove_kb"
                v-on:range-changed="range_changed"
                v-on:cursor-changed="cursor_changed"
                v-on:cursor-locked="cursor_locked"
                v-on:sidebar-transform="set_ytransform"
                v-on:layer-meta-props="layer_meta_props"
                v-on:custom-event="emit_custom_event"
                v-on:legend-button-click="legend_button_click"
            >
            </grid-section>
        </template>
        <botbar
            v-if="layoutRef"
            v-bind="botbar_props"
            :shaders="state.shaders"
            :timezone="timezone">
        </botbar>
    </div>
</template>

<script setup>
import ContextFont from '../stuff/context.js'
import Layout from './js/layout.js' // should be composable
import CursorUpdater from './js/updater.js'
import TI from './js/ti_mapping.js'

import {xmode, overwrite, copy_layout, fast_filter, fast_filter_i, format_name, warn} from '@stuff/utilities.js'
import {parse_tf, detect_interval} from '@stuff/time.js'
import {SECOND, IB_TF_WARN} from '@stuff/constants.js'

import GridSection from './Section.vue' // V3
import Botbar from './Botbar.vue' // V3
import Keyboard from './Keyboard.vue' // V3

// TODO : Layout is calculated onMounted, but component has already rendered
// should create Layout outside of Chart.vue and pass it as props because of following issue
// <botbar> was always rendered, even before layoutRef is set, causing Botbar to receive layout: undefined
// <template v-if="layoutRef && layoutRef.grids"> so the loop only runs once layout is ready.
// --------
/**
 * TODO
 * Secondary difference: layout reactivity
 * Legacy: this._layout is set as a bare instance property in created() (prefixed _ to skip Vue 2 reactivity). update_layout() calls Utils.copy_layout(this._layout, lay)
 * which mutates it in place. The template re-renders not because _layout changed, but because other reactive data (like this.range or this.sub) triggered a re-render.
 * New: layoutRef is a ref(). Assigning layoutRef.value = Layout(...) in onMounted and calling copy_layout(layoutRef.value, lay) 
 * in update_layout IS a proper reactive dependency. main_section computed accesses layoutRef.value via common_props(), so any layoutRef change directly invalidates main_section.
 */

//analyse the logic difference between @src/components/Chart.vue and @src/components/Chart_legacy.vue  on how they update their binded section_props property

import { ref, reactive, onMounted, computed, watch, shallowRef, markRaw} from 'vue';

/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- props --------------------------------- */
const props = defineProps({
    title_txt: String,
    data: Object,
    width: Number,
    height: Number,
    font: String,
    colors: Object,
    overlays: Array,
    tv_id: String,
    config: Object,
    buttons: Array,
    toolbar: Boolean,
    ib: Boolean,
    skin: String,
    timezone: Number
})
/* -------------------------------- state-var ------------------------------- */
const initState = {
    sub: [], // Visible Data Slice
    range: [], // Time Range
    interval: 0, // Candlestick interval
    interval_ms: 0, // Candlestick interval in ms
    rerender: 0, // re-render comp i.e. botbar
    layers_meta: {}, // Layers meta-props (changing behaviour) //TODO does not contain y_range in it cause error when drawing lines
    y_transforms: {}, // Y-transforms (for y-zoom and -shift)
    settings_ohlcv: {}, // Default OHLCV settings (when using DataStructure in dc_core.js)
    settings_ov: {}, // Default overlay settings
    last_candle: [], // last candle
    last_values: {}, // last values
    sub_start: undefined, // start index of sub
    activated: false, // if chart is activated
    shaders:[],
    _data_n0: null,
    _data_len: 0,
    _data_t: 0,
    // Crosshair states
    // note cursor.values[gridId] was mutate in updater.js
    // but Vue's didn't realized it
    cursor: {
        x: null, y: null, t: null, y$: null,
        grid_id: null, locked: false, values: {},
        scroll_lock: false, mode: xmode()
    },
}
const state = reactive(initState);
const keyboardRef = ref(null);
const layoutRef = ref();
const cursorTick = ref(0)

const TImapRef = shallowRef(); // class
const updaterRef = shallowRef(); // class
/* ---------------------------------- emit ---------------------------------- */
// TODO some of the emit hasn't implemented
// cursor-changed	✓	missing
// cursor-locked	✓	missing
// sidebar-transform	✓	missing
// layer-meta-props	✓	missing
const emit = defineEmits([
    'range-changed', 
    'cursor-changed', 
    'cursor-locked', 
    'sidebar-transform', 
    'layer-meta-props', 
    'custom-event', 
    'legend-button-click'
])

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
// reactive update
// there were some reference to state var i.e. const oldRange = state.range
// if state.range is updated, oldRange won't trigger change detection
// so we use Utils.overwrite to keep the original reference
// state.range
// state.sub

const range_changed = (r) => {
    // Overwite & keep the original references
    // Quick fix for IB mode (switch 2 next lines)
    let sub = subset(r)
    overwrite(state.range, r) // Fix for IB mode
    overwrite(state.sub, sub)
    update_layout()
    emit('range-changed', r)
    if (props.ib) save_data_t()
}
// apply to event later when user jump to specific time
const jumpToTime = (t) => { 
    const dt = state.range[1] - state.range[0]
    range_changed([t - dt, t])
}
// apply to event later when user jump to specific time
const setRange = (t1, t2) => range_changed([t1, t2])

// inactive - has no emit ?
const cursor_changed = (e) => {
    if (e.mode) state.cursor.mode = e.mode
    if (state.cursor.mode !== 'explore') {
        updaterRef.value.sync(e)
        cursorTick.value++
    }
    // if (this._hook_xchanged) ce('?x-changed', e) // no external caller sets _hook_* in script setup
}

// inactive - has no emit
const cursor_locked = (locked) => {
    if (state.cursor.scroll_lock && locked) return
    state.cursor.locked = locked
    // if (this._hook_xlocked) ce('?x-locked', state) // no external caller sets _hook_* in script setup
}

const calc_interval = () => {
    let tf = parse_tf(forced_tf.value)
    if (ohlcv.value.length < 2 && !tf) return
    state.interval_ms = tf || detect_interval(ohlcv.value)
    state.interval = props.ib ? 1 : state.interval_ms
    // can we just use console.warn
    warn(
        () => props.ib && !chart.value.tf,
        IB_TF_WARN, SECOND
    )
}
// should there be x_transform ?
const set_ytransform = (s) => {
    let obj = state.y_transforms[s.grid_id] || {}
    Object.assign(obj, s)
    // this.$set(state.y_transforms, s.grid_id, obj)
    state.y_transforms[s.grid_id] = obj
    update_layout()
    overwrite(state.range, state.range) // Fix for IB mode
}

const default_range = () => {
    const dl = props.config.DEFAULT_LEN
    const ml = props.config.MINIMUM_LEN + 0.5
    const l = ohlcv.value.length - 1

    if (ohlcv.value.length < 2) return
    if (ohlcv.value.length <= dl) {
        var s = 0, d = ml
    } else {
        s = l - dl, d = 0.5
    }
    if (!props.ib) {
        overwrite(state.range, [
            ohlcv.value[s][0] - state.interval * d,
            ohlcv.value[l][0] + state.interval * ml
        ])
    } else {
        overwrite(state.range, [
            s - state.interval * d,
            l + state.interval * ml
        ])
    }
}

const subset = (range = state.range) => {
    // dynamic function
    var [res, index] = filter.value(
        ohlcv.value,
        range[0] - state.interval,
        range[1]
    )
    // make use of markraw
    TImapRef.value = markRaw(new TI())
    if (res) {
        state.sub_start = index // update state first
        let TIpayload = {
            // sub: res,
            // interval: state.interval,
            // meta: meta.value,
            // $props: props,
            interval_ms: state.interval_ms,
            sub_start: index,
            ib: props.ib
        }
        TImapRef.value.init(TIpayload, res)
        if (!props.ib) return res || []
        return TImapRef.value.sub_i
    }
    return []
}

const common_props = () => {
    // force common_props to track cursorTick.value in updaterRef.value.sync(e) - updater.js
    // TODO : Handle it more gracefully
    void cursorTick.value 
    return {
        title_txt: chart.value.name || props.title_txt,
        layout: layoutRef.value,
        sub: state.sub,
        range: state.range,
        interval: state.interval,
        cursor: state.cursor,
        colors: props.colors,
        font: props.font,
        y_ts: state.y_transforms,
        tv_id: props.tv_id,
        config: props.config,
        buttons: props.buttons,
        meta: meta.value,
        skin: props.skin
    }
}

const overlay_subset = (source, side) => {
    return source.map((d, i) => {
        let res = fast_filter(
            d.data, TImapRef.value.i2t_mode(
                state.range[0] - state.interval,
                d.indexSrc
            ),
            TImapRef.value.i2t_mode(state.range[1], d.indexSrc)
        )
        return {
            type: d.type,
            name: format_name(d),
            data: TImapRef.value.parse(res[0] || [], d.indexSrc || 'map'),
            settings: d.settings || state.settings_ov,
            grid: d.grid || {},
            tf: parse_tf(d.tf),
            i0: res[1],
            loading: d.loading,
            last: (state.last_values[side] || [])[i]
        }

    })
}

const section_props = (i) => (i === 0 ? main_section.value : sub_section.value)

const init_range = () => {
        calc_interval()
        default_range()
    }

// inactive has no emit
const layer_meta_props = (d) => {
    // TODO: check reactivity when layout is changed
    if (!(d.grid_id in state.layers_meta)) {
        // this.$set(state.layers_meta, d.grid_id, {})
        state.layers_meta[d.grid_id] = {}
    }
    // this.$set(state.layers_meta[d.grid_id],d.layer_id, d)
    state.layers_meta[d.grid_id][d.layer_id] =  d

    // Rerender
    update_layout()
}

const remove_meta_props = (grid_id, layer_id) => {
    if (grid_id in state.layers_meta) {
        // this.$delete(state.layers_meta[grid_id],layer_id)
        state.layers_meta[grid_id][layer_id] =  null
    }
}

const emit_custom_event = (d) => {
    on_shader_event(d, 'botbar')
    emit('custom-event', d)
    if (d.event === 'remove-layer-meta') {
        remove_meta_props(...d.args)
    }
}

const update_layout = (clac_tf) => {
    if (clac_tf) calc_interval()
    // create payload
    let ctx = new ContextFont(props.font)
    let layoutPayload = {
        $props: props,
        y_transforms: state.y_transforms,
        chart: chart.value,
        sub: state.sub,
        offsub: offsub.value,
        interval: state.interval,
        range: state.range,
        ctx,
        layers_meta: state.layers_meta,
        ti_map: TImapRef.value
    }
    let lay = Layout(layoutPayload) // arrow fn — not a constructor
    if (layoutRef.value && lay) copy_layout(layoutRef.value, lay)
    // if (this._hook_update) ce('?chart-update', lay) // no external caller sets _hook_* in script setup
}

const legend_button_click = (event) => emit('legend-button-click', event)
const register_kb = (event) => {
    if (!keyboardRef.value) return
    keyboardRef.value.register(event)
}

const remove_kb = (event) => {
    if (!keyboardRef.value) return
    keyboardRef.value.remove(event)
}

const update_last_values = () => {
    state.last_candle = ohlcv.value ?
        ohlcv.value[ohlcv.value.length - 1] : undefined
    state.last_values = { onchart: [], offchart: [] }
    onchart.value.forEach((x, i) => {
        let d = x.data || []
        state.last_values.onchart[i] = d[d.length - 1]
    })
    offchart.value.forEach((x, i) => {
        let d = x.data || []
        state.last_values.offchart[i] = d[d.length - 1]
    })
}

 // Hook events for extensions - see if it is required by an extension
const ce = (event, ...args) => emit_custom_event({ event, args })
// Set hooks list (called from an extension) — disabled: `this` unavailable in script setup, no external callers found
// _hook_xchanged
// _hook_xlocked
// _hook_update
// _hook_resize
// _hook_data
// const hooks = (...list) => list.forEach(x => this[`_hook_${x}`] = true)

/* ----------------------------- shaders methods ---------------------------- */
const init_shaders = (skin, prev) => {
    if (skin !== prev) {
        if (prev) state.shaders = state.shaders.filter(
            x => x.owner !== prev.id
        )
        for (var Shader of skin.shaders) {
            let shader = new Shader()
            shader.owner = skin.id
            state.shaders.push(shader)
        }
        // TODO: Sort by zIndex
    }
}

const on_shader_event = (d, target) => {
    if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
            d.args[0].id = `${d.args[1]}-${d.args[2]}`
            state.shaders.push(d.args[0])
            state.rerender++
        }
    }
    if (d.event === 'remove-shaders') {
        let id = d.args.join('-')
        state.shaders = state.shaders
            .filter(x => x.id !== id)
    }
}

/* ------------------------------- Data Method ------------------------------ */
const data_changed = () => {
            let n = ohlcv.value
            let changed = false
            if (state._data_n0 !== n[0] && state._data_len !== n.length) {
                changed = true
            }
            check_all_data(changed)
            if (TImapRef.value.ib) {
                reindex_delta(n[0], state._data_n0)
            }
            state._data_n0 = n[0]
            state._data_len = n.length
            save_data_t()
            return changed
        }

const check_all_data = (changed) => {
            // If length of data in the Structure changed by > 1 point
            // emit a special event for DC to recalc the scripts
            // TODO: check overlays data too
            let len = state._data_len || 0
            if (Math.abs(ohlcv.value.length - len) > 1 ||
                state._data_n0 !== ohlcv.value[0]) {
                emit('custom-event', {
                    event: 'data-len-changed',
                    args: []
                })
            }

        }

const reindex_delta = (n, p) => {
    n = n || [[0]]
    p = p || [[0]]
    let dt = n[0] - p[0]
    if (dt !== 0 && state._data_t) {
        // Convert t back to index
        try {
            // More precise method first
            let nt = state._data_t + 0.01 // fix for the filter lib
            let res = Utils.fast_nearest(ohlcv.value, nt)
            let cndl = ohlcv.value[res[0]]
            var off = (nt - cndl[0]) / state.interval_ms
            jumpToTime(res[0] + off)
        } catch(e) {
            jumpToTime(TImapRef.value.t2i(state._data_t))
        }
    }
}

const save_data_t = () => {
    state._data_t = TImapRef.value.i2t(state.range[1]) // save as t
}

/* -------------------------------------------------------------------------- */
/*                                  Computed                                  */
/* -------------------------------------------------------------------------- */
// TODO Handle it more gracefully
const main_section = computed(() => {
    let p = Object.assign({}, common_props())
    p.data = overlay_subset(onchart.value, 'onchart')
    p.data.push({
        type: chart.value.type || 'Candles',
        main: true,
        data: state.sub,
        i0: state.sub_start,
        settings: chart.value.settings || state.settings_ohlcv,
        grid: chart.value.grid || {},
        last: state.last_candle
    })
    p.overlays = props.overlays
    return p
})

const sub_section = computed(() => {
    let p = Object.assign({}, common_props())
    p.data = overlay_subset(offchart.value, 'offchart')
    p.overlays = props.overlays
    return p
})

const botbar_props = computed(() => {
    let p = Object.assign({}, common_props())
    if (!p.layout) return p // layout not ready yet
    p.width = p.layout.botbar.width
    p.height = p.layout.botbar.height
    p.rerender = state.rerender
    return p
})

// ?
const offsub = computed(() => overlay_subset(offchart.value, 'offchart'))

// Datasets: candles, onchart, offchart indicators
const ohlcv = computed(() => props.data ? (props.data.ohlcv || chart.value.data) : [])
const chart = computed(() => props.data ? props.data.chart : { grid: {} })
const onchart = computed(() => props.data ? props.data.onchart : [])
const offchart = computed(() => props.data ? props.data.offchart : [])
// dynamic function
const filter = computed(() => props.ib ? fast_filter_i : fast_filter)

const styles = computed(() => {
    let w = props.toolbar ? props.config.TOOLBAR : 0
    return { 'margin-left': `${w}px` }
})

const meta = computed(() => {
    return {
        last: state.last_candle,
        sub_start: state.sub_start,
        activated: state.activated
    }
})

const forced_tf = computed(() => chart.value.tf)

/* -------------------------------------------------------------------------- */
/*                                    watch                                   */
/* -------------------------------------------------------------------------- */

watch([() => props.width, () => props.height], () => {
    update_layout()
    // if (this._hook_resize) ce('?chart-resize') // no external caller sets _hook_* in script setup
})

watch(() => props.ib, (ov,nv) => {
    if (!nv) {
        // Change range index => time
        let t1 = TImapRef.value.i2t(state.range[0])
        let t2 = TImapRef.value.i2t(state.range[1])
        overwrite(state.range, [t1, t2])
        state.interval = state.interval_ms
    } else {
        init_range() // TODO: calc index range instead
        overwrite(state.range, state.range)
        state.interval = 1
    }
    let sub = subset()
    overwrite(state.sub, sub)
    update_layout()
})

watch(() => props.timezone, () => update_layout())
watch(() => props.colors, () => overwrite(state.range, state.range))
watch(() => props.forced_tf, () => {update_layout(true);ce('exec-all-scripts')})
watch(() => props.data, (n,p) => {
    if (!state.sub.length) init_range()
    let sub = subset()
    // Fixes Infinite loop warn, when the subset is empty
    // TODO: Consider removing 'sub' from data entirely
    if (state.sub.length || sub.length) {
        overwrite(state.sub, sub)
    }
    let nw = data_changed()
    update_layout(nw)
    overwrite(state.range, state.range)
    state.cursor.scroll_lock = !!n.scrollLock
    if (n.scrollLock && state.cursor.locked) {
        state.cursor.locked = false
    }
    // if (this._hook_data) ce('?chart-data', nw) // no external caller sets _hook_* in script setup
    update_last_values()
    // TODO: update legend values for overalys
    state.rerender++
},{
    deep: true
})

watch(()=>props.skin, (n, p)=>{
    init_shaders(n, p)
})

/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(() => {
    // Context for text measurements
    let ctx = new ContextFont(props.font)

    // Initial layout (All measurments for the chart)
    init_range()
    state.sub = subset()
    overwrite(state.range, state.range) // Fix for IB mode

    // create payload
    let layoutPayload = {
        $props: props,
        y_transforms: state.y_transforms,
        chart: chart.value,
        sub: state.sub,
        offsub: offsub.value,
        interval: state.interval,
        range: state.range,
        ctx,
        layers_meta: state.layers_meta,
        ti_map: TImapRef.value
    }


    // DEBUG: catch internal Layout failure before CursorUpdater uses _layout
    try {
        layoutRef.value = Layout(layoutPayload)
        // console.log('[Chart/onMounted] layoutRef.value:', layoutRef.value)
    } catch(e) {
        console.error('[Chart/onMounted] Layout() threw:', e)
        console.table(layoutPayload) // inspect each field for undefined
        return // bail — CursorUpdater needs a valid layout
    }

    // Updates current cursor values
    // Got only primitive value - not update, LOL
    let cursorPayload = {
        cursor: state.cursor,
        _layout: layoutRef.value,
        interval: state.interval, 
        section: section_props // pass the entire function and entire value
    }

    updaterRef.value = markRaw(new CursorUpdater(cursorPayload))

    update_last_values()
    init_shaders(props.skin)
})

// export default {name: 'Chart',}

</script>
