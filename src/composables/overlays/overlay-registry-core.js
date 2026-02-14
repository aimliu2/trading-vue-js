// core overlays --> move to composables since there guys did not have render properties by themselves
import Spline from "@overlay-comps/Spline_bak.vue"
import Splines from "@overlay-comps/Splines.vue"
import Range from "@overlay-comps/Range.vue"
import Trades from "@overlay-comps/Trades.vue"
import Channel from "@overlay-comps/Channel.vue"
import Segment from "@overlay-comps/Segment.vue"
import Candles from "@overlay-comps/Candles_bak.vue" // upgrading
import Volume from "@overlay-comps/Volume.vue" // upgrading
import Splitters from "@overlay-comps/Splitters.vue" 

// core tools - an extend class/ composable form core overlays
import LineTool from "@overlay-comps/LineTool.vue" // upgrading
import RangeTool from "@overlay-comps/RangeTool.vue" // upgrading

// indicators - an extend class/ composable form core overlays
import SMA from "@composables/overlays/indicators/SMA/SMA.vue"

/**
 * Composable C3 : for Dynamic Overlay Plot(s) and Tool(s)
 * This composable return Overlay Component following chart type i.e. 'EMA' will return 'Spline'
 * Core component will be registered here
 */

/**
 * Issue 1
 * conflict in 'used_for' properties
 * Problem arise because there are 2 scenarios when rendering data
 * 1. complete JSON that come with pre-defined data type, location (onchart+offchart+tools), and value i.e. dummy-data.json
 * 2. incomplete JSON came with ohlcv, that need to re-calculate indicator, other overlay(onchart+offchart+tools), tool, on client (sent to web worker)
 */

/**
 * Solution I1 - Set Datacube ground rule 
 * use_for should be unique
 */

export const CoreRegisteredOverlays = [
  { component: Spline, use_for: ['Spline', 'EMA', 'SMA'], name:'Spline' },
  { component: Splines, use_for: ['Splines', 'DMI'], name:'Splines' },
  { component: Range, use_for: ['Range', 'RSI'], name:'Range' },
  { component: Trades, use_for: ['Trades'], name:'Trades' },
  { component: Channel, use_for: ['Channel', 'KC', 'BB'], name:'Channel' },
  { component: Segment, use_for: ['Segment'], name:'Segment' },
  { component: Candles, use_for: ['Candles'], name:'Candles' },
  { component: Volume, use_for: ['Volume'], name:'Volume' },
  { component: Splitters, use_for: ['Splitters'], name:'Splitters' }
]

// is there a use case where we plot data with tool
// or plot tool with renderer !?
// [improvement] indicator's not suppose to look for use_for properties


// intransition from Vue2 (comp.methods.tool()) -> Vue3

export const CoreRegisteredTools = [
  { component: LineTool, use_for: ['LineTool'], name:'LineTool', info:LineTool.methods.tool() },
  { component: RangeTool, use_for: ['RangeTool'], name:'RangeTool', info:RangeTool.methods.tool() }
]


export const CoreRegisteredIndicators = [
  { component: SMA, use_for: ['SMA-calc'], name:'SMA', conf:{renderer:'Spline'} } // shouldn't have use_for ?
]


/**
 * Issue 2
 * child access properties --> created tight coupling code
 * Gird.vue have to access child component methods such as
 * x.methods.tool(), x.methods.tool, x.methods.calc,  x.methods.calc()
 */

/**
 * Solution 2 : ??????
 */

/**
 * Issue 3
 * inject renderer --> component merge using comp1.mixins.push(comp2)
 * indicator like 'EMA' has property --> conf: { renderer: 'Spline' } which mean
 * EMA must extend its mixin (and other props?) with Spline

 */



/**
 * how does each tool knows how and what to render ?
 * mutate this.sett --> affect --> draw(ctx)
 *  tool() {
            return {
                // Descriptor for the tool
                group: 'Lines', icon: Icons['segment.png'],
                type: 'Segment',
                hint: 'This hint will be shown on hover',
                data: [],     // Default data
                settings: {}, // Default settings
                // Modifications
                mods: {
                    'Extended': {
                        // Rewrites the default setting fields
                        settings: { extended: true },
                        icon: Icons['extended.png']
                    },
                    'Ray': {
                        // Rewrites the default setting fields
                        settings: { ray: true },
                        icon: Icons['ray.png']
                    }
                }
            }
        },
 */

// calc: return script i.e.
// call inject_renderer
/**
 * calc() {
            return {
                props: {
                    length: { def: 12, text: 'Length' }
                },
                conf: { renderer: 'Spline' },
                update: `
                    return ema(close, length)[0]
                `
            }
        }
 */

// extra value return
// name : cross-validate x => x.name === src.conf.renderer in component return list
// __renderer__ : set this indicator props equal to the name of the component that will be use to render



/* -------------------------------------------------------------------------- */
/*                               JsDoc Appendix                               */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                 Extend Type                                */
/* -------------------------------------------------------------------------- */
