<template>
<span class="t-vue-lbtn-grp">
    <legend-button
        v-for="(b, i) in buttons" :key="i"
        :id="b.name || b"
        :tv_id="tv_id"
        :ov_id="ov_id"
        :grid_id="grid_id"
        :index="index"
        :display="display"
        :icon="b.icon"
        :config="config"
        v-on:legend-button-click="button_click"
    >
    </legend-button>
</span>
</template>


<script setup>
import LegendButton from './LegendButton.vue' //V3

/**
 * @name props
 * @desc Defines the properties that this component accepts. These properties are passed down to the LegendButton components and can be used to customize their behavior and appearance.
 */
const props = defineProps({
    buttons: Array, 
    tv_id: String, 
    ov_id: String,
    grid_id: Number,
    index: Number,
    display: Boolean,
    config: Object, 
})

/**
 * @name emits
 * @desc Defines the events that this component can emit. In this case, it emits a 'legend-button-click' event when a button is clicked.
 */
const emit = defineEmits(['legend-button-click'])

/**
 * @name methods
 * @function button_click
 * @desc Emits a 'legend-button-click' event with the event data when a button is clicked.
 * @param {Object} event - The event data from the button click.
 * @returns {void}
 */
const button_click = (event) => emit('legend-button-click', event)

// export default {name: 'ButtonGroup'}
</script>
<style>
.t-vue-lbtn-grp {
    margin-left: 0.5em;
}
</style>
