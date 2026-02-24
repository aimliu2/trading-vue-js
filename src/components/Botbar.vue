<template>
    <div class="trading-vue-botbar" :style="divStyle">
        <!-- props.rerender are already watched-->
        <canvas
            ref="botbarCanvas"
            :id="makeCanvasId"
        >This is canvas bottom bar</canvas>
    </div>
</template>

<script setup>
// TODO : implement mouse event later
// @mousemove ="e => botbarPixel.value.mousemove(e)"
// @mouseout = "e => botbarPixel.value.mouseout(e)"
// @mouseup = "e => botbarPixel.value.mouseup(e)"
// @mousedown = "e => botbarPixel.value.mousedown(e)"
// let start = performance.now();
// let duration = performance.now() - start;
// frameTime.value.push(duration);
// console.log(`Update: ${duration.toFixed(2)}ms avg: ${(frameTime.value.reduce((a,b)=>a+b)/frameTime.value.length).toFixed(2)}ms`);

import Botbar from '@composables/cBotbar.js' 
// import { debounce } from '@stuff/utilities'; // Not GPU expensive, no need to debounce, direct update is better for UX
import { markRaw, shallowRef, ref, computed, onMounted, watch } from 'vue';

/**
 * @name props
 */
const props = defineProps({
    sub:Array, // data
    layout:Object, // layout
    range:Array, // range
    interval:Number, // interval
    cursor:Object, // cursor
    colors:Object, // colors
    font:String, // font 11px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif
    width:Number, // width of canvas
    height:Number, // height of canvas
    rerender:Number, // should be number
    tv_id:String, // id of trading view instance
    config:Object, // config from parent, contains PANHEIGHT
    shaders:Array, // shaders from parent
    timezone:Number // timezone from parent
})

/**
 * @name state-var
 * @desc assign this.renderer to botbarRenderer (Botbar class object)
 */
const botbarCanvas = ref(); // HTMLcanvasElement
const botbarPixel = shallowRef(null); // assign markRaw @onMounted
const debounceSetup = shallowRef(null); // assign markraw Setup @onMounted
const debounceUpdate = shallowRef(null); // assign markraw Update @onMounted
const frameTime = ref([]) // for performance measurement

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
            data:props.sub,
            tv_id:props.tv_id // or botbar id ?
        }
    }
    // create raw object, direct DOM update
    botbarPixel.value = markRaw(new Botbar(botbarCanvas.value||null, payload)) // mutate bottom bar with this class
    botbarPixel.value.setup() // Canvas
    // not GPU expensive, no need to debounce
    // debounceSetup.value = debounce(() => botbarPixel.value.setup(),10); 
    // debounceUpdate.value = debounce(() => botbarPixel.value.update(),10);
 })


/**
 * @name watch
 * @desc watch width and height of props then trigger redraw
 */
watch([()=>props.width, ()=>props.height, ()=>props.rerender], ([nw, nh, nr], [ow, oh, or]) => {
  // mutate layout properties, then update chart
  props.layout.botbar.width = nw ? nw : ow
  props.layout.botbar.height = nh ? nh : oh
  // debounceSetup.value()
  botbarPixel.value.setup()
});

/**
 * @name watch2
 * @desc deep watch on range and cursor
 */
watch([()=>props.range, ()=>props.cursor],([nr, nc], [or, oc]) => {
    // debounceUpdate.value()
    botbarPixel.value.update()
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
