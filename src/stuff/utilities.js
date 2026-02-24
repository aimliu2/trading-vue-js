/**
 * @namespace Utilities-js
 * @desc utilityies function exported by part. We don't need a chuck import but used 1 or 2 function
 */

/**
 * @function isFunction
 * @desc check if the input was a function or not
 * @param {fn} fn - input funtion
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
 * @function debounce
 * @param {fn} func - input function
 * @param {number} wait - interger in ms i.e. 1000 = 1s
 * @param {boolean} leading - use leading debounce
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
// beware of context loss of 'this' when passing class method as callback i.e. using debounce
// see https://stackoverflow.com/questions/16382165/why-do-i-lose-the-context-of-this-in-javascript
export const debounce = (fn, wait, leading=false) => {
  if(!isFunction(fn)) {console.log(`not a function cannot be debounced ${typeof fn}`); return}
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
 * @function measureText
 * @desc Fallback fix for Brave browser, https://github.com/brave/brave-browser/issues/1738
 * @param {ctx} ctx - canvas ctx, have to pre-assigned ctx.measureTextOrg = ctx.measureText
 * @param {string} text - text
 * @param {string} tv_id - id of the canvas ?
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
        if(ctx.font) el.style.font = ctx.font
        el.innerText = text.replace(/ /g, '.');
        return { width: el.offsetWidth }
    } else {
        return m
    }
}