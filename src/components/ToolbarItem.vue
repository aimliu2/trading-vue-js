
<template>
    <div :class="['trading-vue-tbitem', selected ? 'selected-item' : '']"
        @click="emit_selected('click')"
        @mousedown="mousedown"
        @touchstart="mousedown"
        @touchend="emit_selected('touch')"
        :style="item_style">
        <div class="trading-vue-tbicon tvjs-pixelated"
            :style="icon_style">
        </div>
        <div class="trading-vue-tbitem-exp" v-if="data.group"
            :style="exp_style"
            @click="exp_click"
            @mousedown="expmousedown"
            @mouseover="expmouseover"
            @mouseleave="expmouseleave">
            ᐳ
        </div>
        <item-list :config="props.config" :items="props.data.items"
            v-if="show_exp_list" :colors="props.colors" :dc="props.dc"
            @close-list="close_list"
            @item-selected="emit_selected_sub"/>
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import ItemList from '@components/ItemList.vue'
import Utils from '@stuff/utils.js'

/**
 * @constant state-var
 */
const exp_hover = ref(false)
const show_exp_list = ref(false)
const sub_item = ref(null)
const click_start = ref(null) // timestamp
const click_id = ref(null)

/**
 * @constant props
 * @desc tv_id:String
 */
// is props tv_id:String needed
const props = defineProps({
    config:Object,
    data:Object,
    dc:Object,
    colors:Object,
    selected:Boolean,
    subs:Object
})

/**
 * emitter
 * @constant emit
 */
const emit = defineEmits(['item-selected']);

// methods
/**
 * @function mousedown
 * @desc seperate click and click-hold activity
 */
const mousedown = (e) => {
    click_start.value = Utils.now();
    // event fired multiple times if not set timeout ?
    click_id.value = setTimeout(() => {show_exp_list.value = true}, props.config.TB_ICON_HOLD) // 420ms
}
/**
 * @function mouseover
 * @desc hover
 */
const expmouseover = () => {exp_hover.value = true}
/**
 * @function mouseleave
 * @desc mouse leave
 */
const expmouseleave = () => {exp_hover.value = false}
/**
 * @function mousedown
 * @desc mouse click
 */
const expmousedown = (e) => {if (show_exp_list.value) e.stopPropagation()}
/**
 * @function emit_selected
 */
const emit_selected = (src) => {
    if (Utils.now() - click_start.value > props.config.TB_ICON_HOLD) return
    clearTimeout(click_id.value)
    //if (Utils.is_mobile && src === 'click') return
    // TODO: double firing
    if (!props.data.group) {
        emit('item-selected', props.data)
    } else {
        let item = sub_item.value || props.data.items[0]
        emit('item-selected', item)
    }
}
/**
 * @function emit_selected_sub
 * @desc chain-emitted event from the child
 */
const emit_selected_sub = (item) => {
    emit('item-selected', item)
    sub_item.value = item
}
/**
 * @function exp_click
 * @desc expand button clicked
 */
const exp_click = (e) => {
    if (!props.data.group) return
    e.cancelBubble = true
    show_exp_list.value = !show_exp_list.value
}
/**
 * @function close_list
 * @desc close expansion panel
 */
const close_list = () => {
    show_exp_list.value = false
}

// computed
/**
 * @function item_style
 * @desc
 */
const item_style = computed(()=> {
            // if (props.data.type === 'System:Splitter') {
            //     return this.splitter // splitter spcific css, which is ?
            // }
            let conf = props.config
            let im = conf.TB_ITEM_M
            let m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im
            let s = conf.TB_ICON + im * 2
            let b = exp_hover.value ? 0 : 3
            return {
                'width': `${s}px`,
                'height': `${s}px`,
                'margin': `8px ${m}px 0px ${m}px`,
                'border-radius': `3px ${b}px ${b}px 3px`
            }
        }
)
/**
 * @function icon_style
 * @desc
 */
const icon_style = computed(() => {
            if (props.data.type === 'System:Splitter') {
                return {}
            }
            let conf = props.config
            let br = conf.TB_ICON_BRI
            let sz = conf.TB_ICON
            let im = conf.TB_ITEM_M
            let ic = sub_item.value ? sub_item.value : props.data.icon
            return {
                'background-image': `url(${ic})`,
                'width': `${sz}px`,
                'height': `${sz}px`,
                'margin': `${im}px`,
                'filter': `brightness(${br})`
            }
        }
)
/**
 * @function exp_style
 * @desc
 */
const exp_style = computed(() => {
            let conf = props.config
            let im = conf.TB_ITEM_M
            let s = conf.TB_ICON * 0.5 + im
            let p = (conf.TOOLBAR - s * 2) / 4
            return {
                padding: `${s}px ${p}px`,
                transform: show_exp_list.value ?
                    `scale(-0.6, 1)` :
                    `scaleX(0.6)`
            }
        }
)
/**
 * @function splitter
 * @desc
 */
const splitter = computed(() => {
            let conf = props.config
            let colors = props.colors
            let c = colors.grid
            let im = conf.TB_ITEM_M
            let m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im
            let s = conf.TB_ICON + im * 2
            return {
                'width': `${s}px`,
                'height': '1px',
                'margin': `8px ${m}px 8px ${m}px`,
                'background-color': c
            }
        }
)

// life-cycle hook
/**
 * @name onmount
 */
onMounted(()=>{
if (props.data.group) {
    let type = props.subs[props.data.group]
    let item = props.data.items.find(x => x.type === type)
    if (item) sub_item.value = item
}
})

// export default {name: 'ToolbarItem'}
</script>

<style>

/**
.trading-vue-tbitem {
}
 */

.trading-vue-tbitem:hover {
    background-color: #76878319;
}

.trading-vue-tbitem-exp {
    position: absolute;
    right: -3px;
    padding: 18.5px 5px;
    font-stretch: extra-condensed;
    transform: scaleX(0.6);
    font-size: 0.6em;
    opacity: 0.0;
    user-select: none;
    line-height: 0;
}

.trading-vue-tbitem:hover
.trading-vue-tbitem-exp {
    opacity: 0.5;
}

.trading-vue-tbitem-exp:hover {
    background-color: #76878330;
    opacity: 0.9 !important;
}

.trading-vue-tbicon {
    position: absolute;
}
.trading-vue-tbitem.selected-item > .trading-vue-tbicon,
.tvjs-item-list-item.selected-item > .trading-vue-tbicon {
     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;
}
.tvjs-pixelated {
    -ms-interpolation-mode: nearest-neighbor;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: -webkit-crisp-edges;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: pixelated;
}

</style>
