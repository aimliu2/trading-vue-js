<template>
<div :class="makeGridClass" :style="divStyle"
    v-on:custom-event="(e) => on_ux_event(e, 'grid')"
    >
    <canvas ref="gridCanvas" :id="makeGridId"></canvas>
    <Crosshair v-bind="{...common_props()}" v-on="layer_events" />
    <UxLayer
        :id="props.grid_id"
        :tv_id="props.tv_id"
        :uxs="uxs"
        :colors="props.colors"
        :config="props.config"
        :updater="Math.random()"
        @custom-event="emit_ux_event"
    /> 
    <component
        v-for="(x, i) in get_overlays()"
        :key="i"
        :is="x.cls"
        :ref="overlayRefs"
        v-bind="{
            ...common_props(),
            id: x.id,
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: x.num,
            grid_id: props.grid_id,
            meta: props.meta,
            last: x.last
        }"
        v-on="layer_events"
    />
    
</div>
</template>


<script setup>
// TODO : create Template bind
// automatically set up all layers/overlays for the grid with 'grid_id'

import Grid from '@composables/cGrid.js'

import Crosshair from './Crosshair.vue' //V3
import UxLayer from './UxLayer.vue' //V3

// self as XIII
import { markRaw, shallowRef, ref, computed, onMounted, watch, nextTick, h } from 'vue';
import UseCleanup from '@composables/cUseCleanup.js'
import {CoreRegisteredOverlays, CoreRegisteredTools, CoreRegisteredIndicators} from  "@composables/overlays/overlay-registry-core"

// extend overlays, tools, indicators, etc. later
// import {ExRegisteredComponents} from  "@composables/overlay-registry-extra"


/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- props --------------------------------- */
const props = defineProps({
    sub: Array, 
    layout: Object, 
    range: Array, 
    interval: Number, 
    cursor: Object, 
    colors: Object, 
    overlays:Array,
    width: Number, 
    height: Number, 
    data: Array, 
    grid_id: Number, 
    y_transform: Object, 
    font: String, 
    tv_id: String,
    config: Object, 
    meta: Object, 
    shaders: Array
})

/* ----------------------------- state-variables ---------------------------- */
const gridCanvas = ref(); // HTMLcanvasElement
const gridPixel = ref(null);
const { addCleanup } = UseCleanup()
// mostly event bind
const layer_events = ref()
const keyboard_events = ref()
const uxs =  ref([])
const overlayRefs = ref([]);

/* ---------- layer_events: MUST be set before onMounted so child overlays can emit into it ---------- */
layer_events.value = {
    'new-grid-layer': e => {
        // console.log('[Grid] 🟢 new-grid-layer event:', { name: e?.name, id: e?.id, hasRenderer: !!e?.renderer, display: e?.display, z: e?.z })
        call_new_layer(e)
    },
    'delete-grid-layer': e => {
        // console.log('[Grid] 🔴 delete-grid-layer event:', e)
        call_del_layer(e)
    },
    'show-grid-layer': e => {
        if (!gridPixel.value) return
        gridPixel.value.show_hide_layer(e)
        gridPixel.value.update()
    },
    'redraw-grid': e => {
        if (!gridPixel.value) return
        gridPixel.value.update()
    },
    'layer-meta-props': e => emit('layer-meta-props', e),
    'custom-event': e => emit('custom-event', e)
}

/* -------------------------------- emitters -------------------------------- */
const emit = defineEmits([
    'custom-event',
    'layer-meta-props',
    'register-kb-listener',
    'remove-kb-listener', 
    'cursor-changed', 
    'cursor-locked',
    'range-changed',
    'sidebar-transform',
    'rezoom-range'
])

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
// keyboard events: direct document listeners (replaces KeyboardListener component)
const _onKeydown = (e) => {
    console.log(`[Grid] ⌨️ keydown: "${e.key}" (code: ${e.code}) | active: ${is_active.value}`)
    if (!is_active.value) return
    if (gridPixel.value) gridPixel.value.propagate('keydown', e)
}
const _onKeyup = (e) => {
    console.log(`[Grid] ⌨️ keyup: "${e.key}" (code: ${e.code}) | active: ${is_active.value}`)
    if (!is_active.value) return
    if (gridPixel.value) gridPixel.value.propagate('keyup', e)
}
const _onKeypress = (e) => {
    console.log(`[Grid] ⌨️ keypress: "${e.key}" (code: ${e.code}) | active: ${is_active.value}`)
    if (!is_active.value) return
    if (gridPixel.value) gridPixel.value.propagate('keypress', e)
}
/**
 * @function overlayUpdate
 * @desc Track changes in calc() functions, exclusive to calc indicators
 * @param 
 * @example
 * 
 * ```js
 * ovs calc() {
 *      return {
 *         props: {
 *              length: { def: 12, text: 'Length' }
 *          },
 *          conf: { renderer: 'Spline' },
 *          update: `
 *              return ema(close, length)[0]
 *          `
 *      }
 *  }
 * ```
 */
// TODO: later
const overlayUpdate = (ovs) => {
    for (var ov of ovs) {
        // this.$children = direct child components of the current instance
        // serach one-by-one that has calc properties and update them
        for (let comp of overlayRefs) {
            if (typeof comp.id !== 'string') continue //i.e.  'SMA_0'
            let tuple = comp.id.split('_') // [ 'SMA', '0' ]
            tuple.pop() // [ 'SMA' ]
            if (tuple?.[0] === ov.name) { // gracefully unwrapped array instead of tuple.join('_') === ov.name
                comp.calc = ov.methods.calc
                if (!comp.calc) continue
                let calc = comp.calc.toString()
                if (calc !== ov.__prevscript__) {
                    // execute script - indicators
                    comp.exec_script()
                }
                ov.__prevscript__ = calc
            }
        }
    }
}

// exclusive to indicator those who had calc() method and conf i.e. conf: { renderer: 'Spline' }
// TODO : findout what use SplineUX to render ?
const inject_renderer = (comp) => {
    let src = comp.methods.calc()
    if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp // return component as-is if there is no conf
    }
    // Search for an overlay to render with the target 'name' i.e. use Spline to render SMA indicaotr
    let f = CoreRegisteredOverlays.find(x => x.name === src.conf.renderer)
    if (!f) return comp // return component as-is if there is no pre-defined overlay to render
    comp.mixins.push(f) // huh ?, why push entire component into mixin ?
    comp.__renderer__ = src.conf.renderer // why !? Vue renderer !?
    return comp
}

const emit_ux_event = (e) => {
    let e_pass = on_ux_event(e, 'grid')
    if (e_pass) emit('custom-event', e)
}

const common_props = () => {
    return {
        cursor: props.cursor,
        colors: props.colors,
        layout: props.layout.grids[props.grid_id],
        interval: props.interval,
        sub: props.sub,
        font: props.font,
        config: props.config,
    }
}

// Distributes overlay data & settings according to Datacube input
const get_overlays = () => {
    let comp_list = [], count = {}, indy = null;

    for (var d of props.data) { 
        // TODO : upgrade to map later
        // match d.type (i.e. 'KC') in props.data and 
        // WIP : upgrade whole logic later
        // TODO : add render selection later

        // use base type i.e. Linetool:Extend does not know what to use_for
        let base_type = d.type.split(':')[0]
        let overlays = CoreRegisteredOverlays
            .filter(item => item.use_for.includes(base_type))
            .map(item => item.component); // got Overlay Component i.e. [Spline]

        // TODO : add render settings later
        let tools = CoreRegisteredTools
            .filter(item => item.use_for.includes(base_type))
            .map(item => item.component); // got Tool Component i.e. [LineTool]

        let indies = CoreRegisteredIndicators
            .filter(item => item.use_for.includes(base_type))
            .map(item => item.component); // got Indicator Component i.e. [SMA]

        if(indies?.[0]) indy = inject_renderer(indies?.[0]); // d.type is indicator

        // also concat overlay from props.overlays
        let comp = (overlays?.[0] || tools?.[0] || indy); // get only first component = Spline
        if (comp) { 
            comp_list.push({
                cls: comp, // already pushed here
                type: d.type,
                data: d.data,
                settings: d.settings,
                i0: d.i0,
                tf: d.tf,
                last: d.last
            })
            // increment count for the current type
            count[d.type] = (count[d.type] || 0) + 1
        }
    }

    // assign id and num to each item
    let id_count = {}
    const result = comp_list.map((x, i) => {
        id_count[x.type] = (id_count[x.type] || 0)
        const item = {
            ...x,
            id: `${x.type}_${id_count[x.type]++}`,
            num: i
        }
        // 🔍 DEBUG: log each overlay
        // console.log(`[Grid] overlay[${i}]`, {
        //     id: item.id,
        //     type: item.type,
        //     cls: item.cls,
        //     clsName: item.cls?.name || item.cls?.__name || '(no name)',
        //     hasTemplate: !!item.cls?.template,
        //     hasRender: !!item.cls?.render,
        //     hasMixins: !!item.cls?.mixins?.length,
        //     hasData: !!item.data,
        //     dataLen: item.data?.length,
        //     settings: item.settings,
        // })
        return item
    })

    // 🔍 DEBUG: validate common_props
    const cp = common_props()
    // console.log('[Grid] common_props:', {
    //     hasCursor: !!cp.cursor,
    //     hasColors: !!cp.colors,
    //     hasLayout: !!cp.layout,
    //     layoutKeys: cp.layout ? Object.keys(cp.layout) : 'N/A',
    //     interval: cp.interval,
    //     hasSub: !!cp.sub,
    //     subLen: cp.sub?.length,
    //     hasFont: !!cp.font,
    //     hasConfig: !!cp.config,
    // })

    // console.log(`[Grid] total overlays: ${result.length}`)
    return result
    }

const call_del_layer = (layer) => {
    if(gridPixel.value){
        nextTick(() => gridPixel.value.del_layer(layer))
        const grid_id = props.grid_id
        emit('custom-event', {
            event: 'remove-shaders',
            args: [grid_id, layer]
        })
        // TODO: close all interfaces
        emit('custom-event', {
            event: 'remove-layer-meta',
            args: [grid_id, layer]
        })
        remove_all_ux(layer)
        }
    else {return}
}

// can pass e ?
const call_new_layer = (layer) => nextTick(() => {
    if(gridPixel.value) {gridPixel.value.new_layer(layer)}
    else {return}
    
})

// Remove all UXs for a given overlay id
const remove_all_ux = (id) => uxs.value = uxs.value.filter(x => x.overlay.id !== id)
const modify = (ux, obj = {}) => {
// already unwrapped
    for (let k in obj) {
        if (k in ux) {
            ux[k] = obj[k];

        }
    }
}
const on_ux_event = (d, target) => {
            if (d.event === 'new-interface') {
                if (d.args[0].target === target) {
                    d.args[0].vars = d.args[0].vars || {}
                    d.args[0].grid_id = d.args[1]
                    d.args[0].overlay_id = d.args[2]
                    uxs.push(d.args[0])
                    // rerender component
                }
            }
            else if (d.event === 'close-interface') {
                uxs.value = uxs.values.filter(x => x.uuid !== d.args[0])
            }
            else if (d.event === 'modify-interface') {
                let ux = uxs.value.filter(x => x.uuid === d.args[0])

                if (ux.length) {
                    modify(ux[0], d.args[1])
                }
            }
            else if (d.event === 'hide-interface') {
                let ux = uxs.value.filter(x => x.uuid === d.args[0])

                if (ux.length) {
                    ux[0].hidden = true
                    modify(ux[0], { hidden: true })
                }
            }
            else if (d.event === 'show-interface') {
                let ux = uxs.value.filter(x => x.uuid === d.args[0])

                if (ux.length) {
                    modify(ux[0], { hidden: false })
                }
            }
            else {
                return d
            }
        }

/* -------------------------------------------------------------------------- */
/*                                  computed                                  */
/* -------------------------------------------------------------------------- */
const makeGridId = computed(() => `${props.tv_id}-grid-${props.grid_id}-canvas`)
const makeGridClass = computed(() => `trading-vue-grid-${props.grid_id}`)
const divStyle = computed(() => {
    const id = props.grid_id
    const layout = props.layout.grids[id]
    let y = layout.offset || 0
    let x = 0
    return {'position': 'absolute','left': `${x}px`,'top': `${y}px`}
})
const is_active = computed(() => {
    // props.cursor.t may not be set on mobile setting (cursor.mode === 'explore')
    return (props.cursor.t !== undefined || props.cursor.x !== undefined) && props.cursor.grid_id === props.grid_id
})

/* -------------------------------------------------------------------------- */
/*                                    watch                                   */
/* -------------------------------------------------------------------------- */
watch([()=>props.layout.grids[props.grid_id].width, ()=>props.layout.grids[props.grid_id].height], ([nw, nh], [ow, oh]) => {
    // debounceSetup.value()
  gridPixel.value.setup()
});

watch(()=>props.range,() => {
    // debounceUpdate.value()
    nextTick(() => gridPixel.value.update()) // TODO : monitor when tick update
},
  { deep: true } // Enable deep watching for all sources
);

watch(()=>props.cursor,() => {
    // debounceUpdate.value()
    if (!props.cursor.locked) gridPixel.value.update()
},
  { deep: true } // Enable deep watching for all sources
);

watch(()=>props.shaders,() => {
    // debounceUpdate.value()
    gridPixel.value.update()
})

// watch when extra indicator module was specified
watch(()=>props.overlays,(novs, oovs) => {
    overlayUpdate(novs)
},
  { deep: true } // Enable deep watching for all sources
);


/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(()=>{
    // console.log('props.data')
    // console.log(props.data)
    // also concat tool from props.overlays
    let tools_core = CoreRegisteredTools.map(({ use_for, info }) => ({ use_for:use_for[0], info })); 

    // emit components back to Ancestor 'TradingVue.vue'
    emit('custom-event', { event: 'register-tools', args: tools_core})
    // received event from on_ux_event 'TradingVue.vue'
    // this.$on('custom-event', e => this.on_ux_event(e, 'grid'))

    let payload = {
        wmode:props.config.SCROLL_WHEEL, // came from  constant.js
        minzoom:props.config.MIN_ZOOM, // came from  constant.js
        maxzoom:props.config.MAX_ZOOM, // came from  constant.js
        zoom_mode:props.config.ZOOM_MODE, // came from  constant.js
        emitter: emit, // emitter from Vue component, used to emit events to Chart.vue
        Gprops:{
            font:props.font, // check
            colors:props.colors, // check
            cursor:props.cursor, // check
            layout:props.layout, // check
            range:props.range, // check
            data:props.sub, // check
            tv_id:props.tv_id, // or sidebar id ?
            grid_id:props.grid_id, // check
            shaders:props.shaders, // check
            interval:props.interval // Number
        }
    }
    gridPixel.value = markRaw(new Grid(gridCanvas.value||null, payload))
    gridPixel.value.setup()
    gridPixel.value.addListeners()

    // bind keyboard events
    // TODO: make sure keyboard events are not duplicated on multiple grids
    // and properly propagate to child components
    document.addEventListener('keydown', _onKeydown)
    document.addEventListener('keyup', _onKeyup)
    document.addEventListener('keypress', _onKeypress)

    // clean up on unmount
    addCleanup(() => {
        gridPixel.value.removeListener()
        // keyboard_events.value = null
        layer_events.value = null
        document.removeEventListener('keydown', _onKeydown)
        document.removeEventListener('keyup', _onKeyup)
        document.removeEventListener('keypress', _onKeypress)
    })
})

// export default {name: 'Grid'}

</script>

<style>
    .hidden {display: none;}
</style>