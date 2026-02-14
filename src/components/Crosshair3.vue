<template></template>

<script setup>
import Crosshair from '@component-js/crosshair3.js'
// import emitter from '../../src/helpers/eventbus.js'
import {ref, watch} from 'vue'

// vue emitter event up
const emit = defineEmits(['new-grid-layer', 'redraw-grid'])

// internal reactive state
const ch = ref(); // CrossHair Object

// props from parent
const props = defineProps({
    cursor: Object, // required
    colors: Object,
    layout: Object,
    interval: Number,
    sub: Array,
    font: String,
    config: Object,
})

// methods
const createCrosshair = () =>{
    ch.value = new Crosshair(props)

    // New grid overlay-renderer descriptor.
    // Should implement draw() (see Spline.vue)
    // emitter.emit('new-grid-layer', {name: 'crosshair',renderer: ch.value}) // does not work, event did not trigger - need to use vue emit
    emit('new-grid-layer', {name: 'crosshair',renderer: ch.value}); // Event up with data

}

// watch
watch(
  () => props.cursor, // can't decompose props, for now
  () => {
    if (!ch.value) createCrosshair();
    
    // Explore = default mode on mobile
    let explore = (props.cursor.mode === 'explore')

    if (!props.cursor.x || !props.cursor.y) { //
        ch.value.hide(); // off chart hide Crosshair
        emit('redraw-grid')
        return
    }

    ch.value.visible = !explore
  }
  ,{
    deep: true // Something in cursor must be deeply watch
  }
);

// export default {name: 'Crosshair'} cannot use in setup
</script>
