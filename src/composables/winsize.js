import { reactive } from 'vue';

/**
 * Composable C1 - expose the state and actions. A stateful composable factory
 * Resize application to fit browser's window size
 * 
 * @state {width:number, height:number}
 * @action onResize - set state width, height to = browser's window width, height
 * @returns state - initial = current window size, action modified width, height with adjustment
 */
const windowState = () => {
  const state = reactive({
    width: 800,
    height: 421
  })
  /**
   * set state width, height to = browser's window width, height
   * @param {number} ah - adjusted height
   * @param {number} aw - adjusted width
   * @return void
   */
  const onResize = (aw=0, ah=0) => {
    // whenever onResize is called, state will automatically mutated
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
