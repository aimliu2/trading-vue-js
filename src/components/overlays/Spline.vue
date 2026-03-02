
<script setup>
// Spline renderer. (SMAs, EMAs, TEMAs, etc.)

// TODO: make a real spline, not a bunch of lines
// Huh !?

// Adds all necessary stuff for you.
import Overlay from '../../../src/composables/overlay-composer.js'
// import Overlay from '../../mixins/overlay.js'
import {ref, computed} from 'vue'

// internal constant
const initState = ['#42b28a', '#5691ce', '#612ff9','#d50b90', '#ff2316'] // green, greyblue, violet, fusia, red
const name =  'Spline'
const splineUsefor = ['Spline', 'EMA', 'SMA']

// internal reactive var
const COLORS = ref(initState);

// props pass from parent
const props = defineProps({
    settings:Object, // required
    num:Number,
    color:String, // ?
    layout:Object,
    data:Object
})

// methods
// Colors for the legend, should have the
// same dimension as a data point (excl. timestamp)
const data_colors = () => [props.color]
const use_for = () => splineUsefor // and beyond
const meta_info = () => {return {author: 'C451', version: '1.1.2' }}
const draw = (ctx) => {
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = strokeColor
            ctx.beginPath()

            const layout = props.layout
            const i = dataIndex
            const data = props.data

            if (!skipNaN) {
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
        }

// Explicitly expose the method to parents
defineExpose({
  data_colors,
  use_for,
  meta_info,
  draw,
  name
});

// computed - Define internal setting & constants here
const sett = computed(()=> props.settings) // shouldn't be get !?
const lineWidth = computed(()=> sett.lineWidth || 0.75)
const strokeColor = computed(()=> {
    let n = props.num % 5
    return sett.color || COLORS.value[n]
})
const dataIndex = computed(()=> sett.dataIndex || 1)
const skipNaN = computed(()=> sett.skipNaN)

// export default {
//     mixins: [Overlay]
// }
</script>
