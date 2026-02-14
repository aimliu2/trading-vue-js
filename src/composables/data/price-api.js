// fetch price from static file/ websocket

import { reactive, watch, onBeforeMount } from 'vue';

const errMsg = {
  'C200':'Fetch response error. Failed to fetch chart data',
  'C201':'Datacube built error. '
}

const dummyPath ='/dummy1/dummy-ohlcv.json'


const initState = {
  path: '', // default path
  isLoading:true,
  JSON:{}
}

const priceAPI = (payload=initState) => {
  // declare state variable
  const state = reactive(payload)

  // methods
  const fetchPriceJSON = async (path) =>{
    state.isLoading = true;
    let response = await fetch(path);
    if (!response.ok) {
        console.error('C200: '.concat(errMsg['C200']))
        state.JSON =  {}
    } else { 
        state.isLoading = false;
        state.JSON =  await response.json();
    }
  }

  onBeforeMount(()=>{
    // trigger watch -- nope does not work this way have to add {immediate:true}
    // state.path = dummyPath
    fetchPriceJSON(dummyPath)
  })

  // update priceJSON when path changed
  watch(
    () => state.path,
    async (np) => {
        fetchPriceJSON(np)
    }
  );

  return {
    state
  }
}

export default priceAPI


    