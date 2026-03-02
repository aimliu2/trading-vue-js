// import FrameAnimation from '../stuff/frame.js' // use in panfade
// import * as Hammer from 'hammerjs'
import Hamster from 'hamsterjs'
import { isMobileOrTablet } from '@stuff/utilities.js'
import { nowTimestamp } from '@stuff/time.js'
import { sym_exp } from '@stuff/math.js'
import { measureText, clamp, processMouseWheelDelta, limitWheelDelta } from '@stuff/utilities.js'
import { nextTick } from 'vue'

/**
 * @typedef Gprops
 * @prop {Object} cursor - cursor object props
 * @prop {Number} interval - interval object props
 * @prop {Object} layout - layout object props
 * @prop {Array} range - range object props
 * @prop {Array} data - data object props
 * @prop {String} grid_id - string id for this grid, used to get the correct layout and data
 * @prop {Object} colors - colors object props
 * @prop {String} tv_id - string id for this tv instance, used in measureText for caching
 * @prop {String} font - font object props
 
 */

/**
 * @typedef GridPayload
 * @prop {Number} wmode - from config prop -- derived from constant.js
 * @prop {Object} emitter - emitter from Vue component, used to emit events to Chart.vue
 * @prop {Number} minzoom - from config prop -- derived from constant.js
 * @prop {Number} maxzoom - from config prop -- derived from constant.js
 * @prop {String} zoom_mode - from config prop -- derived from constant.js
 * @prop {Gprops} sbprops - props of Sidebar.vue forwarded from Chart.vue
 */

/**
 * @class Grid
 * @description Grid class is responsible for handling user interactions with the grid,
 * such as mouse movements, zooming, and panning. It listens to various events and
 * emits Vue events when changes occur (e.g., range changes). It also manages overlays
 * and applies shaders to the grid. Think of it as an I/O system for Grid.vue
 * also emits Vue-events if something has changed (e.g. range)
 */
export default class Grid {

    /**
     * @constructor
     * @memberof Grid
     * @param {HTMLCanvasElement} canvas 
     * @param {GridPayload} payload
     */
    constructor(canvas, payload) {

        this.MIN_ZOOM = payload.minzoom
        this.MAX_ZOOM = payload.maxzoom

        // if (this.isMobileOrTablet) this.MIN_ZOOM *= 0.5

        this.canvas = canvas
        this.ctx = canvas.getContext('2d')

        // this.comp = comp

        this.$p = payload.Gprops
        this.data = this.$p.data // got undefined
        this.range = this.$p.range //
        this.id = this.$p.grid_id // 
        this.layout = this.$p.layout.grids[this.id] //
        this.interval = this.$p.interval // 
        this.cursor = this.$p.cursor
        this.wmode = payload.wmode
        this.emit = payload.emitter

        // this.listeners()
        this.overlays = []
        this.offset_x = 0
        this.offset_y = 0
        this.deltas = 0 // Wheel delta events
        this.isMobileOrTablet = isMobileOrTablet() // check if we are on mobile or Tablet

    }

    /**
     * @method setup
     * @memberof Grid
     * @returns 
     */
    setup() {
        // sometimes canvas is not populated yet, check if canvas is null
        if (!this.canvas) {
            console.error('Canvas is not defined in Grid setup!');
            return;
        }
        let cv = this.canvas
        let dpr = window.devicePixelRatio || 1
        cv.style.width = `${this.layout.width}px`
        cv.style.height = `${this.layout.height}px`
        cv.style.backgroundColor = this.$p.colors.back
        cv.style.overflow = 'hidden'
        if (dpr < 1) dpr = 1 // Realy ? That's it? Issue #63
        nextTick(() => {
            var rect = cv.getBoundingClientRect()
            cv.width = rect.width * dpr
            cv.height = rect.height * dpr
            const ctx = cv.getContext('2d', {
                // TODO: test the boost:
                //alpha: false,
                //desynchronized: true,
                //preserveDrawingBuffer: false
            })
            ctx.scale(dpr, dpr)
            this.update()
            // Fallback fix for Brave browser
            // https://github.com/brave/brave-browser/issues/1738
            if (!ctx.measureTextOrg) { ctx.measureTextOrg = ctx.measureText }
            ctx.measureText = text => measureText(ctx, text, this.$p.tv_id)
        })
    }

    /**
     * @method update
     * @memberof Grid
     * @returns 
     */
    update() {
        // Update reference to the grid
        // TODO: check what happens if data changes interval
        this.layout = this.$p.layout.grids[this.id]
        this.interval = this.$p.interval

        if (!this.layout) return

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if (this.$p.shaders.length) this.apply_shaders()

        this.grid()

        let overlays = []
        overlays.push(...this.overlays)

        // z-index sorting
        overlays.sort((l1, l2) => l1.z - l2.z)

        overlays.forEach(l => {
            if (!l.display) return
            this.ctx.save()
            let r = l.renderer
            if (r.pre_draw) r.pre_draw(this.ctx)
            r.draw(this.ctx)
            if (r.post_draw) r.post_draw(this.ctx)
            this.ctx.restore()
        })

        // update cross hair
        if (this.crosshair) {
            this.crosshair.renderer.draw(this.ctx)
        }
    }

    /**
     * @method addListeners
     * @memberof Grid
     * @returns 
     */
    addListeners() {
        // TODO : add mobile event later
        // exclude mobile event
        // use only hamster(scroll) and mouseclick
        this.hm = Hamster(this.canvas)
        this.hm.wheel((event, delta) => this.mousezoom(-delta * 50, event))
        // can hamster handle wheel event well without having to add listener ?

        // let mc = this.mc = new Hammer.Manager(this.canvas)
        let T = this.isMobileOrTablet ? 10 : 0

        // mc.add(new Hammer.Pan({ threshold: T}))
        // mc.add(new Hammer.Tap())
        // mc.add(new Hammer.Pinch({ threshold: 0}))
        // mc.get('pinch').set({ enable: true })
        // if (this.isMobileOrTablet) mc.add(new Hammer.Press())

        // mc.on('panstart', event => {
        //     if (this.cursor.scroll_lock) return
        //     if (this.cursor.mode === 'aim') {
        //         return this.emit_cursor_coord(event)
        //     }
        //     let tfrm = this.$p.y_transform
        //     this.drug = {
        //         x: event.center.x + this.offset_x,
        //         y: event.center.y + this.offset_y,
        //         r: this.range.slice(),
        //         t: this.range[1] - this.range[0],
        //         o: tfrm ?
        //             (tfrm.offset || 0) : 0,
        //         y_r: tfrm && tfrm.range ?
        //             tfrm.range.slice() : undefined,
        //         B: this.layout.B,
        //         t0: nowTimestamp()
        //     }
        //     this.emit('cursor-changed', {
        //         grid_id: this.id,
        //         x: event.center.x + this.offset_x,
        //         y: event.center.y + this.offset_y
        //     })
        //     this.emit('cursor-locked', true)
        // })
        // use mousedown instead of panstart

        // mc.on('panmove', event => {
        //     if (this.isMobileOrTablet) {
        //         this.calc_offset()
        //         this.propagate('mousemove', this.touch2mouse(event))
        //     }
        //     if (this.drug) {
        //         this.mousedrag(
        //             this.drug.x + event.deltaX,
        //             this.drug.y + event.deltaY,
        //         )
        //         this.emit('cursor-changed', {
        //             grid_id: this.id,
        //             x: event.center.x + this.offset_x,
        //             y: event.center.y + this.offset_y
        //         })
        //     } else if (this.cursor.mode === 'aim') {
        //         this.emit_cursor_coord(event)
        //     }
        // })
        // use mousemove instead of panmove

        // mc.on('panend', event => {
        //     if (this.isMobileOrTablet && this.drug) {
        //         this.pan_fade(event)
        //     }
        //     this.drug = null
        //     this.emit('cursor-locked', false)
        // })
        // use mouse up instead of panend

        // mc.on('tap', event => {
        //     if (!this.isMobileOrTablet) return
        //     this.sim_mousedown(event)
        //     if (this.fade) this.fade.stop()
        //     this.emit('cursor-changed', {})
        //     this.emit('cursor-changed', {
        //         /*grid_id: this.id,
        //         x: undefined,//event.center.x + this.offset_x,
        //         y: undefined,//event.center.y + this.offset_y,*/
        //         mode: 'explore'
        //     })
        //     this.update()
        // })

        // mc.on('press', event => {
        //     if (!this.isMobileOrTablet) return
        //     if (this.fade) this.fade.stop()
        //     this.calc_offset()
        //     this.emit_cursor_coord(event, { mode: 'aim' })
        //     setTimeout(() => this.update())
        //     this.sim_mousedown(event)
        // })
        // use click instead of tap or press

        // mc.on('pinchstart', () =>  {
        //     this.drug = null
        //     this.pinch = {
        //         t: this.range[1] - this.range[0],
        //         r: this.range.slice()
        //     }
        // })

        // mc.on('pinchend', () =>  {
        //     this.pinch = null
        // })

        // mc.on('pinch', event => {
        //     if (this.pinch) this.pinchzoom(event.scale)
        // })

        // let hamster handle wheel (zoom) event
        this.canvas.addEventListener("mousedown", (e) => this.mousedown(e))
        this.canvas.addEventListener("mousemove", (e) => this.mousemove(e))
        this.canvas.addEventListener("mouseup", (e) => this.mouseup(e))
        this.canvas.addEventListener("mouseout", (e) => this.mouseout(e))
        this.canvas.addEventListener("click", (e) => this.click(e)) // do nothing for now
        // for Mobile : disable gesture event
        // this.canvas.addEventListener("gesturestart", (e)=>e.preventDefault() )
        // this.canvas.addEventListener("gesturechange", (e)=>e.preventDefault())
        // this.canvas.addEventListener("gestureend", (e)=>e.preventDefault())

    }

    // panstart equivalent
    mousedown(event) {
        if (this.isMobileOrTablet) return
        this.propagate('mousedown', event)
        // this.emit('cursor-locked', true)
        if (event.defaultPrevented) return
        // Emit grid-mousedown for tools/overlays -- yes don't overlook it
        this.emit('custom-event', { event: 'grid-mousedown', args: [this.id, event] })

        if (this.cursor.scroll_lock) return

        this.calc_offset()
        let x = event.layerX
        let y = event.layerY
        let tfrm = this.$p.y_transform
        this.drug = {
            x: x,
            y: y,
            r: this.range.slice(),
            t: this.range[1] - this.range[0],
            o: tfrm ? (tfrm.offset || 0) : 0,
            y_r: tfrm && tfrm.range ?
                tfrm.range.slice() : undefined,
            B: this.layout.B,
            t0: nowTimestamp()
        }
        this.emit('cursor-changed', {
            grid_id: this.id,
            x: x,
            y: y + this.layout.offset
        })
        this.emit('cursor-locked', true)
    }

    // panmove equivalent
    mousemove(event) {
        if (this.isMobileOrTablet) return
        let x = event.layerX
        let y = event.layerY

        if (this.drug) {
            // Calculate delta from drag start position
            this.mousedrag(
                x,
                y
            )
            this.emit('cursor-changed', {
                grid_id: this.id,
                x: x,
                y: y + this.layout.offset
            })
        } else {
            // Normal hover (no drag) — update crosshair
            this.emit('cursor-changed', {
                grid_id: this.id,
                x: x,
                y: y + this.layout.offset
            })
        }
        this.calc_offset()
        this.propagate('mousemove', event)
    }

    // panend equivalent
    mouseup(event) {
        this.drug = null
        this.emit('cursor-locked', false)
        this.propagate('mouseup', event)
    }

    mouseout(event) {
        if (this.isMobileOrTablet) return
        this.emit('cursor-changed', {})
        this.propagate('mouseout', event)
    }

    click(event) {
        console.log('click the grid') //works
        this.propagate('click', event)
    }

    // event must be HTMLWheelevent
    mousezoom(delta, event) {

        // TODO: for mobile
        if (this.wmode !== 'pass') {
            if (this.wmode === 'click' && !this.$p.meta.activated) {
                return
            }
            event.originalEvent.preventDefault()
            event.preventDefault()
        }

        // revise this later
        event.deltaX = event.deltaX || processMouseWheelDelta(event).x // divide by 12
        event.deltaY = event.deltaY || processMouseWheelDelta(event).y // divide by 12

        if (Math.abs(event.deltaX) > 0) {
            this.trackpad = true
            if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
                delta *= 0.1
            }
            this.trackpad_scroll(event)
        }

        if (this.trackpad) delta *= 0.032

        delta = limitWheelDelta(delta) // if exceed 500, limit it

        // TODO: mouse zooming is a little jerky,
        // needs to follow f(mouse_wheel_speed) and
        // if speed is low, scroll shoud be slower
        if (delta < 0 && this.data.length <= this.MIN_ZOOM) return
        if (delta > 0 && this.data.length > this.MAX_ZOOM) return
        let k = this.interval / 1000
        let diff = delta * k * this.data.length
        let tl = this.zoom_mode === 'tl'
        if (event.originalEvent.ctrlKey || tl) {
            let offset = event.originalEvent.offsetX
            let diff1 = offset / (this.canvas.width - 1) * diff
            let diff2 = diff - diff1
            this.range[0] -= diff1
            this.range[1] += diff2
        } else {
            this.range[0] -= diff
        }

        if (tl) {
            let offset = event.originalEvent.offsetY
            let diff1 = offset / (this.canvas.height - 1) * 2
            let diff2 = 2 - diff1
            let z = diff / (this.range[1] - this.range[0])
            //rezoom_range(z, diff_x, diff_y)
            this.emit('rezoom-range', {
                grid_id: this.id, z, diff1, diff2
            })
        }

        this.change_range()

    }


    // translate tap, press -> mouse click
    // sim_mousedown(event) {
    //     if (event.srcEvent.defaultPrevented) return
    //     this.emit('custom-event', {
    //         event: 'grid-mousedown',
    //         args: [this.id, event]
    //     })
    //     this.propagate('mousemove', this.touch2mouse(event))
    //     this.update()
    //     this.propagate('mousedown', this.touch2mouse(event))
    //     setTimeout(() => {
    //         this.propagate('click', this.touch2mouse(event))
    //     })
    // }

    // Convert touch to "mouse" event
    // use in sim mouse down and pan move
    // touch2mouse(e) {
    //     this.calc_offset()
    //     return {
    //         original: e.srcEvent,
    //         layerX: e.center.x + this.offset_x,
    //         layerY: e.center.y + this.offset_y,
    //         preventDefault: function() {
    //             this.original.preventDefault()
    //         }
    //     }
    // }


    // used in press, panmove, panstart
    // emit_cursor_coord(event, add = {}) {
    //     this.emit('cursor-changed', Object.assign({
    //         grid_id: this.id,
    //         x: event.center.x + this.offset_x,
    //         y: event.center.y + this.offset_y + this.layout.offset
    //     }, add))
    // }

    // used in panend
    // pan_fade(event) {
    //     let dt = nowTimestamp() - this.drug.t0
    //     let dx = this.range[1] - this.drug.r[1]
    //     let v = 42 * dx / dt
    //     let v0 = Math.abs(v * 0.01)
    //     if (dt > 500) return
    //     if (this.fade) this.fade.stop()
    //     this.fade = new FrameAnimation(self => {
    //         v *= 0.85
    //         if (Math.abs(v) < v0) {
    //             self.stop()
    //         }
    //         this.range[0] += v
    //         this.range[1] += v
    //         this.change_range()
    //     })
    // }

    calc_offset() {
        let rect = this.canvas.getBoundingClientRect()
        this.offset_x = -rect.x
        this.offset_y = -rect.y
    }

    /**
     * @method new_layer
     * @desc add overlay thne rerender
     * @param {*} layer
     */
    new_layer(layer) {
        // I have already deleted name property, LOL
        if (layer.name === 'crosshair') {
            this.crosshair = layer
        } else {
            this.overlays.push(layer)
        }
        this.update()
    }

    /**
     * @method del_layer
     * @desc delete overlay by exclude it then rerender
     * @param {*} id 
     */
    del_layer(id) {
        // get id from state var or props ?
        this.overlays = this.overlays.filter(x => x.id !== id)
        this.update()
    }

    show_hide_layer(event) {
        let l = this.overlays.filter(x => x.id === event.id)
        if (l.length) l[0].display = event.display
    }

    apply_shaders() {
        let layout = this.$p.layout.grids[this.id]
        let props = {
            layout: layout,
            range: this.range,
            interval: this.interval,
            tf: layout.ti_map.tf,
            cursor: this.cursor,
            colors: this.$p.colors,
            sub: this.data,
            font: this.$p.font,
            config: this.$p.config,
            meta: this.$p.meta
        }
        for (var s of this.$p.shaders) {
            this.ctx.save()
            s.draw(this.ctx, props)
            this.ctx.restore()
        }
    }

    // Actually draws the grid (for real)
    grid() {

        this.ctx.strokeStyle = this.$p.colors.grid
        this.ctx.beginPath()

        const ymax = this.layout.height
        for (var [x, p] of this.layout.xs) {

            this.ctx.moveTo(x - 0.5, 0)
            this.ctx.lineTo(x - 0.5, ymax)

        }

        for (var [y, y$] of this.layout.ys) {

            this.ctx.moveTo(0, y - 0.5)
            this.ctx.lineTo(this.layout.width, y - 0.5)

        }

        this.ctx.stroke()

        if (this.$p.grid_id) this.upper_border()

    }

    upper_border() {
        this.ctx.strokeStyle = this.$p.colors.scale
        this.ctx.beginPath()
        this.ctx.moveTo(0, 0.5)
        this.ctx.lineTo(this.layout.width, 0.5)
        this.ctx.stroke()
    }

    // use in mousemove (panmove equivalent)
    mousedrag(x, y) {

        let dt = this.drug.t * (this.drug.x - x) / this.layout.width

        let d$ = this.layout.$_hi - this.layout.$_lo
        d$ *= (this.drug.y - y) / this.layout.height
        let offset = this.drug.o + d$

        let ls = this.layout.grid.logScale

        if (ls && this.drug.y_r) {
            let dy = this.drug.y - y
            var range = this.drug.y_r.slice()
            range[0] = sym_exp((0 - this.drug.B + dy) /
                this.layout.A)
            range[1] = sym_exp(
                (this.layout.height - this.drug.B + dy) /
                this.layout.A)
        }

        if (this.drug.y_r && this.$p.y_transform &&
            !this.$p.y_transform.auto) {
            this.emit('sidebar-transform', {
                grid_id: this.id,
                range: ls ? (range || this.drug.y_r) : [
                    this.drug.y_r[0] - offset,
                    this.drug.y_r[1] - offset,
                ]
            })
        }

        this.range[0] = this.drug.r[0] + dt
        this.range[1] = this.drug.r[1] + dt

        this.change_range()

    }

    // used in pinch event
    // pinchzoom(scale) {

    //     if (scale > 1 && this.data.length <= this.MIN_ZOOM) return
    //     if (scale < 1 && this.data.length > this.MAX_ZOOM) return

    //     let t = this.pinch.t
    //     let nt = t * 1 / scale

    //     this.range[0] = this.pinch.r[0] - (nt - t) * 0.5
    //     this.range[1] = this.pinch.r[1] + (nt - t) * 0.5

    //     this.change_range()

    // }

    // use in mousezoom
    trackpad_scroll(event) {
        let dt = this.range[1] - this.range[0]

        this.range[0] += event.deltaX * dt * 0.011
        this.range[1] += event.deltaX * dt * 0.011

        this.change_range()

    }

    // TODO limit scroll when scroll till the origin/ end of the data
    change_range() {

        // TODO: better way to limit the view. Problem:
        // when you are at the dead end of the data,
        // and keep scrolling,
        // the chart continues to scale down a little.
        // Solution: I don't know yet

        if (!this.range.length || this.data.length < 2) return

        let l = this.data.length - 1
        let data = this.data
        let range = this.range

        range[0] = clamp(
            range[0],
            -Infinity, data[l][0] - this.interval * 5.5,
        )

        range[1] = clamp(
            range[1],
            data[0][0] + this.interval * 5.5, Infinity
        )

        // TODO: IMPORTANT scrolling is jerky The Problem caused
        // by the long round trip of 'range-changed' event.
        // First it propagates up to update layout in Chart.vue,
        // then it moves back as watch() update. It takes 1-5 ms.
        // And because the delay is different each time we see
        // the lag. No smooth movement and it's annoying.

        // Solution: we could try to calc the layout immediatly
        // somewhere here. Still will hurt the sidebar & bottombar
        this.emit('range-changed', range)
    }

    // Propagate mouse event to overlays
    // WIP : how to propagate ?
    propagate(name, event) {
        for (var layer of this.overlays) {
            if (layer.renderer[name]) {
                layer.renderer[name](event)
            }
            // TODO bind events
            const mouse = layer.renderer.mouse
            const keys = layer.renderer.keys
            if (mouse.listeners) {
                mouse.emit(name, event)
            }
            if (keys && keys.listeners) {
                keys.emit(name, event)
            }
        }
    }

    removeListener() {
        // this.canvas.removeEventListener("gesturestart", (e)=>e.preventDefault())
        // this.canvas.removeEventListener("gesturechange", (e)=>e.preventDefault())
        // this.canvas.removeEventListener("gestureend", (e)=>e.preventDefault())
        // if (this.mc) this.mc.destroy()
        if (this.hm) this.hm.unwheel()
        this.canvas.removeEventListener("mousedown", (e) => this.mousedown(e))
        this.canvas.removeEventListener("mousemove", (e) => this.mousemove(e))
        this.canvas.removeEventListener("mouseup", (e) => this.mouseup(e))
        this.canvas.removeEventListener("mouseout", (e) => this.mouseout(e))
        this.canvas.removeEventListener("click", (e) => this.click(e))
    }
}
