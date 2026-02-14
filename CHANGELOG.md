# To-do
- Cursor props must be deeply watch because of ???
- import computed don't have to unwrapped
    - computed is read-only, immutable

### Test toolbar case
- [ ] upgrade jsDoc syntax (and docdash custom template)
- [ ] upgrade [ItemList.vue](/src/components/ItemList.vue) to Vue3
- [ ] upgrade [ToolbarItem.vue](/src/components/ToolbarItem.vue) to Vue3
- [ ] upgrade [Toolbar.vue](/src/components/Toolbar.vue) to Vue3
- [ ] [dc_core](/src/helpers/dc_core.js) set neither "tools nor "tool"
    - Tools were registered as a custom event fired from [Grid.vue](/src/components/Grid.vue), built in [dc_events](/src/helpers/dc_events.js#register_tools())
    - Upgraded : raw Tools scheme were fetched from profile-api, built, then aggregate into Datacube
- [ ] Fixed problem : For some reason Vue.js doesn't want to update 'tools' automatically when new item is pushed/removed.
    - [ ] handle case where tool from profile-api was dynamically added or remove

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
