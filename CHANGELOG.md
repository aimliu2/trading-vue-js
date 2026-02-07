# To-do

### migrate all code to Vue3 before switch to Vite
- [ ] Simplified `Grid.vue`


### figure how test mechanic works, how did it inject test menu navigator !?
webpack : entry point in `test.config.js` and  `dev.config.js`
- [ ] use vite to serve app instead of webpack
```
add vite in dependencies
modified path
fixed $set syntax
upgraded emitter $on/$emit syntax (use mitt)
fixed onrender (Vue2) syntax, import h function (vDOM)
broken, LOL -- move to vite would be the final task :(
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
- [x] select case 1

### create first runnable chart from old code
- [x] remove `package-lock.json`
- [x] `bun init` install node_modules using Bun, created `bun.lock` instead
- [x] run test command `bun run test`
- [x] app, preloaded with 16 cases, served at
```markdown
http://0.0.0.0:8080/
```
