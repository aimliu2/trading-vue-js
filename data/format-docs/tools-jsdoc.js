/** @module JSON-tools */

/**
 * @typedef ToolSettings
 * @prop {string} color - color hex code i.e. "#35c460"
 * @prop {boolean} [flag] - each flag settings of each overlays
 */

/**
 * tools JSON data : main drawing i.e. LineTool:Extended Send as input to Class {@link DataCube}
 * @name ToolsJSON
 * @typedef ToolsJSON
 * @property {string} type - tooltype:mod i.e. LineTool:Extended. Will be set to 'use_for:Default' if type was not specified.
 * @property {ToolSettings} settings - {color:string} see {@link module:JSON-tools~ToolSettings|ToolSettings}
 *
 * @example
 * {
 * "tools": [
 *         {
 *             "type": "LineTool",
 *             "settings": {
 *                 "color": "#35c460"
 *             }
 *         },
 *         {
 *             "type": "LineTool:Extended",
 *             "settings": {
 *                 "color": "#3186c4"
 *             }
 *         },
 *         {
 *             "type": "LineTool:Ray",
 *             "settings": {
 *                 "color": "#c43169"
 *             }
 *         }
 *     ]
 * }
 */
export const ToolsJSON = {}

/**
 * tools JSON data : main cursor ? Send as input to Class {@link DataCube}
 * @name ToolJSON
 * @typedef ToolJSON
 * @property {string} tool - Cursor by default, what else ?
 *
 * @example
 * {
 * "tool": "Cursor"
 * }
 */
export const ToolJSON = {}

/**
 * @name FullToolJSON
 * 
 * {
 * "tools":[
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
]
 * }
 */