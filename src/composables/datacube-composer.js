import { reactive, watchEffect } from 'vue';
import DataCube from '../helpers/datacube.js'

/**
 * Composable C2 - expose the state and actions. A stateful composable factory
 * Served datacube from specific url path
 * path is a static file served by server, for now
 * 
 * @state {path:string,isLoading:boolean,chart:Datacube Object}
 * @returns state - initial = data
 */
const errMsg = {
  'C200':'Fetch response error. Failed to fetch chart data',
  'C201':'Datacube built error. '
}

const dataCube = () => {
  // declare state variable
  const state = reactive({
    path: './dummy-data.json',
    isLoading:true, // true when loading or error, false when datacube successfully built
    chart: new DataCube() // init with empty data
  })

  /**
   * fetch json data from path then build datacube, default to dummy data folowing default state
   * @param {string} path - URL path to static json file, for now
   * @returns void
   */
  const buildDataCube = async (path) =>{ // internal assign
    state.isLoading = true;
    let response = await fetch(path);
    if (!response.ok) {
      console.error('C200: '.concat(errMsg['C200']))
      return // exit return chart with init data
    }
    try {
      let json = await response.json();
      state.chart = new DataCube(json);
    } catch(err) {
      console.error('C201: '.concat(errMsg['C201'],' ',err))
    } finally {
      state.isLoading = false;
    }
  }

  // executed on DOM

  // monitor and update state variable
  watchEffect(async () => {
    // This callback runs immediately after mount and tracks only state var declared here : 'state.path'
    await buildDataCube(state.path)
  })

  return {
    state,
    buildDataCube
  }
}

export default dataCube
