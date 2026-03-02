
<template>
    <div class="trading-vue-toolbar" :style="styles" :key="state.tool_count">
        <template v-for="(tool, i) in toolGroups" :key="i">
            <toolbar-item v-if="tool.icon && !tool.hidden"
                @item-selected="selected"
                :data="tool"
                :subs="state.sub_map"
                :dc="props.data"
                :config="props.config"
                :colors="props.colors"
                :selected="is_selected(tool)">
            </toolbar-item>
        </template>
    </div>
</template>

<script setup>
import ToolbarItem from '@components/ToolbarItem.vue'
import {reactive, onMounted, computed} from 'vue'

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */
/* -------------------------------- state-var ------------------------------- */
// see if tools count change and have to force re-render
const initState = { tool_count: 0, sub_map: {} }; 
const state = reactive(initState);

/* ---------------------------------- props --------------------------------- */
const props = defineProps({
    data:Object, // tool data from datacube
    height:Number, 
    colors:Object, 
    tv_id:String, // what for ? --> draw on multi screen tf
    config:Object
})

/* --------------------------------- emitter -------------------------------- */
const emit = defineEmits(['custom-event'])

/* -------------------------------------------------------------------------- */
/*                                   methods                                  */
/* -------------------------------------------------------------------------- */
const selected = (tool) => {
            emit('custom-event', {
                event:'tool-selected', args: [tool.type]
            })
            if (tool.group) {
                // TODO: emit the sub map to DC (save)
                state.sub_map[tool.group] = tool.type
            }
        }

const is_selected = (tool) => {
            if (tool.group) {
                return !!tool.items.find(
                    x => x.type === props.data.tool)
            }
            return tool.type === props.data.tool
        }

/* -------------------------------------------------------------------------- */
/*                                  computed                                  */
/* -------------------------------------------------------------------------- */
const styles = computed(() => {
            let b = props.config.TB_BORDER
            let w = props.config.TOOLBAR - b
            let c = props.colors.grid
            let cb = props.colors.tbBack || props.colors.back
            let brd = props.colors.tbBorder || props.colors.scale
            let st = props.config.TB_B_STYLE
            return {
                'width': `${w}px`,
                'height': `${props.height-3}px`,
                'background-color': cb,
                'border-right': `${b}px ${st} ${brd}`
            }
        })
     
const toolGroups = computed(() => {
            let arr = []
            for (let tool of props.data.tools || []) {
                if (!tool.group) {
                    arr.push(tool)
                    continue
                }
                let g = arr.find(x => x.group === tool.group)
                if (!g) {
                    arr.push({
                        group: tool.group,
                        icon: tool.icon || '',
                        items: [tool]
                    })
                } else {
                    g.items.push(tool)
                }
            }
            return arr
        })

/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
// onMounted(()=>{
    // console.log("tool init")
    // console.log(props.data) // got injected from grid.vue emitted event
    // see if (n.tools) state.tool_count = n.tools.length is needed
// })
</script>

<style>
.trading-vue-toolbar {
    position: absolute;
    border-right: 1px solid black;
    z-index: 101;
    padding-top: 3px;
    user-select: none;
}
</style>
