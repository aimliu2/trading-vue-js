/** @module JSON-Aggregate */
/** @import { ToolJSON, ToolsJSON } from "./tools-jsdoc.js" */
/** @import { IndyJSON } from "./indy-jsdoc.js" */
/** @import { ChartObject } from "./chart-jsdoc.js" */
/**
 * Full Chart JSON data. Handled by Class {@link DataCube} 
 * @desc JSON:data feed into {@link DataCube}
 * @name FullChartJSON
 * @typedef FullChartJSON
 * @prop {string} [_comment] - comment for this JSON data
 * @prop {ChartObject} chart - main price data see {@link module:JSON-Chart~ChartObject|ChartObject}
 * @prop {IndyJSON[]} onchart - concat of JSON indicator (+drawing) see {@link module:JSON-indy~IndyJSON|IndyJSON}
 * @prop {IndyJSON[]} offchart - concat of JSON indicator (+drawing) see {@link module:JSON-indy~IndyJSON|IndyJSON}
 * @prop {ToolsJSON}  tools - all tools fot this user profile see {@link module:JSON-tools~ToolsJSON|ToolsJSON}
 * @prop {ToolJSON} tool - current selected tool ? see {@link module:JSON-tools~ToolJSON|ToolJSON}
 * 
 *
 * @example
 * {
 *  "_comment" : "JSON comment", // optional
 *  "chart": {
 *      "type": "Candles",
 *      "tf": "D",
 *      "data": [
 *          [
 *              1584712800000,
 *              248.235,
 *              251.79,
 *              248.165,
 *              251.51,
 *              88668
 *          ],
 *          [
 *              1584716400000,
 *              251.53,
 *              251.53,
 *              248.19,
 *              248.535,
 *              191785
 *          ],
 *          ...
 *          [
 *              1595358000000,
 *              391.385,
 *              391.595,
 *              387.08,
 *              388.22,
 *              53531
 *          ]
 *      ]
 *  },
 *  "onchart": [ // onchart location the same frame with OHLCV
 *      {
 *          "name": "EMA, 25", // overlay name
 *          "type": "EMA", // overlay type (wwCals indicator) --> caculated first --> rendered with respective component
 *          "data": [],
 *          "settings": {} // settings of this overlay
 *      },
 *      ... // other onchart overlay
 *  ],
 *  "offchart": [ // onchart location the diff frame apart from OHLCV
 *      {
 *          "name": "RSI, 20", // overlay name
 *          "type": "RSI:preCalc", // overlay type (preCalc indicator)--> send to resposible component
 *          "data": [
 *              [
 *                  1570586400000,
 *                  38.834352635325224
 *              ],
 *              [
 *                  1570590000000,
 *                  35.66096042520246
 *              ],
 *              ...
 *              [
 *                  1572022800000,
 *                  87.95054865340519
 *              ]
 *          ],
 *          "settings": {
 *              "upper": 70,
 *              "lower": 30,
 *              "backColor": "#9b9ba316",
 *              "bandColor": "#666"
 *          }
 *      },
 *      ... // other onchart overlay
 *  ],
 *  "tools": [ // tools overlay
 *      {
 *          "type": "LineTool",
 *          "settings": {
 *              "color": "#35c460"
 *          }
 *      },
 *      {
 *          "type": "LineTool:Extended",
 *          "settings": {
 *              "color": "#3186c4"
 *          }
 *      },
 *      {
 *          "type": "LineTool:Ray",
 *          "settings": {
 *              "color": "#c43169"
 *          }
 *      }
 *  ]
 * }
 */
