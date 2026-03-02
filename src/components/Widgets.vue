<template>
    <!-- WidgetS Layer -->
    <div class="tvjs-widgets"
        :style="{width: width+'px', height: height+'px'}">
        <component v-for="id in Object.keys(map)"
            :key="id"
            :id="id"
            :main="map[id].ctrl"
            :data="map[id].data"
            :tv="tv"
            :dc="dc"
            v-bind:is="initw(id)">
        </component>
    </div>
</template>

<script setup>

/* -------------------------------------------------------------------------- */
/*                                  constants                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- props --------------------------------- */
const props = defineProps({
    width:Number,
    height:Number,
    map:Object,
    tv:Object, // don't know what to pass, have to see widget constructor
    dc:Object
})
/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const initw = (id) => props.map[id].cls // init widget

// export default {name: 'Widgets'}
</script>

<style>
.tvjs-widgets {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
}
</style>
