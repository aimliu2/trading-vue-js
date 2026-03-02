/**
 * @namespace Utilities-js
 * @desc utilityies function exported by part. We don't need a chuck import but used 1 or 2 function
 */

/* -------------------------------------------------------------------------- */
/*                            Calculation Utilities                           */
/* -------------------------------------------------------------------------- */

// Fast filter. Really fast, like 10X
/**
 * @function fast_filter
 * @desc Fast filter. Really fast, like 10X
 * @param {Array} arr - array to be filtered
 * @param {Number} t1 - start time
 * @param {Number} t2 - end time
 * @returns {Array} filtered array
 * @example
 * 
 * ```js
 * fast_filter(arr, t1, t2) // returns [arr, undefined]
 * ```
 */
export const fast_filter = (arr, t1, t2) => {
  if (!arr.length) return [arr, undefined]
  try {
    let ia = new IndexedArray(arr, "0")
    let res = ia.getRange(t1, t2)
    let i0 = ia.valpos[t1].next
    return [res, i0]
  } catch (e) {
    // Regular filter as fallback
    return [arr.filter(x => x[0] >= t1 && x[0] <= t2), 0]
  }
}

// Fast filter (index-based)
/**
 * @function fast_filter_i
 * @desc Fast filter (index-based)
 * @param {Array} arr - array to be filtered
 * @param {Number} t1 - start time
 * @param {Number} t2 - end time
 * @returns {Array} filtered array
 * @example
 * 
 * ```js
 * fast_filter_i(arr, t1, t2) // returns [arr, undefined]
 * ```
 */
export const fast_filter_i = (arr, t1, t2) => {
  if (!arr.length) return [arr, undefined]
  let i1 = Math.floor(t1)
  if (i1 < 0) i1 = 0
  let i2 = Math.floor(t2 + 1)
  let res = arr.slice(i1, i2)
  return [res, i1]
}


/**
 * #function clamp
 * @desc clamp a number between a lower and upper bound. If higher is not provided, it will only clamp the number to the lower bound.
 * @memberof Utilities-js
 * @param {Number} num 
 * @param {Number} clamp 
 * @param {Number} higher 
 * @returns {Number} clamped number
 * @example
 * 
 * ```js
 * clamp(5, 1, 10) // returns 5
 * clamp(-1, 0, 10) // returns 0
 * clamp(11, 0, 10) // returns 10
 * clamp(5, 3) // returns 3
 * clamp(2, 3) // returns 3
 * clamp(4, 3) // returns 4
 * ```
 */
export const clamp = (num, clamp, higher) => higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)


/**
 * @function debounce
 * @param {fn} func - input function
 * @param {number} wait - interger in ms i.e. 1000 = 1s
 * @param {boolean} leading - use leading debounce
 * @memberof Utilities-js
 * @returns {fn} - debounced function
 * @desc Get one value during an interval of a rapid fired event. Works on Chrome 7.0++ Firefox 4.0++ IE 9.0++
 * @example
 * 
 * ```js
 * const debouncedHandleResize = debounce(onResize,500); // start by wrapping fn
 * window.addEventListener('resize', () => debouncedHandleResize(0, 0)) // pass args here
 * 
 * ```
 */
// beware of context loss of 'this' when passing class method as callback
// see https://stackoverflow.com/questions/16382165/why-do-i-lose-the-context-of-this-in-javascript
export const debounce = (fn, wait, leading = false) => {
  if (!isFunction(fn)) { console.log(`not a function cannot be debounced ${typeof fn}`); return }
  else {
    let timerId
    let shouldInvoke

    return (...args) => {
      shouldInvoke = true

      if (!timerId && leading) {
        fn(...args)
        shouldInvoke = false
      }
      clearTimeout(timerId)

      timerId = setTimeout(() => shouldInvoke && fn(...args), wait)
    }
  }// end else
}

/**
 * @function overwrite
 * @desc Update array : preserves the original memory reference
 * because there is const oldRange = state.range
 * oldRange won't trigger change detection when state.range is updated
 * @param {Array} arr - array to be updated
 * @param {Array} new_arr - new array to be updated
 * @returns {Array} updated array
 */
export const overwrite = (arr, new_arr) => arr.splice(0, arr.length, ...new_arr)

/* -------------------------------------------------------------------------- */
/*                                UI Utilities                                */
/* -------------------------------------------------------------------------- */

/**
 * @function warn
 * @desc Delayed warning, f = condition lambda fn
 * @param {Function} f - condition lambda fn
 * @param {String} text - warning text
 * @param {Number} delay - delay in ms
 * @returns {void}
 * @example
 * 
 * ```js
 * warn(() => true, 'warning') // warning after 0ms
 * ```
 */
export const warn = (f, text, delay = 0) => {
  setTimeout(() => {
    if (f()) console.warn(text)
  }, delay)
}


/**
 * @function format_name
 * @desc Format names such 'RSI, $length', where
 * length - is one of the settings
 * @param {Object} ov - overlay object
 * @returns {String} formatted name
 * @example
 * 
 * ```js
 * format_name(ov) // returns formatted name
 * ```
 */
export const format_name = (ov) => {
  if (!ov.name) return undefined

  let name = ov.name

  for (var k in ov.settings || {}) {
    let val = ov.settings[k]
    let reg = new RegExp(`\\$${k}`, 'g')
    name = name.replace(reg, val)
  }

  return name
}



/**
 * @function copy_layout
 * @desc Copy layout in a reactive way
 * @param {Object} obj - object to be updated
 * @param {Object} new_obj - new object to be updated
 * @returns {Object} updated object
 */
export const copy_layout = (obj, new_obj) => {
  for (var k in obj) {
    if (Array.isArray(obj[k])) {
      // (some offchart indicators are added/removed)
      // we need to update layout in a reactive way
      if (obj[k].length !== new_obj[k].length) {
        overwrite(obj[k], new_obj[k])
        continue
      }
      for (var m in obj[k]) {
        Object.assign(obj[k][m], new_obj[k][m])
      }
    } else {
      Object.assign(obj[k], new_obj[k])
    }
  }
}


/**
 * @function measureText
 * @desc Fallback fix for Brave browser, https://github.com/brave/brave-browser/issues/1738
 * @param {ctx} ctx - canvas ctx, have to pre-assigned ctx.measureTextOrg = ctx.measureText
 * @param {string} text - text
 * @param {string} tv_id - id of the canvas ?
 * @memberof Utilities-js
 */
export const measureText = (ctx, text, tv_id) => {
  let m = ctx.measureTextOrg(text)
  if (m.width === 0) { // got 0, no text
    let el = document.getElementById('tvjs-measure-text')
    if (!el) { // no measure text element detected
      let base = doc.getElementById(tv_id)
      el = doc.createElement("div")
      el.id = 'tvjs-measure-text'
      el.style.position = 'absolute'
      el.style.top = '-1000px'
      base.appendChild(el)
    }
    if (ctx.font) el.style.font = ctx.font
    el.innerText = text.replace(/ /g, '.');
    return { width: el.offsetWidth }
  } else {
    return m
  }
}

/**
 * @function apply_opacity
 * @desc apply opacity to a hex color. If the color is in 6-digit hex format, 
 * it will convert it to 8-digit hex format with the opacity applied. 
 * If the color is already in 8-digit hex format, it will return the color as is.
 * @memberof Utilities-js 
 * @param {String} color - hex color in 6-digit or 8-digit format, e.g. '#ff0000' or '#ff000080'
 * @param {Number} opacity - value between 0 and 1
 * @returns {String} color with opacity applied
 * @example
 * 
 * ```js
 * apply_opacity('#ff0000', 0.5) // returns '#ff000080'
 * apply_opacity('#ff000080', 0.5) // returns '#ff000080'
 * apply_opacity('#00ff00', 1) // returns '#00ff00ff'
 * apply_opacity('#0000ff', 0) // returns '#0000ff00'
 * ```
 */
export const apply_opacity = (color, opacity) => {
  if (color.length === 7) {
    let n = Math.floor(opacity * 255)
    n = this.clamp(n, 0, 255)
    color += n.toString(16)
  }
  return color
}

/**
 * @function isFunction
 * @desc check if the input was a function or not
 * @param {fn} fn - input funtion
 * @memberof Utilities-js
 * @returns {boolean} ture if input was function
 * @example
 * 
 * ```js
 * isFunction(onresize())
 * ```
 */
export const isFunction = (fn) => {
  return typeof fn === 'function';
}

/**
 * @function xmode
 * @desc Default cursor mode. 'explore' for mobile, or 'default' for Desktop
 * @memberof Utilities-js
 * @returns {String}
 */
export const xmode = () => {
  return isMobileOrTablet() ? 'explore' : 'default'
}

/**
 * @function isMobileOrTablet
 * @desc check if current device has mobile features
 * @memberof Utilities-js
 * @returns {Boolean}
 */
export const isMobileOrTablet = () => {
  let hasMobileFeature = ('onorientationchange' in window) || ('ontouchstart' in window) // has mobile events
  let hasTouchPointFeature = (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0) // has touchPoint
  let hasDocumentTouch = window.DocumentTouch && document instanceof window.DocumentTouch // outdated
  return hasMobileFeature || hasTouchPointFeature
}




/* -------------------------------------------------------------------------- */
/*                            HTML Event Utilities                            */
/* -------------------------------------------------------------------------- */

/**
 * @function processMouseWheelDelta
 * @desc process the mouse wheel delta event  
 * @param {HTMLWheelevent} HTMLWheelevent - the mouse wheel event
 * @param {Number} sensitivity - the sensitivity of the mouse wheel
 * @returns {Object} - the processed mouse wheel delta event
 * @example
 * 
 * ```js
 * processMouseWheelDelta(event, 12)
 * ```
 */
export const processMouseWheelDelta = (HTMLWheelevent, sensitivity = 12) => {
  return { x: HTMLWheelevent.deltaX / sensitivity, y: HTMLWheelevent.deltaY / sensitivity }
}

/**
 * @function limitWheelDelta
 * @desc Limit crazy wheel delta values
 * @param {Number} delta - the mouse wheel delta
 * @returns {Number} - the processed mouse wheel delta
 * @example
 * 
 * ```js
 * limitWheelDelta(12, 500, 200)
 * ```
 */
export const limitWheelDelta = (delta, limit = 500, base = 200) => {
  let abs = Math.abs(delta)
  if (abs > limit) {
    return (base + Math.log(abs)) * Math.sign(delta)
  }
  return delta
}