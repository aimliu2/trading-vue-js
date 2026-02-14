/** @module JSON-tools */

/**
 * @typedef ToolSettings
 * @property {string} color - color hex code i.e. "#35c460"
 */

/**
 * tools JSON data : main drawing i.e. LineTool:Extended Send as input to Class {@link DataCube}
 * @name ToolsJSON
 * @typedef ToolsJSON
 * @property {string} type - tooltype:mod i.e. LineTool:Extended
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