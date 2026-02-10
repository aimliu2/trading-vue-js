<template>
<div>
    <div 
    id="test-title" 
    :style="{'background': (state.isNight ? null : '#fff')}"
    >
        <h3>{{ state.icon }} {{ state.name }}</h3>
        <p>
            {{ state.description }} [{{ state.test_index+1 }}/{{ state.len }}]
            <span 
            v-if="state.isExperimental" 
            class="early-test"
            >
                ⚠️ <label>Experimental</label>
            </span>
        </p>
        <span class="night-mode">
            <label>
                <input 
                v-model="state.isNight" 
                type="checkbox" 
                >
                Night Mode
            </label>
        </span>
        <a 
            href="#" 
            class="test-btn prev-test"
            @click="prev_test"
            >
            Prev test
        </a>
        <a 
            href="#" 
            class="test-btn next-test"
            @click="next_test"
            >
            Next test
        </a>
    </div>
    <div id="test-container">
        <!-- dynamic juggling components -->
        <component 
            :is="state.current_test"
            :night="state.isNight"
        />
    </div>
</div>
</template>

<script setup>
import {reactive, onBeforeMount,onMounted, onUnmounted} from 'vue'
import {int_clamp} from '../src/stuff/utils.ts'
import emitter from '../src/helpers/eventbus.js'

import Simple from './tests/Simple.vue'
// import Stocks from './tests/Stocks.vue'
// import Timeframes from './tests/Timeframes.vue'
// import Multichart from './tests/Multichart.vue'
// import LegendButtons from './tests/LegendButtons.vue'
// import ChartTypes from './tests/ChartTypes.vue'
// import DataHelper from './tests/DataHelper.vue'
import Toolbar from './tests/Toolbar.vue'
// import GridSettings from './tests/GridSettings.vue'
// import Interfaces from './tests/Interfaces.vue'
// import IndexBased from './tests/IndexBased.vue'
// import Performance from './tests/Performance.vue'
// import Renko from './tests/Renko.vue'
// import Scripts from './tests/Scripts.vue'
// import Extensions from './tests/Extensions.vue'
// import Datasets from './tests/Datasets.vue'

// component Array<Object>
const testCases = [
    Simple, 
    // Stocks, 
    // Timeframes, 
    // Multichart,
    // LegendButtons, 
    // ChartTypes, 
    // DataHelper, 
    Toolbar,
    // GridSettings, 
    // Interfaces, 
    // IndexBased, 
    // Performance,
    // Renko, 
    // Scripts, 
    // Extensions, 
    // Datasets
]

// declare reactive state on this components
const state = reactive({
  test_index: 0, // number, test case index
  current_test: Simple, // Components, including its props
  len: testCases.length, // number, total cases
  isNight: false, // start with day theme
  icon:'',
  name:'',
  description:'',
  isExperimental:''
}); // no actively watch or computed



// composition api: methods
const next_test = () => {
    if (++state.test_index >= state.len) { // positive overflow
        state.test_index = 0
    }
    state.current_test = testCases[state.test_index]
    // location.hash = state.test_index + 1 // update URL params
}

const prev_test = () => {
    let list = Object.values(testCases)
    if (--state.test_index < 0) { // negative overflow
        state.test_index = state.len - 1
    }
    state.current_test = testCases[state.test_index]
    // location.hash = state.test_index + 1 // update URL params
}

/**
 * update state variable (title), emitted from component when mounted
 * @param payload = {name:string, description:string, icon:string}
 * @return void
 */
const mountHandler = (payload) =>{
    state.icon = payload.icon
    state.name = payload.name
    state.description = payload.description
    state.isExperimental = payload.early
}

// composition api: life-cycle hooks
onBeforeMount(() => { // server side executed, no DOM
    // event listener
    emitter.on('testcase-mount', mountHandler);
}),
onMounted(() => { // client side executed, on browser
    let hashId = parseInt(location.hash.slice(1));
    hashId = hashId ? hashId : 0 // i.e. #12 -> 12, # -> 1
    let idx = int_clamp(hashId, 1, state.len); // get clean integer clamped value between [1, len]
    let arr_idx = (idx <= 1) ? 0 : idx - 1;
    state.current_test = testCases[arr_idx]
    state.test_index = arr_idx;
    // location.hash = state.test_index + 1 // clean URL params
}),
onUnmounted(()=>{
    // off all emitter on 'testcase-mount'
    emitter.off('testcase-mount')
})

</script>

<style>
html,
body {
    background-color: #34363c;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system,BlinkMacSystemFont,
    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
    Fira Sans,Droid Sans,Helvetica Neue,
    sans-serif;
}
#test-title{
    position: absolute;
    height: 50px;
    color: #ddd;
    width: 100%;
    background: #121826;
    border-bottom: 1px solid #8080804f;
    z-index: 1000;
}
#test-container{
    position: absolute;
    top: 50px;
    width: 100%;
}
#test-title h3 {
    color: #c5c5c5;
    margin: 7px 0 0 10px;
    font-weight: 600;
    font-size: 1.75em;
}
@media only screen and (max-device-width: 480px) {
    #test-title h3 {
        font-size: 1.25em;
        margin-top: 14px
    }
}
#test-title p {
    position: absolute;
    width: 100%;
    top: 1px;
    text-align: center;
    font-weight: 200;
    color: #b7b7b7;
}
@media only screen and (max-device-width: 800px) {
    #test-title p {
        display: none;
    }
}
.test-btn {
    top: 12px;
    position: absolute;
    right: 10px;
	background-color:#44c767;
	-moz-border-radius:28px;
	-webkit-border-radius:28px;
	border-radius:28px;
	//border:1px solid #18ab29;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	padding:5px 17px;
	text-decoration:none;
    text-shadow:0px 1px 0px #2f6627;
}
@media only screen and (max-device-width: 480px) {
    .test-btn {
        font-size:12px;
        padding:5px 10px;
        right: 7px;
    }
}
.test-btn:active {
	top: 13px;
}

.prev-test {
    right: 115px;
    background-color:#4285f4;
}
@media only screen and (max-device-width: 480px) {
    .prev-test {
        right: 80px;
    }
}
.test-btn .prev-test:hover {
	background-color:#44c767;
}

.test-btn .next-test:hover {
	background-color:#44c767;
}

.night-mode {
    position: absolute;
    top: 17px;
    right: 220px;
    color: #888;
    font: 11px -apple-system,BlinkMacSystemFont,
        Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
        Fira Sans,Droid Sans,Helvetica Neue,
        sans-serif
}
.night-mode label {
    vertical-align:top;
    line-height: 1.75em;
}
@media only screen and (max-device-width: 480px) {
    .night-mode {
        right: 155px;
    }
    .night-mode label {
        line-height: 2.2em;
    }
}
@media only screen and (max-device-width: 800px) {
    .night-mode {
        top: 14px;
    }
    .night-mode label {
        line-height: 2.2em;
    }
}
.early-test {
    line-height: 0;
    font-weight: 500;
}
.early-test label {
    margin-left: 5px;
}

</style>
