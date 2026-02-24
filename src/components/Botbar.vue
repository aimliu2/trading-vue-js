<template>
    <div class="trading-vue-botbar" :style="divStyle">
        <!-- props.rerender are already watched-->
         canvas will be directly mutated, using uplift
        <canvas
            ref="botbarCanvas"
            :id="makeCanvasId"
        ></canvas>
    </div>
</template>

<script setup>
// TODO : implement mouse event later
// @mousemove ="e => botbarPixel.value.mousemove(e)"
// @mouseout = "e => botbarPixel.value.mouseout(e)"
// @mouseup = "e => botbarPixel.value.mouseup(e)"
// @mousedown = "e => botbarPixel.value.mousedown(e)"

import Botbar from '@composables/cBotbar.js' 
import { debounce } from '@stuff/utilities';
import { markRaw, shallowRef, ref, computed, onMounted, watch } from 'vue';
import shaders from '../mixins/shaders';

/**
 * @name props
 */
const props = defineProps({
    sub:Array, // data
    layout:Object, // layout
    range:Object, // range
    interval:Number, // interval
    cursor:Object, // cursor
    colors:Object, // colors
    font:Object, // font
    width:Number, // width of canvas
    height:Number, // height of canvas
    rerender:Number, // should be number
    tv_id:String, // id of trading view instance
    config:Object, // config from parent, contains PANHEIGHT
    shaders:Array, // shaders from parent
    timezone:String // timezone from parent
})

/**
 * @name state-var
 * @desc assign this.renderer to botbarRenderer (Botbar class object)
 */
const botbarCanvas = ref(); // HTMLcanvasElement
const botbarPixel = shallowRef(null); // assign markRaw @onMounted
const debounceSetup = shallowRef(null); // assign markraw Setup @onMounted
const debounceUpdate = shallowRef(null); // assign markraw Update @onMounted


/**
 * @function makeCanvasId
 * @return {object} id of bottom bar canvas
 */
const makeCanvasId = computed(() => `${props.tv_id}-botbar-canvas`)

/**
 * @function divStyles
 * @desc add style to div parent of canvas
 */
const divStyle = computed(() => {
    let y = props.layout.botbar.offset || 0
    return {'position': 'absolute','left': '0px','top': `${y}px`}
})

 /**
  * @name life-cycle hook
  */
 onMounted(()=>{
    // init setup
    let sett = props.layout.botbar
    sett.width = props.width
    sett.height = props.height

    // set payload
    let payload = {
        panheight:props.config.PANHEIGHT, // came from  constant.js
        bot_shaders:props.shaders.filter(x => x.target === 'botbar'), //bot_shaders
        bbprops:{
            font:props.font,
            colors:props.colors,
            cursor:props.cursor,
            layout:props.layout,
            timezone:props.timezone,
            interval:props.interval,
            layout:props.layout,
            range:props.range,
            data:props.sub
        }
    }
    // create raw object, direct DOM update
    botbarPixel.value = markRaw(new Botbar(botbarCanvas, payload)) // mutate bottom bar with this class
    botbarPixel.value.setup() // manually call set up
    debounceSetup.value = debounce(botbarPixel.value.setup(),200); // put function into shallowref
    debounceUpdate.value = debounce(botbarPixel.value.update(),200); // put function into shallowref
 })


/**
 * @name watch
 * @desc watch width and height of props then trigger redraw
 */
watch([props.width, props.height, props.rerender], ([nw, nh, nr], [ow, oh, or]) => {
  // mutate layout properties, then update chart
  props.layout.botbar.width = nw ? nw : ow
  props.layout.botbar.height = nh ? nh : oh
  // use debounce, prevent rapid expensive compute
  debounceSetup.value()
});

/**
 * @name watch2
 * @desc deep watch on range and cursor
 */
watch([()=>props.range, ()=>props.cursor],([nr, nc], [or, oc]) => {
    console.log('Range/Cursor changed');
    debounceUpdate.value()
},
  { deep: true } // Enable deep watching for all sources
);


// export default {name: 'Botbar'}

</script>

<style>
/* obviously */
.trading-vue-botbar {
    position: relative !important;
}
</style>
