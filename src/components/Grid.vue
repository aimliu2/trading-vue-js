<script>
// Sets up all layers/overlays for the grid with 'grid_id'

import Grid from './js/grid.js'
import Canvas from '../mixins/canvas.js'
import UxList from '../mixins/uxlist.js'

import Crosshair from './Crosshair3.vue' // made V3
import KeyboardListener from './KeyboardListener.vue'
import UxLayer from './UxLayer.vue'

// import core overlays, tools, indicators
import {CoreRegisteredOverlays, CoreRegisteredTools, CoreRegisteredIndicators} from  "@composables/overlays/overlay-registry-core"

// extend overlays, tools, indicators, etc. later
// import {ExRegisteredComponents} from  "@composables/overlay-registry-extra"

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
        // also concat tool from this.$props.overlays
        let tools_core = CoreRegisteredTools.map(({ use_for, info }) => ({ use_for:use_for[0], info })); 

        // fire event oncreated
        this.$emit('custom-event', { // emit custom-event back to Ancestor 'TradingVue.vue'
            event: 'register-tools', args: tools_core
        })
        this.$on('custom-event', e => // received event from on_ux_event 'TradingVue.vue'
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
            // Distributes overlay data & settings according to Datacube input
            let comp_list = [], count = {}, indy = null;
            
            for (var d of this.$props.data) { // upgrade to map later
                // match d.type (i.e. 'KC') in this.$props.data and 
                // [WIP] : upgrade later
                // TODO : add render selection later
                let overlays = CoreRegisteredOverlays
                    .filter(item => item.use_for.includes(d.type))
                    .map(item => item.component); // got Overlay Component i.e. [Spline]

                // TODO : add render selection later
                let tools = CoreRegisteredTools
                    .filter(item => item.use_for.includes(d.type))
                    .map(item => item.component); // got Tool Component i.e. [LineTool]

                let indies = CoreRegisteredIndicators
                    .filter(item => item.use_for.includes(d.type))
                    .map(item => item.component); // got Indicator Component i.e. [SMA]

                if(indies[0]) indy = this.inject_renderer(indies[0]); // d.type is indicator

                // also concat overlay from this.$props.overlays
                let comp = (overlays[0] || tools[0] || indy); // get only first component = Spline
                if (comp) { 
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
        // Replace the current component with 'renderer'
        // exclusive to indicator those who had 'conf' and calc() method i.e. conf: { renderer: 'Spline' }
        // what use to render SplineUX ?
        inject_renderer(comp) {
            let src = comp.methods.calc()
            if (!src.conf || !src.conf.renderer || comp.__renderer__) {
                return comp // return component as-is if there is no conf
            }
            // Search for an overlay to render with the target 'name' i.e. use Spline to render SMA indicaotr
            let f = CoreRegisteredOverlays.find(x => x.name === src.conf.renderer)
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