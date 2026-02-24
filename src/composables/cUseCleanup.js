import { onUnmounted } from 'vue'
import {isFunction} from '@stuff/utilities.js'

/**
 * @module useCleanup
 * @desc - composable: auto activate these function when unmount. prevent memory leak
 * @returns {fn} addCleanup
 * 
 * @example
 * 
 * ```js
 * // timeinterval
 * import { onMounted } from 'vue';
 * import { useCleanup } from './useCleanup'
 * 
 * let intervalId;
 * const { addCleanup } = useCleanup()
 *
 * onMounted(() => {
 *  intervalId = setInterval(() => {
 *    console.log('Timer running');
 *  }, 1000);
 *
 *  addCleanup(()=>clearInterval(intervalId))
 * });
 * ```
 * 
 * ```js
 * import { onMounted } from 'vue'
 * import { useCleanup } from './useCleanup'
 * 
 * const { addCleanup } = useCleanup()
 * 
 * onMounted(() => {
 *   const handler = () => console.log('Resized')
 *   window.addEventListener('resize', handler)
 *   
 *   // Register cleanup, must be factory function
 *   addCleanup(() => window.removeEventListener('resize', handler))
 * })
 * ```
 */
const useCleanup = () => {
  const cleanups = []
  
  // Register a function to be called on unmount
  // only factory function works ?
  const addCleanup = (fn) => cleanups.push(fn)
  
  onUnmounted(() => {
    cleanups.forEach((fn) => { // 
      isFunction(fn) ? fn() : console.log(`Clean up error : not a function got ${typeof fn}`)
    })
  })
  
  return {addCleanup}
}

export default useCleanup