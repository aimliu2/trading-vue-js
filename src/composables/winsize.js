import { reactive } from 'vue';

/**
 * Composable C1 : Resize application to fit browser's window size
 * 
 * @state {width:number, height:number}
 * @action onResize - set state width, height to = browser's window width, height
 * @returns state - initial = current window size, action modified width, height with adjustment
 */
const initState = {
  width: 800, 
  height: 421
}

const windowState = (payload=initState) => {
  const state = reactive(payload) // no watcher or compute actively monitored the entire object
  /**
   * method - set state width, height to = browser's window width, height
   * @param {number} ah - adjusted height
   * @param {number} aw - adjusted width
   * @return void
   */

  const onResize = (aw=0, ah=0) => {
    // trigger root level
    state.width = window.innerWidth+aw;
    state.height = window.innerHeight+ah;
  }
  // life-cycle hook done on component

  return {
    state, 
    onResize
  };
}

export default windowState
