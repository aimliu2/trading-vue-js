
<script>
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator

import Overlay from '../../mixins/overlay.js' // Where is it usage ?

import { layout_cnv } from '../js/layout_cnv.js'
import Candle from '../primitives/candle.js'
import Volbar from '../primitives/volbar.js'
import Price from '../primitives/price.js'
import {computed, ref} from 'vue'

// props from parent
const props = defineProps({
  sub: Object,
  data:Object,
  layout:Object, // candle, volume
  settings:Object,
  colors:Object,
})

// internal reactive state var (deep)
// Price object
const priceObj = {price:{}};
const priceState = ref(priceObj);

// methods
const meta_info = () => {return { author: 'C451', version: '1.2.1' }} // where ?
const init = () => {priceState.value = new Price(priceObj)} // init value through method, can be shorten
const use_for = () => { return ['Candles'] }
const y_range = () =>  {
            var hi = -Infinity, lo = Infinity
            for (var i = 0, n = props.sub.length; i < n; i++) {
                let x = props.sub[i]
                if (x[2] > hi) hi = x[2]
                if (x[3] < lo) lo = x[3]
            }
            return [hi, lo]
        }

const draw = (ctx) => {

            // If data === main candlestick data
            // render as main chart:
            if (props.sub === props.data) {
                var cnv = {
                    candles: props.layout.candles,
                    volume: props.layout.volume,
                }
            // Else, as offchart / onchart indicator:
            } else {
                cnv = layout_cnv(props)
            }

            if (show_volume) {
                var cv = cnv.volume
                for (var i = 0, n = cv.length; i < n; i++) {
                    new Volbar(props, ctx, cv[i])
                }
            }

            var cc = cnv.candles
            for (var i = 0, n = cc.length; i < n; i++) {
                new Candle(props, ctx, cc[i])
            }

            if (price_line) priceState.value.draw(ctx)
        }

// computed
const sett = computed(()=> props.settings) // isn't it already reactive ?
// nested computed - expensive computing
const show_volume = computed(()=> 'showVolume' in sett ? sett.showVolume : true )
const price_line = computed(()=> 'priceLine' in this.sett ? this.sett.priceLine : true)
const colorCandleUp = computed(()=> sett.colorCandleUp || props.colors.candleUp )
const colorCandleDw = computed(()=> sett.colorCandleDw || props.colors.candleDw )
const colorWickUp = computed(()=> sett.colorWickUp || props.colors.wickUp )
const colorWickDw = computed(()=> sett.colorWickDw || props.colors.wickDw )
const colorWickSm = computed(()=> sett.colorWickSm || props.colors.wickSm )
const colorVolUp = computed(()=> sett.colorVolUp || props.colors.volUp)
const colorVolDw = computed(()=> sett.colorVolDw || props.colors.volDw)

export default {
    name: 'Candles',
    mixins: [Overlay]
}

</script>
