/** @module JSON-indy */
/**
 * @name IndyJSON
 * @desc Indicator JSON data : contain indicators. Send as input to Class {@link DataCube} - Indicator overlay could append to either onchart or offchart section
 * @typedef IndyJSON
 * @property {string} name - name of this indicator, shown on chart
 * @property {string} type - typw of this indicator, send to resposible component to render
 * @property {IndyTC[]} data - array of [timestamp, close] see {@link module:JSON-indy~IndyTC|IndyTC}
 * @property {object} settings - specific settings of this overlay
 * 
 *
 * @example
 * {
 *    "name": "RSI, 20",
 *    "type": "RSI:calc",
 *    "data": [
 *        [
 *            1570586400000,
 *            38.834352635325224
 *        ],
 *        [
 *            1570590000000,
 *            35.66096042520246
 *        ],
 *        ...
 *        [
 *            1572022800000,
 *            87.95054865340519
 *        ]
 *    ],
 *    "settings": {
 *        "upper": 70,
 *        "lower": 30,
 *        "backColor": "#9b9ba316",
 *        "bandColor": "#666"
 *    }
 *},
 */
export const IndyJSON = {}

 /**
 * @typedef {number[]} IndyTC
 * @desc timestamp, close
 * @example
 * [
 *     1570586400000,
 *     38.834352635325224
 * ]
 */