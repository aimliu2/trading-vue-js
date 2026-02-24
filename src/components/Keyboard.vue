<template>
<!-- Listens to native keyboard events,propagates to all KeyboardListeners -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UseCleanup from '@composables/cUseCleanup.js'

/**
 * @name constant
 */
const { addCleanup } = UseCleanup()

/**
 * @name state-var
 */
const _listeners = ref();

/**
 * @name methods
 * @function register
 * @desc add event listener to keyboard state var on 'this chart'
 */
const register = (listener) => {
    _listeners.value[listener.id] = listener
    console.log(`registered ${listener.id}`)
}

/**
 * @function remove
 * @desc remove event listener to keyboard state var on 'this chart'
 */
const remove = (listener) => {delete _listeners.value[listener.id]}

/**
 * @function keydown
 * @desc send keydown from window to component ?
 */
const keydown = (event) => {
    for (let id in _listeners.value) {
        let l = _listeners.value[id]
        if (l && l.keydown) {
            l.keydown(event)
        } else {
            console.warn(`No 'keydown' listener for ${id}`)
        }
    }
}

/**
 * @function keyup
 * @desc send keyup from window to component ?
 */
const keyup =  (event) => {
    for (var id in _listeners.value) {
        let l = _listeners.value[id]
        if (l && l.keyup) {
            l.keyup(event)
        } else {
            console.warn(`No 'keyup' listener for ${id}`)
        }
    }
}

/**
 * @function keyup
 * @desc send keyup from window to component ?
 */
const keypress  = (event) => {
    for (var id in _listeners.value) {
        let l = _listeners.value[id]
        if (l && l.keypress) {
            l.keypress(event)
        } else {
            console.warn(`No 'keypress' listener for ${id}`)
        }
    }
}

/**
 * @name life-cycle hook
 */
onMounted(()=>{
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('keypress', keypress)
    _listeners.value = {}

    // cleanup
    addCleanup(()=>window.removeEventListener('keydown', keydown))
    addCleanup(()=>window.removeEventListener('keyup', keyup))
    addCleanup(()=>window.removeEventListener('keypress', keypress))
})

// export default {name: 'Keyboard',}

</script>
