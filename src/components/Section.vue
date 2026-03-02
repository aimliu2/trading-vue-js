<template>
    <!-- Horizontal section: (grid + sidebar) -->
    <div class="trading-vue-section">
        <chart-legend ref="legend"
            v-bind:values="section_values"
            v-bind:grid_id="grid_id"
            v-bind:common="legend_props"
            v-bind:meta_props="get_meta_props"
            v-on:legend-button-click="button_click">
        </chart-legend>
        <grid v-bind="grid_props" ref="grid"
            v-bind:grid_id="grid_id"
             v-on:register-kb-listener="register_kb"
             v-on:remove-kb-listener="remove_kb"
             v-on:range-changed="range_changed"
             v-on:cursor-changed="cursor_changed"
             v-on:cursor-locked="cursor_locked"
             v-on:layer-meta-props="emit_meta_props"
             v-on:custom-event="emit_custom_event"
             v-on:sidebar-transform="sidebar_transform"
             v-on:rezoom-range="rezoom_range">
        </grid>
        <sidebar
            ref="sidebarRef"
            v-bind="sidebar_props"
            v-bind:grid_id="grid_id"
            v-bind:rerender="state.rerender"
            v-on:sidebar-transform="sidebar_transform">
        </sidebar>
    </div>
</template>

<script setup>

import Grid from './Grid.vue' //V3 : binded keyboard event in here
import Sidebar from './Sidebar.vue' // V3
import ChartLegend from './Legend.vue' // V3

// import Shaders from '../mixins/shaders.js' // mixins: [Shaders]
import { reactive, ref, watch, onMounted, computed } from 'vue'

// constant
const initState = {
    meta_props: {},
    rerender: 0, // rerender when range change, scroll back in time
    last_ghash: '',
    shaders: []
}
const state = reactive(initState)
const sidebarRef = ref(null)

// props
const props = defineProps({
    common: Object,
    grid_id: Number
})

// emit
const emit = defineEmits([
    'range-changed', 
    'cursor-changed', 
    'cursor-locked', 
    'sidebar-transform', 
    'layer-meta-props', 
    'custom-event', 
    'legend-button-click', 
    'register-kb-listener', 
    'remove-kb-listener', 
    'rezoom-range'
])

// methods
const range_changed = (r) => emit('range-changed', r)
const cursor_locked = (state) => emit('cursor-locked', state)
const sidebar_transform = (s) => emit('sidebar-transform', s)
const button_click = (event) => emit('legend-button-click', event)
const register_kb = (event) => emit('register-kb-listener', event)
const remove_kb = (event) => emit('remove-kb-listener', event)
const rezoom_range = (event) => {
    if (sidebarRef.value?.renderer) {
        sidebarRef.value.renderer.rezoom_range(
            event.z, event.diff1, event.diff2
        )
    }
}
const ghash = (grids) => {
    // let input be common.layout.grids
    // Measures grid heights configuration
    let hs = grids.map(x => x.height)
    return hs.reduce((a, b) => a + b, '')
}

const cursor_changed = (c) => {
    c.grid_id = props.grid_id
    emit('cursor-changed', c)
}

const emit_meta_props = (d) => {
    state.meta_props[d.layer_id] = d
    emit('layer-meta-props', d)
}
const emit_custom_event = (d) => {
    on_shader_event(d, 'sidebar')
    emit('custom-event', d)
}

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

// computed
// get Component-specific props subsets:
const grid_props = computed(() => {
    const id = props.grid_id
    let p = Object.assign({}, props.common)

    // Split offchart data between offchart grids
    if (id > 0) {
        let all = p.data
        p.data = [p.data[id - 1]]
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        p.data.push(...all.filter(
            x => x.grid && x.grid.id === id))
    }

    p.width = p.layout.grids[id].width
    p.height = p.layout.grids[id].height
    p.y_transform = p.y_ts[id]
    p.shaders = grid_shaders.value
    return p
})

const sidebar_props = computed(() => {
    const id = props.grid_id
    let p = Object.assign({}, props.common)
    p.width = p.layout.grids[id].sb
    p.height = p.layout.grids[id].height
    p.y_transform = p.y_ts[id]
    p.shaders = sb_shaders.value
    return p
})

const section_values = computed(() => {
    const id = props.grid_id
    let p = Object.assign({}, props.common)
    p.width = p.layout.grids[id].width
    return p.cursor.values[id]
})

const legend_props = computed(() => {
    const id = props.grid_id
    let p = Object.assign({}, props.common)

    // Split offchart data between offchart grids
    if (id > 0) {
        let all = p.data
        p.offchart = all
        p.data = [p.data[id - 1]]
        p.data.push(...all.filter(
            x => x.grid && x.grid.id === id))
    }
    return p
})

const get_meta_props = computed(() => {
    return state.meta_props
})

const grid_shaders = computed(() => {
    return state.shaders.filter(x => x.target === 'grid')
})

const sb_shaders = computed(() => {
    return state.shaders.filter(x => x.target === 'sidebar')
})  

// watch - got [object, object]
watch(()=> props.common.layout.grids, (val, oldVal) => {
    let newhash = ghash(val) // input = common.layout.grids
    if (newhash !== state.last_ghash) {
        state.rerender++
    }

    // rerender if number of grids changed
    if(val.length !== oldVal.length) {
        state.rerender++
    }
    state.last_ghash = newhash
},
    {
        deep: true
    })

watch(()=> props.common.skin, (newVal, oldVal) => {
    init_shaders(newVal)
})

// mounted
onMounted(() => {
    init_shaders(props.common.skin)
})

// export default {name: 'GridSection'}
</script>

<style>
.trading-vue-section {
    height: 0;
    position: absolute;
}
</style>
