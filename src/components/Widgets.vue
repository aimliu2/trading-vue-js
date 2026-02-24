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

/**
 * @name props
 */
const props = defineProps({
    width:Number,
    height:Number,
    map:Object,
    tv:Object,
    dc:Object
})

/**
 * @name methods
 * @function initw
 * @return {object} class of this widget ?
 */

const initw = (id) => {
    return props.map[id].cls
}

// export default {name: 'Widgets'}
</script>

<style>
.tvjs-widgets {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
}
</style>
