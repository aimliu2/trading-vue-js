# To-do
- Cursor props must be deeply watch because of ???
- import computed don't have to unwrapped. computed is also read-only, immutable
- overlay in [Grid.vue](/src/components/Grid.vue#created()) was drawn on [UxLayer](/src/components/UxLayer.vue)
---






### create price API
- [] fetch from static path with `.tvjs` format





### revert to register component
- [x] uncommented register event from [Grid.vue](/src/components/Grid.vue#created())
- [x] remove tools from data-aggregator in [data-aggregator](src/composables/data/data-aggregator.js)
- [x] omitted setup in [dc_core](/src/helpers/dc_core.js)
- [x] test on test --> see if it works
- [x] remove console from [dc_events](/src/helpers/dc_events.js#register_tools())

### Test toolbar case
- [x] upgrade jsDoc syntax (and docdash custom template)
- [x] upgrade [ItemList.vue](/src/components/ItemList.vue) to Vue3
- [x] upgrade [ToolbarItem.vue](/src/components/ToolbarItem.vue) to Vue3

### Migrate each components to Vue3
- [>] change [Grid.vue](/src/components/Grid.vue) logic - decoupling parent-child methods -> [Overlay-registry](/src/composables/overlay-registry-core.js)
    - [x] Complicated than I thought, do overlay/tool matching first
- [>] [Spline.vue](/src/components/overlays/Spline.vue)
- [x] [Crosshair.vue](/src/components/Crosshair3.vue) - **Cursor props must be deeply watch because of ???**

### By components edit start from 16 test cases
- for some reason overlay are reactive inside datacube
- [x] upgraded [App.vue](/src/App.vue) [Test.vue](/test/Test.vue) to Vue3, reduce reactivity in composable
- [x] upgraded [Simple.vue](/test/tests/Simple.vue) to Vue3
- [>] problem : Datacube was deeply reactive, can not fully re-render on even computed

### figure how test mechanic works, how did it inject test menu navigator !?
**webpack**
- fixed entry point in [test.config.js](/webpack/test.config.js) and [dev.config.js](/webpack/dev.config.js)
- add resolve alias in settings
- [>] use vite to serve app instead of webpack
```markdown
add vite in dependencies
modified path
fixed $set syntax
upgraded emitter $on/$emit syntax (use mitt) --> cannot ditch $on/$emit, legacy emitt is still needed
fixed onrender (Vue2) syntax, import h function (vDOM)
broken, LOL --> move to vite would be the final task :(
```

### adjust vue3 syntax
- [x] tried upgraded landing page using vue3 syntax, start with lifecycle hook
```markdown
- app load `TradingVue` as core component and render at home
- composition API; life-cycle hook;
    - instead of always coded at component
    - directly coded in js coded, or imported js lib
- composition API; methods
    - just turn it into regular funtion
- composition API; props
    - define props value at parent, then props down into component (like react)
- composiiton API; name & components
    - automatically included when using script setup, wow
```

### Determine landing page
- [x] select case Simple - as test landing page

### create first runnable chart from old code
- [x] remove [package-lock.json](/)
- [x] installed node_modules using Bun, created [bun.lock](/bun.lock) instead
- [x] run test command `bun run test`
- [x] app, preloaded with 16 cases, served at [http://0.0.0.0:8080/](http://0.0.0.0:8080/)
