/**
 * Composable C1 - expose the state and/or actions. A stateful composable factory
 * Resize application to fit browser's window size
 * 
 * @state {width:number, height:number}
 * @returns state - initial = current window size
 */

import { reactive, onMounted, onUnmounted } from 'vue';

const windowState = () => {
  const state = reactive({
    width: 800,
    height: 421
  })

  const onResize = () => {
    // whenever onResize is called, state will automatically mutated
      state.width = window.innerWidth
      state.height = window.innerHeight
  }

  // executed on DOM
  onMounted(() => {
    // init state
    state.width = window.innerWidth
    state.height = window.innerHeight
    window.addEventListener('resize', () => onResize())
  })
  onUnmounted(() => window.removeEventListener('resize',  () => onResize()))

  return state
}

export default windowState
