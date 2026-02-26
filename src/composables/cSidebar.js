import {clamp} from '@stuff/utilities.js'
import {sym_exp, log_mid} from '@stuff/math.js'
import {nextTick} from 'vue'

/**
 * @typedef SBprops
 * @prop {String} font - font object props
 * @prop {Object} colors - colors object props
 * @prop {Object} cursor - cursor object props
 * @prop {Object} layout - layout object props
 * @prop {Array} range - range object props
 * @prop {Array} data - data object props
 * @prop {String} tv_id - string id for this tv instance, used in measureText for caching
 * @prop {String} grid_id - string id for this grid, used to get the correct layout and data
 */

/**
 * @typedef SidebarPayload
 * @prop {string} side - 'left' or 'right', determine which side the sidebar is on
 * @prop {Number} panheight - from config prop -- derived from constant.js
 * @prop {Object} emitter - emitter from Vue component, used to emit events to Chart.vue
 * @prop {SBprops} sbprops - props of Sidebar.vue forwarded from Chart.vue
 */


// TODO : how to emit ?
/**
 * @class Sidebar
 * @desc Sidebar of the chart, responsible for drawing y-axis labels and cursor panel. It is a separate canvas layer on top of the main chart canvas, and it solely relies on layout params to draw pixel, so it won't cause any side effect to the main chart canvas. It also has its own shader system, which is used to draw things like extended crosshair, etc.
 */
export default class Sidebar {

    /**
     * @constructor
     * @memberof Sidebar
     * @param {HTMLCanvasElement} canvas
     * @param {SidebarPayload} payload
     */       
    constructor(canvas, payload) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')

        // this.comp = comp

        this.$p = payload.sbprops
        this.data = this.$p.sub
        this.range = this.$p.range
        this.id = this.$p.grid_id
        this.layout = this.$p.layout.grids[this.id] // special

        this.side = payload.side
        this.panheight = payload.panheight
        this.emit = payload.emitter

    }

    /**
     * @method setup
     * @memberof Sidebar
     * @param {number} sw - canvas style width
     * @param {number} sh - canvas style height
     * @desc set css and pixel of sidebar
     */
    setup() {
        // sometimes canvas is not populated yet, check if canvas is null
        if (!this.canvas) {
            console.error('Canvas is not defined in Sidebar setup!');
            return;
        }
        let cv = this.canvas
        // direct mutate may conflict with VDOM
        cv.style.width = `${this.$p.width}px`
        cv.style.height = `${this.layout.height}px`
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
     * @memberof Sidebar
     */
    update() {
        // Update reference to the grid
        this.layout = this.$p.layout.grids[this.id]
        // console.log(this.layout)

        var points = this.layout.ys
        var x, y, w, h, side = this.side
        var sb = this.layout.sb

        //this.ctx.fillStyle = this.$p.colors.back
        this.ctx.font = this.$p.font

        switch(side) {
            case 'left':
                x = 0
                y = 0
                w = Math.floor(sb)
                h = this.layout.height

                //this.ctx.fillRect(x, y, w, h)
                this.ctx.clearRect(x, y, w, h)

                this.ctx.strokeStyle = this.$p.colors.scale

                this.ctx.beginPath()
                this.ctx.moveTo(x + 0.5, 0)
                this.ctx.lineTo(x + 0.5, h)
                this.ctx.stroke()

                break
            case 'right':
                x = 0
                y = 0
                w = Math.floor(sb)
                h = this.layout.height
                //this.ctx.fillRect(x, y, w, h)
                this.ctx.clearRect(x, y, w, h)

                this.ctx.strokeStyle = this.$p.colors.scale

                this.ctx.beginPath()
                this.ctx.moveTo(x + 0.5, 0)
                this.ctx.lineTo(x + 0.5, h)
                this.ctx.stroke()
                break
        }

        this.ctx.fillStyle = this.$p.colors.text
        this.ctx.beginPath()

        for (var p of points) {

            if (p[0] > this.layout.height) continue

            var x1 = side === 'left' ? w - 0.5 : x - 0.5
            var x2 = side === 'left' ? x1 - 4.5 : x1 + 4.5

            this.ctx.moveTo(x1, p[0] - 0.5)
            this.ctx.lineTo(x2, p[0] - 0.5)

            var offst = side === 'left' ? - 10 : 10
            this.ctx.textAlign = side === 'left' ? 'end' : 'start'
            let d = this.layout.prec
            this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4)
        }

        this.ctx.stroke()

        if (this.$p.grid_id) this.upper_border()

        this.apply_shaders()

        if (this.$p.cursor.y && this.$p.cursor.y$) this.panel()

    }

    /**
     * @method apply_shaders
     * @desc apply shader, used in update()
     * @memberof Sidebar
     */
    apply_shaders() {
        let layout = this.$p.layout.grids[this.id]
        let props = {
            layout: layout,
            cursor: this.$p.cursor
        }
        for (var s of this.$p.shaders) {
            this.ctx.save()
            s.draw(this.ctx, props)
            this.ctx.restore()
        }
    }

     /**
     * @method upper_border
     * @desc draw upper border for sidebar, used in update()
     * @memberof Sidebar
     */
    upper_border() {
        this.ctx.strokeStyle = this.$p.colors.scale
        this.ctx.beginPath()
        this.ctx.moveTo(0, 0.5)
        this.ctx.lineTo(this.layout.width, 0.5)
        this.ctx.stroke()
    }

    /**
     * @method panel
     * @desc draw the panel that shows the value of the current cursor position, used in update()
     * @memberof Sidebar
     */
    panel() {

        if (this.$p.cursor.grid_id !== this.layout.id) {
            return
        }

        let lbl = this.$p.cursor.y$.toFixed(this.layout.prec)
        this.ctx.fillStyle = this.$p.colors.panel

        let panwidth = this.layout.sb + 1

        let x = - 0.5
        let y = this.$p.cursor.y - this.panheight * 0.5 - 0.5
        let a = 7
        this.ctx.fillRect(x - 0.5, y, panwidth, this.panheight)
        this.ctx.fillStyle = this.$p.colors.textHL
        this.ctx.textAlign = 'left'
        this.ctx.fillText(lbl, a, y + 15)

    }

    /**
     * @method calc_zoom
     * @desc calculate zoom level based on the pan distance, used in rezoom_range()
     * @memberof Sidebar
     */
    calc_zoom(event) {
        let d = this.drug.y - event.offsetY // event.center.y, // can not read y ?
        let speed = d > 0 ? 3 : 1
        let k = 1 + speed * d / this.layout.height
        return clamp(this.drug.z * k, 0.005, 100)
    }

    /**
     * @method calc_range
     * @desc calculate range based on zoom level and diff1/diff2, used in rezoom_range()
     * @memberof Sidebar
     */
    calc_range(diff1 = 1, diff2 = 1) {

        let z = this.zoom / this.drug.z
        let zk = (1 / z - 1) / 2

        let range = this.y_range.slice()
        let delta = range[0] - range[1]

        if (!this.layout.grid.logScale) {
            // linear scale range adjustment
            range[0] = range[0] + delta * zk * diff1
            range[1] = range[1] - delta * zk * diff2
        } else {
            // log scale range adjustment
            let px_mid = this.layout.height / 2
            let new_hi = px_mid - px_mid * (1/z)
            let new_lo = px_mid + px_mid * (1/z)

            // Use old mapping to get a new range
            let f = y => sym_exp((y - this.drug.B) / this.drug.A)

            // let copy = range.slice() // ?
            range[0] = f(new_hi)
            range[1] = f(new_lo)

        }

        return range
    }

    /**
     * @method rezoom_range
     * @desc rezoom range based on delta and diff1/diff2, used in mouse events
     * @memberof Sidebar
     */
    rezoom_range(delta, diff1, diff2) {

        if (!this.$p.y_transform || this.$p.y_transform.auto) return

        this.zoom = 1.0
        // TODO: further work (improve scaling ratio)
        if (delta < 0) delta /= 3.75  // Btw, idk why 3.75, but it works
        delta *= 0.25
        this.y_range = [
            this.layout.$_hi,
            this.layout.$_lo
        ]
        this.drug = {
            y: 0,
            z: this.zoom,
            mid: log_mid(this.y_range, this.layout.height),
            A: this.layout.A,
            B: this.layout.B
        }
        this.zoom = this.calc_zoom({
            center: {
                y: delta * this.layout.height
            }
        })

        this.emit('sidebar-transform', {
            grid_id: this.id,
            zoom: this.zoom,
            auto: false,
            range: this.calc_range(diff1, diff2),
            drugging: true
        })
        this.drug = null
        this.emit('sidebar-transform', {
            grid_id: this.id,
            drugging: false
        })
    }

     /**
     * @method listeners
     * @desc use hammer.js to handle doubletap, panstart, panmove, panend
     * @memberof Sidebar
     */
    // TODO: Create listener for mouse wheel zooming, which is more intuitive for desktop users
    // TODO: use abortcontroller to manage event listeners and prevent memory leak, especially when the component is destroyed
    addListeners() {
        // Desktop users : mouse double click - reset zoom 
        this.canvas.addEventListener('dblclick', () => this.onDoubleClick())

        // Pointer down : start click
        this.canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event))

        // Pointer move : click then drag
        this.canvas.addEventListener('pointermove', (event) => this.onPointerMove(event))

        // Pointer up : end drag
        this.canvas.addEventListener('pointerup', () => this.onPointerUp())

    }

    /**
     * @method onDoubleClick
     * @desc Handle double click event for zoom reset, used in addListeners()
     * @memberof Sidebar
     */
    onDoubleClick() {
        this.emit('sidebar-transform', {
            grid_id: this.id,
            zoom: 1.0,
            auto: true
        })
        this.zoom = 1.0
        this.update()
    }

    /**
     * @method onPointerDown
     * @desc Handle pointer down event for double click zoom reset, used in addListeners()
     * @memberof Sidebar
     * @param {PointerEvent} event 
     */
    onPointerDown(event) {
        if (this.$p.y_transform) {
            this.zoom = this.$p.y_transform.zoom
        } else {
            this.zoom = 1.0
        }
        this.y_range = [
            this.layout.$_hi,
            this.layout.$_lo
        ]
        this.drug = {
            y: event.offsetY, // event.center.y, // can not read y ?
            z: this.zoom,
            mid: log_mid(this.y_range, this.layout.height),
            A: this.layout.A,
            B: this.layout.B
        }
    }

    /**
     * @method onPointerMove
     * @desc Handle pointer move event for dragging zoom, used in addListeners()
     * @memberof Sidebar
     * @param {PointerEvent} event
     */
    onPointerMove(event) { 
        if (this.drug) {
            this.zoom = this.calc_zoom(event)
            this.emit('sidebar-transform', {
                grid_id: this.id,
                zoom: this.zoom,
                auto: false,
                range: this.calc_range(),
                drugging: true
            })
            this.update()
        }
    }

    /**
     * @method onPointerUp
     * @desc Handle pointer up event for ending drag, used in addListeners()
     * @memberof Sidebar
     */
    onPointerUp() { 
        this.drug = null
        this.emit('sidebar-transform', {
            grid_id: this.id,
            drugging: false
        })
        
    }

    /**
     * @method removeListeners
     * @desc remove all event listeners to prevent memory leak, especially when the component is destroyed, used in beforeDestroy() lifecycle hook of Chart.vue
     * @memberof Sidebar
     */
    removeListeners() {
        this.canvas.removeEventListener('dblclick', () => this.onDoubleClick())
        this.canvas.removeEventListener('pointerdown', (event) => this.onPointerDown(event))
        this.canvas.removeEventListener('pointermove', (event) => this.onPointerMove(event))
        this.canvas.removeEventListener('pointerup', () => this.onPointerUp())
    }

    mousemove() { }
    mouseout() { }
    mouseup() { }
    mousedown() { }

}
