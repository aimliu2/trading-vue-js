
/**
 * @class PriceAPI
 * @desc fetch price from determined path (static file/ websocket/ csv/ db/ etc.), Normalized then feeded into Datacube
 * @version 0.0.1
 */
export default class PriceAPI {
    constructor(path='', mode='tvjs') {
      const noDataJSON = {"_comment" : "no data feeded","chart": {"type": "Candles", "tf": "Y","data": [[]]}}

      this.json = noDataJSON
      // this.socketJSON = {}
      this.isLoading = true
      this.path = path
      this.mode = mode

      // init 

    }
    // this.init_data() - refetch
    // how to deal with websocket?

    // fetch JSON static path, .tvjs format

    // fetch JSON websocket
    // websocket normalized
    // how does datacube handle tick update ?
    // TBD

    // fetch JSON MT5 export(.csv)
    // MT5csv normalized

}

// const errMsg = {
//   'C200':'Fetch response error. Failed to fetch chart data',
//   'C201':'Datacube built error. '
// }

// const dummyPath ='/dummy1/dummy-ohlcv.json'


// const initState = {
//   path: '', // default path
//   isLoading:true,
//   JSON:{}
// }

// const priceAPI = (payload=initState) => {
//   // declare state variable
//   const state = reactive(payload)

//   // methods
//   const fetchPriceJSON = async (path) =>{
//     state.isLoading = true;
//     let response = await fetch(path);
//     if (!response.ok) {
//         console.error('C200: '.concat(errMsg['C200']))
//         state.JSON =  {}
//     } else { 
//         state.isLoading = false;
//         state.JSON =  await response.json();
//     }
//   }

//   onBeforeMount(()=>{
//     // trigger watch -- nope does not work this way have to add {immediate:true}
//     // state.path = dummyPath
//     fetchPriceJSON(dummyPath)
//   })

//   // update priceJSON when path changed
//   watch(
//     () => state.path,
//     async (np) => {
//         fetchPriceJSON(np)
//     }
//   );

//   return {
//     state
//   }
// }

// export default priceAPI


    