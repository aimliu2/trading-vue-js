<script>
// Sets up all layers/overlays for the grid with 'grid_id'

import Grid from './js/grid.js'
import Canvas from '../mixins/canvas.js'
import UxList from '../mixins/uxlist.js'

import Crosshair from './Crosshair.vue/index.js' // made V3
import KeyboardListener from './KeyboardListener.vue'
import UxLayer from './UxLayer.vue'

// core overlays
import Spline from "./overlays/Spline_bak.vue" // upgrading
import Splines from "./overlays/Splines.vue" // upgrading
import Range from "./overlays/Range.vue"
import Trades from "./overlays/Trades.vue"
import Channel from "./overlays/Channel.vue"
import Segment from "./overlays/Segment.vue"
import Candles from "./overlays/Candles_bak.vue" // upgrading
import Volume from "./overlays/Volume.vue" // upgrading
import Splitters from "./overlays/Splitters.vue" 
// core tools
import LineTool from "./overlays/LineTool.vue" // upgrading
import RangeTool from "./overlays/RangeTool.vue" // upgrading

// issue 1 : resolve
import {CoreRegisteredComponents} from  "@composables/overlay-registry-core"


export default {
    name: 'Grid',
    props: [
        'sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'overlays',
        'width', 'height', 'data', 'grid_id', 'y_transform', 'font', 'tv_id',
        'config', 'meta', 'shaders'
    ],
    mixins: [Canvas, UxList],
    components: { Crosshair, KeyboardListener },
    created() {
        // List of all possible overlays (builtin + custom) components
        this._list = [
            Spline, Splines, Range, Trades, Channel, Segment,
            Candles, Volume, Splitters, LineTool, RangeTool
        ]
        .concat(this.$props.overlays)
        this._registry = {}

        // We need to know which components we will use. 
        // Custom overlay components overwrite built-ins:
        // since EMA indicator specify use_for = EMA and Spline also specify use_for = EMA
        // this coding create tight coupling
        var tools = []

        // find better way to resistered used_for properties
        // maybe static controller ?
        this._list.forEach((x, i) => {
            let use_for = x.methods.use_for()  // In transition use both V2, V3 syntax
            // this.tool() = descriptor, no function ?
            // if the overlay is a tool, push {use_for, info: } into tools[]
            if (x.methods.tool) tools.push({ use_for, info: x.methods.tool() }) 
            use_for.forEach(indicator => {
                // TO-DO :  it got over written if two or more
                // overlays are compatible with the same use_for i.e. 'EMA'
                this._registry[indicator] = i
            })
        })
        this.$emit('custom-event', { // emit custom-event back to Ancestor 'TradingVue.vue'
            event: 'register-tools', args: tools
        })
        this.$on('custom-event', e => // emit custom-event back to Ancestor 'TradingVue.vue'
            this.on_ux_event(e, 'grid'))
    },
    beforeDestroy () {
        if (this.renderer) this.renderer.destroy()
    },
    mounted() {
        const el = this.$refs['canvas']
        this.renderer = new Grid(el, this)
        this.setup()
        this.$nextTick(() => this.redraw())

    },
    render(h) { // render by function
        const id = this.$props.grid_id
        const layout = this.$props.layout.grids[id]
        return this.create_canvas(h, `grid-${id}`, {
            position: {
                x: 0,
                y: layout.offset || 0
            },
            attrs: {
                width: layout.width,
                height: layout.height,
                overflow: 'hidden'
            },
            style: {
                backgroundColor: this.$props.colors.back
            },
            hs: [
                h(Crosshair, {
                    props: this.common_props(),
                    on: this.layer_events
                }),
                h(KeyboardListener, {
                    on: this.keyboard_events
                }),
                h(UxLayer, {
                    props: {
                        id, tv_id: this.$props.tv_id,
                        uxs: this.uxs,
                        colors: this.$props.colors,
                        config: this.$props.config,
                        updater: Math.random()
                    },
                    on: {
                        'custom-event': this.emit_ux_event
                    }
                })
            ].concat(this.get_overlays(h))
        })
    },
    methods: {
        new_layer(layer) {
            this.$nextTick(() => this.renderer.new_layer(layer))
        },
        del_layer(layer) {
            this.$nextTick(() => this.renderer.del_layer(layer))
            const grid_id = this.$props.grid_id
            this.$emit('custom-event', {
                event: 'remove-shaders',
                args: [grid_id, layer]
            })
            // TODO: close all interfaces
            this.$emit('custom-event', {
                event: 'remove-layer-meta',
                args: [grid_id, layer]
            })
            this.remove_all_ux(layer)
        },
        get_overlays(h) {
            // Distributes overlay data & settings according
            let comp_list = [], count = {}

            for (var d of this.$props.data) {
                // match d.type (from json i.e. 'KC') to reponsible component
                // i.e. _registry['EMA'] = 1 => _list[1] got Spline Component
                // let comp = this._list[this._registry[d.type]] // comment this line
                // get first component from CoreRegisteredComponents, filter with d type
                const comps = CoreRegisteredComponents
                    .filter(item => item.use_for.includes(d.type))
                    .map(item => item.component); // got component Object i.e. [Spline, EMA]
                let comp = comps[0]; // get only first component = Spline
                if (comp) {
                    if(comp.methods.calc) { // indicator i.e. 'EMA' has calc methods 
                        // send to webworker --> calculate value from function -->
                        // render overlay component with calculated value
                        comp = this.inject_renderer(comp)
                    }
                    comp_list.push({
                        cls: comp,
                        type: d.type,
                        data: d.data,
                        settings: d.settings,
                        i0: d.i0,
                        tf: d.tf,
                        last: d.last
                    })
                    count[d.type] = 0
                }
            }
            return comp_list.map((x, i) => h(x.cls, {
                    on: this.layer_events,
                    attrs: Object.assign(this.common_props(), {
                        id: `${x.type}_${count[x.type]++}`,
                        type: x.type,
                        data: x.data,
                        settings: x.settings,
                        i0: x.i0,
                        tf: x.tf,
                        num: i,
                        grid_id: this.$props.grid_id,
                        meta: this.$props.meta,
                        last: x.last
                        // havn't seen __renderer__ here
                    })
                })
            )
        },
        common_props() {
            return {
                cursor: this.$props.cursor,
                colors: this.$props.colors,
                layout: this.$props.layout.grids[this.$props.grid_id],
                interval: this.$props.interval,
                sub: this.$props.sub,
                font: this.$props.font,
                config: this.$props.config,
            }
        },
        emit_ux_event(e) {
            let e_pass = this.on_ux_event(e, 'grid')
            if (e_pass) this.$emit('custom-event', e)
        },
        // Replace the current comp with 'renderer'
        inject_renderer(comp) {
            let src = comp.methods.calc()
            // no conf or pre-defined __renderer__
            if (!src.conf || !src.conf.renderer || comp.__renderer__) {
                return comp // return component as-is if there is no conf i.e. conf: { renderer: 'Spline' } return to src
            }

            // Search for an overlay to render with the target 'name' i.e. use Spline to render SMA indicaotr
            let f = this._list.find(x => x.name === src.conf.renderer)
            if (!f) return comp // return component as-is if there is no pre-defined overlay to render

            comp.mixins.push(f) // huh ?, why push entire component into mixin ?
            comp.__renderer__ = src.conf.renderer // why !? Vue renderer !?

            return comp
        }
    },
    computed: {
        is_active() {
            return this.$props.cursor.t !== undefined &&
            this.$props.cursor.grid_id === this.$props.grid_id
        }
    },
    watch: {
        range: {
            handler: function() {
                // TODO: Left-side render lag fix:
                // Overlay data is updated one tick later than
                // the main sub. Fast fix is to delay redraw()
                // call. It will be a solution until a better
                // one comes by.
                this.$nextTick(() => this.redraw())
            },
            deep: true
        },
        cursor: {
            handler: function() {
                if (!this.$props.cursor.locked) this.redraw()
            },
            deep: true
        },
        overlays: {
            /**
             * 
             * @param ovs calc() {
             *      return {
             *         props: {
             *              length: { def: 12, text: 'Length' }
             *          },
             *          conf: { renderer: 'Spline' },
             *          update: `
             *              return ema(close, length)[0]
             *          `
             *      }
             *  }
             */
            // Track changes in calc() functions
            handler: function(ovs) {
                for (var ov of ovs) {
                    for (var comp of this.$children) {
                        if (typeof comp.id !== 'string') continue
                        let tuple = comp.id.split('_')
                        tuple.pop()
                        if (tuple.join('_') === ov.name) {
                            comp.calc = ov.methods.calc
                            if (!comp.calc) continue
                            let calc = comp.calc.toString()
                            if (calc !== ov.__prevscript__) {
                                comp.exec_script()
                            }
                            ov.__prevscript__ = calc
                        }
                    }
                }
            },
            deep: true
        },
        // Redraw on the shader list change
        shaders(n, p) { this.redraw() }
    },
    data() {
        return {
            layer_events: {
                'new-grid-layer': this.new_layer,
                'delete-grid-layer': this.del_layer,
                'show-grid-layer': d => {
                    this.renderer.show_hide_layer(d)
                    this.redraw()
                },
                'redraw-grid': this.redraw,
                'layer-meta-props': d => this.$emit('layer-meta-props', d),
                'custom-event': d => this.$emit('custom-event', d)
            },
            keyboard_events: {
                'register-kb-listener': event => {
                    this.$emit('register-kb-listener', event)
                },
                'remove-kb-listener': event => {
                    this.$emit('remove-kb-listener', event)
                },
                'keyup': event => {
                    if (!this.is_active) return
                    this.renderer.propagate('keyup', event)
                },
                'keydown': event => {
                    if (!this.is_active) return // TODO: is this needed? Good Question !
                    this.renderer.propagate('keydown', event)
                },
                'keypress': event => {
                    if (!this.is_active) return
                    this.renderer.propagate('keypress', event)
                },
            }
        }
    }
}

</script>

<style>
    .hidden {
        display: none;
    }
</style>