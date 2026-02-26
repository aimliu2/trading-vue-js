/**
 * @namespace times-js
 * @desc handle everything related to time
 */


/**
 * @function now()
 * @memberof times-js
 * @summary return current timestamp
 * @param {void} None
 * @returns {number} timestamp
 * @example
 * 
 * let k = now() // k = 1771064347739
 * 
 */
export const nowTimestamp = () => { return (new Date()).getTime() }

/**
 * @function formatTwoDigits
 * @desc Formats a number to a two-digit string using a conditional check. presume input must be valid
 * @param {number} t - Hour or Min.
 * @memberof times-js
 * @returns {string} The two-digit formatted string.
 */
export const formatTwoDigits = (t) => {
  return t < 10 ? '0' + t : String(t);
}


/**
 * @function dayStart
 * @desc start of the day, 0 , // TODO(*) see grid_maker.js
 * @memberof times-js
 */
export const dayStart = (t) => {
    let start = new Date(t)
    return start.setUTCHours(0,0,0,0)
}

/**
 * @function monthStart
 * @desc start of the month
 * @memberof times-js
 */
export const monthStart = (t) => {
    let date = new Date(t)
    return Date.UTC(
        date.getFullYear(),
        date.getMonth(), 1
    )
}

/**
 * @function yearStart
 * @desc start of the year
 * @memberof times-js
 */
export const yearStart = (t) => {
    return Date.UTC(new Date(t).getFullYear())
}