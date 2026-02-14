<script>
// Spline renderer. (SMAs, EMAs, TEMAs, etc.)

// TODO: make a real spline, not a bunch of lines
// Huh !?

// Adds all necessary stuff for you.
import Overlay from '../../mixins/overlay.js'

export default {
    name: 'Spline',
    mixins: [Overlay],
    methods: {
        meta_info() {
            return { author: 'C451', version: '1.1.2' }
        },
        draw(ctx) {
            ctx.lineWidth = this.line_width
            ctx.strokeStyle = this.color
            ctx.beginPath()

            const layout = this.$props.layout
            const i = this.data_index
            const data = this.$props.data

            if (!this.skip_nan) {
                for (var k = 0, n = data.length; k < n; k++) {
                    let p = data[k]
                    let x = layout.t2screen(p[0])
                    let y = layout.$2screen(p[i])
                    ctx.lineTo(x, y)
                }
            } else {
                var skip = false
                for (var k = 0, n = data.length; k < n; k++) {
                    let p = data[k]
                    let x = layout.t2screen(p[0])
                    let y = layout.$2screen(p[i])
                    if (p[i] == null || y !== y) {
                        skip = true
                    } else {
                        if (skip) ctx.moveTo(x, y)
                        ctx.lineTo(x, y)
                        skip = false
                    }
                }
            }
            ctx.stroke()
        },

        // For all data with these types overlay will be
        // added to the renderer list. And '$props.data'
        // will have the corresponding values. If you want to
        // redefine the default behviour for a prticular
        // indicator (let's say EMA),
        // just create a new overlay with the same type:
        // e.g. use_for() { return ['EMA'] }.
        use_for() { return ['Spline', 'EMA', 'SMA'] },

        // Colors for the legend, should have the
        // same dimention as a data point (excl. timestamp)
        data_colors() { return [this.color] }
    },
    // Define internal setting & constants here
    computed: {
        sett() {
            return this.$props.settings
        },
        line_width() {
            return this.sett.lineWidth || 0.75
        },
        color() {
            const n = this.$props.num % 5
            return this.sett.color || this.COLORS[n]
        },
        data_index() {
            return this.sett.dataIndex || 1
        },
        // Don't connect separate parts if true
        skip_nan() {
            return this.sett.skipNaN
        }
    },
    data() {
        return {
            COLORS:
            [
                '#42b28a', '#5691ce', '#612ff9',
                '#d50b90', '#ff2316'
            ]
        }
    }

}
</script>
