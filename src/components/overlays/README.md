# Here goes your code. You are provided with: `All stuff is reactive`

- $props.layout(Object) -> positions of all chart elements + some helper functions (see layout_fn.js)

- $props.interval(Number) -> candlestick time interval

- $props.sub(Array) -> current subset of candlestick data

- $props.data -> your indicator's data subset. Comes "as is", should have the following format: [[<timestamp>, ... ], ... ]

- $props.colors(Object) -> colors (see TradingVue.vue)

- $props.cursor(Object) -> current position of crosshair

- $props.settings(Object) -> indicator's custom settings E.g. colors, line thickness, etc. You define it.

- $props.num(Number?) -> indicator's layer number (of All layers in the current grid)

- $props.id(String?) -> indicator's id (e.g. EMA_0)


# [Overlay](../../mixins/overlay.js) note
- used_for : method

For all data with these types [Overlay](../../mixins/overlay.js) will be added to the renderer list. And '$props.data' will have the corresponding values. If you want to redefine the default behviour for a prticular indicator (let's say EMA), just create a new overlay with the same type:
```js
e.g. use_for() { return ['EMA'] }.
```