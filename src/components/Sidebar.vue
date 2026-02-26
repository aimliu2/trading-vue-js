<template>
    <div :class="makeSidebarClass" :style="divStyle">
        <!-- props.rerender are already watched-->
        <canvas
            ref="sidebarCanvas"
            :id="makeSidebarId"
        >This is canvas side bar, showing price</canvas>
    </div>
</template>



<script setup>
import Sidebar from '@composables/cSidebar.js'
import { markRaw, shallowRef, ref, computed, onMounted, watch } from 'vue';
import UseCleanup from '@composables/cUseCleanup.js'
// @mousemove ="e => sidebarPixel.value.mousemove(e)"
// @mouseout = "e => sidebarPixel.value.mouseout(e)"
// @mouseup = "e => sidebarPixel.value.mouseup(e)"
// @mousedown = "e => sidebarPixel.value.mousedown(e)"

/**
 * @name state-var
 * @desc assign this.renderer to sidebarRenderer (Sidebar class object)
 */
const sidebarCanvas = ref(); // HTMLcanvasElement
const sidebarPixel = shallowRef(null); // assign markRaw @onMounted
const debounceSetup = shallowRef(null); // assign markraw Setup @onMounted
const debounceUpdate = shallowRef(null); // assign markraw Update @onMounted

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
    grid_id:Number, // id of grid, used to identify which sidebar it is when emitting events
    rerender:Number, // should be number
    y_transform:Object, // y_transform from Chart.vue, used to sync with Grid.vue
    tv_id:String, // id of trading view instance
    config:Object, // config from parent, contains PANHEIGHT
    shaders:Array, // shaders from parent
})

/**
 * @name internal-constant
 */
const { addCleanup } = UseCleanup()

/**
 * @name emit
 */
const emit = defineEmits(['sidebar-transform']) // emit to Chart.vue, which will further emit 'grid-transform' event to Grid.vue, and then Grid.vue will update its layout params and redraw the main canvas.


/**
 * @name computed
 * @function makeSidebarId
 * @return {string} id of sidebar canvas
 */
const makeSidebarId = computed(() => `${props.tv_id}-sidebar-${props.grid_id}-canvas`)

/**
 * @function makeSidebarClass
 * @return {string} class of sidebar canvas
 */
const makeSidebarClass = computed(() => `trading-vue-sidebar-${props.grid_id}`)

/**
 * @function divStyles
 * @desc add style to div parent of canvas
 */
// wrong
const divStyle = computed(() => {
    let id = props.grid_id
    let layout = props.layout.grids[id]
    let y = layout.offset || 0
    let x = layout.width 
    return {'position': 'absolute','left': `${x}px`,'top': `${y}px`}
})

/**
 * @name watch
 * @desc watch width and height of props then trigger redraw
 */
// if attr w,h change trigger update
watch([()=>props.width, ()=>props.layout.grids[props.grid_id], ()=>props.rerender], ([nw, nh, nr], [ow, oh, or]) => {
    // debounceSetup.value()
  sidebarPixel.value.setup()
});

/**
 * @name watch2
 * @desc deep watch on range and cursor
 */
watch([()=>props.range, ()=>props.cursor],([nr, nc], [or, oc]) => {
    // debounceUpdate.value()
    sidebarPixel.value.update()
},
  { deep: true } // Enable deep watching for all sources
);


 /**
  * @name life-cycle hook
  */
 onMounted(()=>{
    // init setup
    // let sett = props.layout.botbar
    // sett.width = props.width
    // sett.height = props.height

    // set payload
    let payload = {
        panheight:props.config.PANHEIGHT, // came from  constant.js
        side:'right', // only right sidebar for now, can be extended to left in the future
        emitter: emit, // emitter from Vue component, used to emit events to Chart.vue
        sbprops:{
            font:props.font, // check
            colors:props.colors, // check
            cursor:props.cursor, // check
            layout:props.layout, // check
            range:props.range, // check
            data:props.sub, // check
            tv_id:props.tv_id, // or sidebar id ?
            grid_id:props.grid_id, // check
            shaders:props.shaders
        }
    }
    // create raw object, direct DOM update
    sidebarPixel.value = markRaw(new Sidebar(sidebarCanvas.value||null, payload)) // mutate side bar with this class
    sidebarPixel.value.setup() // Canvas
    // not GPU expensive, no need to debounce
    // debounceSetup.value = markRaw(debounce(sidebarPixel.value.setup, 100))
    // debounceUpdate.value = markRaw(debounce(sidebarPixel.value.update, 100))
    sidebarPixel.value.addListeners() // add event listeners for mouse events

    // clean up on unmount
    addCleanup(() => sidebarPixel.value.removeListeners())
 })



// export default {name: 'Sidebar',}

</script>
