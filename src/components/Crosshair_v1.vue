<template></template>

<script setup>
// TODO : upgrade watch and rerender to use draw method of Crosshair instead of creating new instance on every change
import Crosshair from '@component-js/crosshair.js'
import {ref, watch, markRaw} from 'vue'

/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
/* ----------------------------- state-variables ---------------------------- */
const ch = ref()
/* --------------------------------- emitter -------------------------------- */
const emit = defineEmits(['new-grid-layer', 'redraw-grid'])

/* -------------------------------------------------------------------------- */
/*                                    props                                   */
/* -------------------------------------------------------------------------- */
const props = defineProps({
    cursor: Object, // required
    colors: Object,
    layout: Object,
    interval: Number,
    sub: Array,
    font: String,
    config: Object,
})

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const createCrosshair = () =>{
    ch.value = new Crosshair(props)
    emit('new-grid-layer', {name: 'crosshair',renderer: ch.value}); // Event up with data

}

/* -------------------------------------------------------------------------- */
/*                                    watch                                   */
/* -------------------------------------------------------------------------- */
watch(
  () => props.cursor,
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
    deep: true // x,y coordinates are nested in cursor object, so we need deep watch
  }
);

// export default {name: 'Crosshair'}
</script>
