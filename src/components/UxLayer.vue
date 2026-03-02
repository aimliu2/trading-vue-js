
<template>
<!-- Layer for Interface objects -->
<span :class="`trading-vue-grid-ux-${id}`" :style="style">
    <ux-wrapper v-for="ux of uxs"
        @custom-event="on_custom_event"
        :key="ux.uuid"
        :ux="ux"
        :updater="updater"
        :colors="colors"
        :config="config">
    </ux-wrapper>
</span>
</template>

<script setup>
import UxWrapper from './UxWrapper.vue' // next 12
import { computed } from 'vue'

const props = defineProps({
    tv_id: String,
    id: Number,
    uxs: Array,
    updater: Number, // assign overlay with random number
    colors: Object,
    config: Object
})

/**
 * @name methods
 * @function on_custom_event
 * @desc Handles custom events emitted by the UxWrapper components. When a custom event is received, it emits the event to the parent component.
 * @param event 
 */
const on_custom_event = (event) => this.$emit('custom-event', event)

/**
 * @name computed
 * @function style
 * @desc Computes the style for the UxLayer component based on its properties. 
 * The style includes positioning, dimensions, z-index, pointer events, and overflow settings.
 */
const style = computed(() => {
    return {
        'top': props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
    }
})

// export default {name: 'UxLayer'}

</script>
