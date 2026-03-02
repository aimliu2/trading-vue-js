<template>
<!-- Listens to native keyboard events,propagates to all KeyboardListeners -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UseCleanup from '@composables/cUseCleanup.js'

/* -------------------------------------------------------------------------- */
/*                                  constant                                  */
/* -------------------------------------------------------------------------- */
const { addCleanup } = UseCleanup()

/* -------------------------------- state-var ------------------------------- */
const _listeners = ref();

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const register = (listener) => {
    _listeners.value[listener.id] = listener
    console.log(`registered ${listener.id}`)
}

const remove = (listener) => {delete _listeners.value[listener.id]}
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

/* -------------------------------------------------------------------------- */
/*                                  onmounted                                 */
/* -------------------------------------------------------------------------- */
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
