// profile API - store indys, preset tool for this user
// import { reactive, watch, onBeforeMount } from 'vue';

// const errMsg = {
//   'C200':'Fetch response error. Failed to fetch chart data',
//   'C201':'Datacube built error. '
// }

// const dummyPath ='/dummy1/dummy-ohlcv.json'


// const initState = {
// }


// const priceAPI = (payload=initState) => {
//   // declare state variable
//   const state = reactive(payload)


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

// export default profileAPI


export const toolAPI = {"tools":[
   {
      "type":"Cursor",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII="
   },
   {
      "group":"Lines",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC",
      "type":"LineTool:Segment",
      "hint":"This hint will be shown on hover",
      "data":[],
      "settings":{
         
      }
   },
   {
      "group":"Lines",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==",
      "type":"LineTool:Extended",
      "hint":"This hint will be shown on hover",
      "data":[],
      "settings":{
         "extended":true
      }
   },
   {
      "group":"Lines",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=",
      "type":"LineTool:Ray",
      "hint":"This hint will be shown on hover",
      "data":[],
      "settings":{
         "ray":true
      }
   },
   {
      "group":"Measurements",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC",
      "type":"RangeTool:Price",
      "hint":"Price Range",
      "data":[],
      "settings":{
         
      }
   },
   {
      "group":"Measurements",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC",
      "type":"RangeTool:Time",
      "hint":"Price Range",
      "data":[],
      "settings":{
         "price":false,
         "time":true
      }
   },
   {
      "group":"Measurements",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==",
      "type":"RangeTool:PriceTime",
      "hint":"Price Range",
      "data":[],
      "settings":{
         "price":true,
         "time":true
      }
   },
   {
      "group":"Measurements",
      "icon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC",
      "type":"RangeTool:ShiftMode",
      "hint":"Price Range",
      "data":[],
      "settings":{
         "price":true,
         "time":true,
         "shiftMode":true
      },
      "hidden":true
   }
]}
    