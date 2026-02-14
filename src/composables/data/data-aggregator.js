// DataCube already have aggregator function
import DataCube from '@helpers/datacube.js'; // can not pass read-only value, using $set operator
import { ref, computed } from 'vue';
/** @type PriceState */ // fetch price from static file/ websocket
import priceAPI from './price-api.js' // call then unwrap
// profile API - store indys, preset tool for this user
// session API - store drawing on this symbol


// export const DataCuber = (bj) => DataCube(bj);

/**
 * @returns {AllData} computed - All data state, must be unwrapped
 */
export const DataCubic = () => {
  
  let {state:priceData} = priceAPI(); // priceData become a property
  // const overlayData = shallowRef();
  // const toolData = shallowRef();
  // const indicatorData = shallowRef();
  // const dataReady = ref(false);
  // let test = ref(priceData.JSON)

  
  // WIP
  // can fetch data but dccube will mutate some of the input
  // how to handle this ?
  /**
   * aggData - methods return mutable agg JSON
   * let DataCube handle dirty jobs
   * @returns {AllData} AllData - must be mutable object
   */
  const aggData = () => {
    // smart aggregator
    return  priceData.JSON // simple return
  }

  /**
   * ready - computed return flag when AllData is ready
   * @returns {Boolean} readyFlag
   */
  const ready = computed(()=>{
    // somehow this has to be smart props signal
    return  priceData.isLoading // simple return
  })

  const cube = computed(()=> {
    // move agg function here 
    let c = new DataCube(aggData()) // can not pass read-only value, using $set operator
    return c
  })

  return {
    cube,
    ready
  }

}
/**
 * @typedef PriceState
 * @property {string} path
 * @property {boolean} isLoading
 * @property {object} JSON
 */
/**
 * @typedef AllData
 * @property {object} priceData - JSON of price data, each timestamp must be unique
 * @property {object} overlayData - JSON of current overlays on chart if any
 * @property {object} toolData - JSON of current tools on chart if any
 * @property {object} indicatorData - JSON of onchart/ offchart indicator, contains no data
 */