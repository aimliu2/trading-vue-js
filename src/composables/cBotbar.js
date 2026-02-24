
import Const from '@stuff/constants.js'
import {formatTwoDigits, dayStart, monthStart, yearStart} from '@stuff/time.js'
import {measureText} from '@stuff/utilities.js'
import {nextTick} from 'vue'

const { MINUTE15, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR, MONTHMAP } = Const
/**
 * @typedef BBprops
 * @prop {String} font - font object props
 * @prop {Object} colors - colors object props
 * @prop {Object} cursor - cursor object props
 * @prop {Object} layout - layout object props
 * @prop {Number} timezone - timezone object props
 * @prop {Number} interval - interval object props
 * @prop {Object} layout - layout object props
 * @prop {Array} range - range object props
 * @prop {Array} data - data object props
 * @prop {String} tv_id - string id for this tv instance, used in measureText for caching
 */


/**
 * @typedef BotbatPayload
 * @prop {Number} panheight - from config prop -- derived from constant.js
 * @prop {Object} bot_shaders - from props.shaders.filter
 * @prop {BBprops} bbprops - props of BotBat.vue forwarded from Chart.vue
 */

/**
 * @class Botbar
 * @desc mutate pixel on canvas
 */
export default class Botbar {
    /**
     * @constructor
     * @memberof Botbar
     * @param {HTMLCanvasElement} canvas 
     * @param {BotbatPayload} payload 
     */
    constructor(canvas, payload) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d') // error
        this.$p = payload.bbprops // undefined
        this.panheight = payload.panheight
        this.shader = payload.bot_shaders

    }

    /**
     * @method setup
     * @memberof Botbar
     * @param {number} sw - canvas style width
     * @param {number} sh - canvas style height
     * @desc set css and pixel of bottombar
     */
    setup() {
        // sometimes canvas is not populated yet, check if canvas is null
        if (!this.canvas) {
            console.error('Canvas is not defined in Botbar setup!');
            return;
        }
        let cv = this.canvas
        let sett = this.$p.layout.botbar
        // direct mutate may conflict with VDOM
        cv.style.width = `${sett.width}px`
        cv.style.height = `${sett.height}px`
        cv.style.backgroundColor = this.$p.colors.back
        let dpr = window.devicePixelRatio || 1; if (dpr < 1) dpr = 1 // TVJS Issue #63
        nextTick(()=>{ // Vue's nextTick will do ... on DOM after state-var update (DOM mutate)
            let rect = cv.getBoundingClientRect()
            // Pixel mutate
            cv.width = rect.width * dpr
            cv.height = rect.height * dpr
            //TODO: test the boost:
            //alpha: false,
            //desynchronized: true,
            //preserveDrawingBuffer: false
            let ctx = this.ctx
            // let ctx = canvas.getContext('2d', {})
            ctx.scale(dpr, dpr)
            // redraw()
            this.update()
            // Fallback fix for Brave browser https://github.com/brave/brave-browser/issues/1738
            if (!ctx.measureTextOrg) {ctx.measureTextOrg = ctx.measureText} // ctx.measureText originally got 0
            ctx.measureText = text => measureText(ctx, text, this.$p.tv_id) // used by panel()
        })
    }

    /**
     * @method update
     * @desc redraw pixel function, solely rely on layout params to draw pixel
     */
    update() {
        // Debugging: check if $p is defined and has the expected structure
        // console.log(this.$p.layout)

        this.grid_0 = this.$p.layout.grids[0]

        const width = this.$p.layout.botbar.width
        const height = this.$p.layout.botbar.height

        const sb = this.$p.layout.grids[0].sb

        //this.ctx.fillStyle = this.$p.colors.back
        this.ctx.font = this.$p.font
        //this.ctx.fillRect(0, 0, width, height)
        this.ctx.clearRect(0, 0, width, height)

        this.ctx.strokeStyle = this.$p.colors.scale

        this.ctx.beginPath()
        this.ctx.moveTo(0, 0.5)
        this.ctx.lineTo(Math.floor(width + 1), 0.5)
        this.ctx.stroke()

        this.ctx.fillStyle = this.$p.colors.text
        this.ctx.beginPath()

        for (var p of this.$p.layout.botbar.xs) {

            let lbl = this.format_date(p)

            if (p[0] > width - sb) continue

            this.ctx.moveTo(p[0] - 0.5, 0)
            this.ctx.lineTo(p[0] - 0.5, 4.5)

            if (!this.lbl_highlight(p[1][0])) {
                this.ctx.globalAlpha = 0.85
            }
            this.ctx.textAlign = 'center'
            this.ctx.fillText(lbl, p[0], 18)
            this.ctx.globalAlpha = 1

        }

        this.ctx.stroke()
        this.apply_shaders()
        if (this.$p.cursor.x && this.$p.cursor.t !== undefined)
            this.panel()

    }

    /**
     * @method apply_shaders
     * @desc apply shader, used in update()
     */
    apply_shaders() {
        let layout = this.$p.layout.grids[0]
        let props = {
            layout: layout,
            cursor: this.$p.cursor
        }
        for (var s of this.shader) {
            this.ctx.save()
            s.draw(this.ctx, props)
            this.ctx.restore()
        }
    }

    /**
     * @method panel
     * @desc used in updated
     */
    panel() {

        let lbl = this.format_cursor_x()
        this.ctx.fillStyle = this.$p.colors.panel

        let measure = this.ctx.measureText(lbl + '    ')
        let panwidth = Math.floor(measure.width)
        let cursor = this.$p.cursor.x
        let x = Math.floor(cursor - panwidth * 0.5)
        let y = - 0.5
        let panheight = this.panheight
        this.ctx.fillRect(x, y, panwidth, panheight + 0.5)

        this.ctx.fillStyle = this.$p.colors.textHL
        this.ctx.textAlign = 'center'
        this.ctx.fillText(lbl, cursor, y + 16)

    }

    /**
     * @method format_date
     * @desc used in updated
     */
    format_date(p) {
        let t = p[1][0]
        t = this.grid_0.ti_map.i2t(t)
        let ti = this.$p.layout.grids[0].ti_map.tf
        // Enable timezones only for tf < 1D
        let k = ti < DAY ? 1 : 0
        let tZ = t + k * this.$p.timezone * HOUR

        //t += new Date(t).getTimezoneOffset() * MINUTE
        let d = new Date(tZ)

        if (p[2] === YEAR || yearStart(t) === t) {
            return d.getUTCFullYear()
        }
        if (p[2] === MONTH || monthStart(t) === t) {
            return MONTHMAP[d.getUTCMonth()]
        }
        // TODO(*) see grid_maker.js
        if (dayStart(tZ) === tZ) return d.getUTCDate()

        let h = formatTwoDigits(d.getUTCHours())
        let m = formatTwoDigits(d.getUTCMinutes())
        return h + ":" + m

    }

    /**
     * @method format_cursor
     * @desc used in updated
     */
    format_cursor_x() {

        let t = this.$p.cursor.t
        t = this.grid_0.ti_map.i2t(t)
        //let ti = this.$p.interval
        let ti = this.$p.layout.grids[0].ti_map.tf
        // Enable timezones only for tf < 1D
        let k = ti < DAY ? 1 : 0

        //t += new Date(t).getTimezoneOffset() * MINUTE
        let d = new Date(t + k * this.$p.timezone * HOUR)

        if (ti === YEAR) {
            return d.getUTCFullYear()
        }

        if (ti < YEAR) {
            var yr = '`' + `${d.getUTCFullYear()}`.slice(-2)
            var mo = MONTHMAP[d.getUTCMonth()]
            var dd = '01'
        }
        if (ti <= WEEK) dd = d.getUTCDate()
        let date = `${dd} ${mo} ${yr}`
        let time = ''

        if (ti < DAY) { // intraday
            let h = formatTwoDigits(d.getUTCHours()) // get 12, 03
            let m = formatTwoDigits(d.getUTCMinutes()) // get 12, 03
            time = h + ":" + m
        }

        return `${date}  ${time}`

    }

    /**
     * @method format_cursor
     * @desc used in updated
     * Highlights the begining of a time interval
     * TODO: Problem: let's say we have a new month,
     * but if there is no grid line in place, there
     * will be no month name on t-axis. Sad.
     * Solution: manipulate the grid, skew it, you know
     */
    lbl_highlight(t) {

        let ti = this.$p.interval

        if (t === 0) return true
        if (monthStart(t) === t) return true
        if (dayStart(t) === t) return true
        if (ti <= MINUTE15 && t % HOUR === 0) return true

        return false

    }

    /**
     * @method mousemove
     */
    mousemove() { }
    /**
     * @method mouseout
     */
    mouseout() { }
    /**
     * @method mouseup
     */
    mouseup() { }
    /**
     * @method mousedown
     */
    mousedown() { }

}
