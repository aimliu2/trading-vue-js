/** @module JSON-Chart */
/**
 * @typedef {number[]} TOHLCV
 * @desc timestamp(must be unique), open, high, low, close, volume
 * @example
 * [
 *     1603037160000,
 *     11442.5,
 *     11448.5,
 *     11442.5,
 *     11448.5,
 *     118376.12
 * ]
 */

/**
 * @typedef ChartObject
 * @property {string} type - type i.e. "Candles"
 * @property {string} tf - timeframe i.e. 'Y', 'M', 'D', '1H', '15m'
 * @property {Array<TOHLCV>} data - series of tohlcv. see {@link module:JSON-Chart~TOHLCV|TOHLCV}
 * 
 * @example
 * {
 *  "type": "Candles",
 *  "tf": "D",
 *  "data": [
 *      [
 *          1584712800000,
 *          248.235,
 *          251.79,
 *          248.165,
 *          251.51,
 *          88668
 *      ],
 *      [
 *          1584716400000,
 *          251.53,
 *          251.53,
 *          248.19,
 *          248.535,
 *          191785
 *      ],
 *      ...
 * }
 */


/**
 * Price JSON data : contain ohlcv. Send as input to Class {@link DataCube}
 * @name ChartJSON
 * @typedef ChartJSON
 * @property {string} [_comment] - comment for this data
 * @property {ChartObject} chart - main price data see {@link module:JSON-Chart~ChartObject|ChartObject}
 * 
 *
 * @example
 * {
 * "_comment" : "JSON comment", // optional
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
 *  }
 * }
 */
export const ChartJSON = {}

/**
 * Legacy Price JSON data : contain ohlcv. Send as input to Class {@link DataCube}
 * @typedef LegacyChartJSON
 * @property {Array<TOHLCV>} ohlcv - legacy input will be convert to {@link ChartObject} by {@link DataCube}
 * 
 * @example
 * // lagacy input
 * {
*  "ohlcv": [
*      [
*          1603037160000,
*          11442.5,
*          11448.5,
*          11442.5,
*          11448.5,
*          118376.12
*      ],
*      ...
*  ]
*}
 */

