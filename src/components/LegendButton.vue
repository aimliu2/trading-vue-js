<template>
    <img class="t-vue-lbtn" :src="base64"
        :id="uuid" :style="{
            width: config.L_BTN_SIZE + 'px',
            height: config.L_BTN_SIZE + 'px',
            margin: config.L_BTN_MARGIN
        }"
        @click="onclick">
</template>

<script setup>
// run in test case later, but for now, we can import the icons directly
import Icons from '../stuff/icons.json'
import { computed } from 'vue'

const props = defineProps({
    'id':String, 
    'tv_id':String, 
    'grid_id':Number, 
    'ov_id':String, 
    'index':Number, 
    'display':Boolean,
    'icon':String, 
    'config':Object
})

/**
 * @name emit
 */
const emit = defineEmits(['legend-button-click'])


/**
 * @name methods
 * @function onclick
 * @desc Emits a 'legend-button-click' event with the button id, data type, data index, grid id, and overlay id as payload. The data type is determined by whether the grid id is 0 (onchart) or not (offchart). The data index is taken from the component's props. The grid id and overlay id are also taken from the component's props.
 */
const onclick = () => {
    emit('legend-button-click', {
        button: props.id,
        type: data_type.value, // computed
        dataIndex: data_index.value,
        grid: props.grid_id,
        overlay: props.ov_id,
    })
}

/**
 * @name computed
 * @function base64
 * @desc Computes the base64 string for the icon to be displayed on the legend button. It first checks if the 'icon' prop is provided, and if so, it uses that as the base64 string. If the 'icon' prop is not provided, it falls back to using the 'file_name' computed property to retrieve the corresponding base64 string from the imported 'Icons' JSON object.
 */
const base64 = computed(() => props.icon || Icons[file_name.value])

/**
 * @function file_name
 * @desc Computes the file name for the icon based on the 'id' prop. If the 'id' prop is 'display', it checks the 'display' prop to determine whether to
 */
const file_name = computed(() => {
    let id = props.id
    if (props.id === 'display') {
        id = props.display ? 'display_on' : 'display_off'
    }
    return id + '.png'
})

/**
 * @function uuid
 * @desc Computes a unique identifier for the legend button based on the 'tv_id', 'grid_id', and 'ov_id' props. The format of the identifier is '{tv_id}-
 */
const uuid = computed(() => {
    let tv = props.tv_id
    let gr = props.grid_id
    let ov = props.ov_id
    return `${tv}-btn-g${gr}-${ov}`
})

/**
 * @function data_type
 * @desc Computes the data type for the legend button based on the 'grid_id' prop. If the 'grid_id' is 0, it returns 'onchart'; otherwise, it returns 'offchart'.
 */
const data_type = computed(() => props.grid_id === 0 ? "onchart" : "offchart")

/**
 * @function data_index
 * @desc Computes the data index for the legend button based on the 'index' prop.
 */
const data_index = computed(() => props.index)

// export default {name: 'LegendButton'}
</script>

<style>
.t-vue-lbtn {
    z-index: 100;
    pointer-events: all;
    cursor: pointer;
}
</style>
