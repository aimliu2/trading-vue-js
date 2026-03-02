
/**
 * @namespace tvjs
 * @description The main entry point for the TVJS application. This file initializes the Vue application and mounts it to the DOM.
 */
// Vue 3
import App from './App.vue';
import { createApp } from 'vue';
const app = createApp(App);
app.mount('#app'); // Mount the app to an element with the id of 'app'

// Vue 2
// import Vue from 'vue';
// import App from './App.vue';
// new Vue({render: h => h(App)}).$mount('#app'); // Vue2

// function debug(...argv) {
//     fetch('/debug?argv=' + JSON.stringify(argv))
// }

// MOB_DEBUG=true npm run dev - Enables mobile debugging
// (sending console output to the webpack terminal)
// if (MOB_DEBUG) {
//     console.log = debug
//     console.error = debug
//     console.warn = debug
// }

// new Vue({render: h => h(App)}).$mount('#app'); // Vue2

