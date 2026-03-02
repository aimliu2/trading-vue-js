import { reactive, onMounted, computed } from 'vue';
import DataCube from '../../helpers/datacube.js'

// Note : Datacube use webworker and
// Overlay is a reactive inside DataCube object, 
// this set up need to be deep reactivity


const errMsg = {
  'C200':'Fetch response error. Failed to fetch chart data',
  'C201':'Datacube built error. '
}

const initState = {
  path: '/dummy-data.json',
  isLoading:true, // true when loading or error, false when datacube successfully built
  json: {},
  debug:'bugging...'
}

/**
 * Composable C2 : Served datacube from specific url path (json file)
 * path is a static file served by server, for now
 * 
 * @state {path:string,isLoading:boolean,chart:Datacube Object}
 * @returns state, computed
 */

const dataCube = (payload=initState) => {

  // declare state variable
  const state = reactive(payload) // no watcher or compute actively monitored the entire object

  /**
   * computed - build data cube, default to dummy data
   * @param {void} None - use internal state.json
   * @returns Datacube Object
   */
  const builtDataCube = computed(() =>{ // cache
    try {
      return new DataCube(state.json); 
    } catch(err) {
      console.error('C201: '.concat(errMsg['C201'],' ',err))
      return new DataCube()
    }
  })

  // life-cycle hook : fetch json value on client
  // SSR have to use pinia !?
  onMounted(async()=>{
    state.debug = 'fetch on client'
    let response = await fetch(state.path);
    if (!response.ok) {console.error('C200: '.concat(errMsg['C200']))}
    else { 
      state.json = await response.json();
      state.isLoading = false;
    }
  })

  return {
    state,
    builtDataCube
  }
}

export default dataCube


