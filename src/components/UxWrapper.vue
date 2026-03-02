
<template>
<!-- Wrapper window for Interface objects -->

<!-- TODO UxWrapper
    + static pin values -- for what, put in object tree
    + wrapper window controls -- obj tree window
    * drag'n'drop -- no needed
    * behaviour on screen edges (h/v): (pass, stick, close)
    + background (trasnparent, backColor by default, etc...)
    * fullscreen mode
    + component drawing speed optimization (debounce updates, etc...)
-->
<div class="trading-vue-ux-wrapper" v-if="visible"
    :id="`${uuid.value}`"
    :style="style"
    :ref="UxWrapper"
    >
    <component
        @custom-event="on_custom_event"
        :ux="ux" :updater="updater" :wrapper="wrapper"
        :colors="colors"
        v-bind:is="ux.component">
    </component>
    <div v-if="ux.show_pin"
        :style="pin_style"
        class="tvjs-ux-wrapper-pin">
    </div>
    <div class="tvjs-ux-wrapper-head"
        v-if="ux.win_header !== false">
        <div class="tvjs-ux-wrapper-close"
            @click="close"
            :style="btn_style"
        >×</div>
    </div>
</div>
</template>

<script setup>
import useCleanup from '@composables/cUseCleanup.js'
import {apply_opacity} from '@stuff/utilities.js'
import {ref,reactive, watch, computed, onMounted, onUnmounted} from 'vue'



/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
const initState = {
    x: 0, y: 0,
    w: 0, h: 0,
    visible: true
}
/* ----------------------------- state-variables ---------------------------- */
const state = reactive(initState)
const UxWrapper = ref();
const { addCleanup } = UseCleanup()
/* ---------------------------------- emit ---------------------------------- */
const emit = defineEmits(['custom-event'])
const props = defineProps({
    ux: Object,
    updater: Number,
    colors: Object,
    config: Object
})

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const update_position = () => {
    if (props.ux.hidden) return
    let lw = layout.value.width
    let lh = layout.value.height
    let pin = props.ux.pin
    let getX, getY

    switch (pin[0]) {
        case 'cursor':
            getX = props.ux.overlay.cursor.x
            break
        case 'mouse':
            getX = mouse.value.x
            break
        default:
            if (typeof pin[0] === 'string') {
                getX = parse_coord(pin[0], lw)
            } else {
                getX = layout.value.t2screen(pin[0])
            }
    }
    switch (pin[1]) {
        case 'cursor':
            getY = props.ux.overlay.cursor.y
            break
        case 'mouse':
            getY = mouse.value.y
            break
        default:
            if (typeof pin[1] === 'string') {
                getY = parse_coord(pin[1], lh)
            } else {
                getY = layout.value.$2screen(pin[1])
            }
    }
    state.x = getX + ox.value
    state.y = getY + oy.value
}

/**
 * @example
 * parse_coord('50%', 200) // => 100
 * parse_coord('100px', 200) // => 100
 * parse_coord('50%+10px', 200) // => 110
 * parse_coord('50%-10px', 200) // => 90
 * parse_coord('50%+10px-5px', 200) // => 105
 * parse_coord('50%+10px-5px+5%', 200) // => 115
 */
const parse_coord = (str, scale) => {
    str = str.trim()
    if (str === '0' || str === '') return 0
    // recursive parsing of operations
    let plus = str.split('+')
    if (plus.length === 2) {return (parse_coord(plus[0], scale) + parse_coord(plus[1], scale))}
    let minus = str.split('-')
    if (minus.length === 2) {return (parse_coord(minus[0], scale) - parse_coord(minus[1], scale))}
    let per = str.split('%')

    if (per.length === 2) {
        return scale * parseInt(per[0]) / 100
    }
    let px = str.split('px')
    if (px.length === 2) {
        return parseInt(px[0])
    }
    return undefined
}

const mousemove = () => {
    update_position()
    state.visible = true
}

const mouseout = () => {
    if (props.ux.pin.includes('cursor') ||
        props.ux.pin.includes('mouse'))
        state.visible = false
}       

const on_custom_event = (event) => {
    emit('custom-event', event)
    if (event.event === 'modify-interface') {
        if (this.self) {
            state.w = this.self.offsetWidth
            state.h = this.self.offsetHeight
        }
        update_position()
    }
}

const close = () => {
    emit('custom-event', {
        event: 'close-interface',
        args: [props.ux.uuid]
    })
}

/* -------------------------------------------------------------------------- */
/*                                  computed                                  */
/* -------------------------------------------------------------------------- */
const layout = computed(() => props.ux.overlay.layout)
const settings = computed(() => props.ux.overlay.settings)
const uuid = computed(() => `tvjs-ux-wrapper-${props.ux.uuid}`)
const mouse = computed(() => props.ux.overlay.mouse)
const style = computed(() => {
    let st = {
        'display': props.ux.hidden ? 'none' : undefined,
        'left': `${state.x}px`,
        'top': `${state.y}px`,
        'pointer-events': props.ux.pointer_events || 'all',
        'z-index': z_index.value
    }
    if (props.ux.win_styling !== false)     
        st = Object.assign(st, {
            'border': `1px solid ${props.colors.grid}`,
            'border-radius': '3px',
            'background': `${background.value}`,
        })
    return st
})
const pin_style = computed(() => {
    return {
        'left': `${ -ox.value }px`,
        'top': `${ -oy.value }px`,
        'background-color': props.ux.pin_color
    }
})
const btn_style = computed(() => {
    return {
        'background': `${inactive_btn_color.value}`,
        'color': `${inactive_btn_color.value}`,
    }
})
const pin_pos = computed(() => props.ux.pin_position ? props.ux.pin_position.split(',') : ['0','0'])
const ox = computed(() => {
    if (pin_pos.value.length !== 2) return undefined
    let x = parse_coord(pin_pos.value[0], state.w)
    return -x
})
const oy = computed(() => {
    if (pin_pos.value.length !== 2) return undefined
    let y = parse_coord(pin_pos.value[1], state.h)
    return -y
})
const z_index = computed(() => {
    let base_index = settings.value['z-index'] ||
        settings.value['zIndex']  || 0
    let ux_index = props.ux.z_index || 0
    return base_index + ux_index
})
const background = computed(() => {
    let c = props.ux.background || props.colors.back
    return Utils.apply_opacity(c,props.ux.background_opacity ||props.config.UX_OPACITY)
})
const inactive_btn_color = computed(() => props.ux.inactive_btn_color || props.colors.grid)
const wrapper = computed(() => {
    return {
        x: state.x,
        y: state.y,
        pin_x: state.x - ox.value,
        pin_y: state.y - oy.value
    }
})

/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(() => {
    //bind mouse events
    mouse.value.on('mousemove', mousemove())
    mouse.value.on('mouseout', mouseout())

    // get this compoent from ref="UxWrapper"
    state.w = UxWrapper.value.offsetWidth // TODO: => width: "content"
    state.h = UxWrapper.value.offsetHeight // TODO: => height: "content"
    update_position()

    addCleanup(() => {
        mouse.value.off('mousemove', mousemove())
        mouse.value.off('mouseout', mouseout())
    })
})

/* -------------------------------------------------------------------------- */
/*                                    watch                                   */
/* -------------------------------------------------------------------------- */
watch(props.updater, () => update_position())

// export default {name: 'UxWrapper'}

</script>
<style>
    .trading-vue-ux-wrapper {
        position: absolute;
        display: flex;
    }
    .tvjs-ux-wrapper-pin {
        position: absolute;
        width: 9px;
        height: 9px;
        z-index: 100;
        background-color: #23a776;
        border-radius: 10px;
        margin-left: -6px;
        margin-top: -6px;
        pointer-events: none;
    }
    .tvjs-ux-wrapper-head {
        position: absolute;
        height: 23px;
        width: 100%;
    }
    .tvjs-ux-wrapper-close {
        position: absolute;
        width: 11px;
        height: 11px;
        font-size: 1.5em;
        line-height: 0.5em;
        padding: 1px 1px 1px 1px;
        border-radius: 10px;
        right: 5px;
        top: 5px;
        user-select: none;
        text-align: center;
        z-index: 100;
    }
    .tvjs-ux-wrapper-close-hb {

    }
    .tvjs-ux-wrapper-close:hover {
        background-color: #FF605C !important;
        color: #692324 !important;
    }
    .tvjs-ux-wrapper-full {

    }
</style>
