<template>
    <div class="tvjs-the-tip"
        v-html="props.data.text" @mousedown="emit('remove-me')"
        :style="style">
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import useCleanup from '@composables/cUseCleanup.js'

/**
 * @name internal-const
 */
const {addCleanup} = useCleanup()
const popupTime = 1000 //ms
let timeoutTips;

/**
 * @name props
 */
const props = defineProps({
     data:Object // set from TradingVue.vue
})

/**
 * @event emit
 */
const emit = defineEmits(['remove-me'])

 /**
 * @function style
 * @name computed
 * @desc return style
 */
const style = computed(()=>{
    return {background: props.data.color}
})

/**
 * @name life-cycle hook
 */
onMounted(()=>{
    // show tips for 2 secs
    timeoutTips = setTimeout(() => emit('remove-me'), popupTime)

    // cleanup when unmount
    addCleanup(()=> console.log('Cleanup from the tip'))
    addCleanup(()=> clearTimeout(timeoutTips))
})

// export default {name: 'TheTip'}
</script>

<style>
.tvjs-drift-enter-active {
    transition: all .3s ease;
}
.tvjs-drift-leave-active {
    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.tvjs-drift-enter, .tvjs-drift-leave-to
{
    transform: translateX(10px);
    opacity: 0;
}
.tvjs-the-tip {
    position: absolute;
    width: 200px;
    text-align: center;
    z-index: 10001;
    color: #ffffff;
    font-size: 1.5em;
    line-height: 1.15em;
    padding: 10px;
    border-radius: 3px;
    right: 70px;
    top: 10px;
    text-shadow: 1px 1px black;
}
</style>
