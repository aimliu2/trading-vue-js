// used in dev.config.js
// Vue 3
// import { createApp } from 'vue';
// Import the root component (usually App.vue in a Single-File Component setup)
import App from './App.vue';
import Vue from 'vue' // Vue 2
// Create the application instance, passing the root component as an argument
// const app = createApp(App);


// MOB_DEBUG=true npm run test - Enables mobile debugging
// (sending console output to the webpack terminal)
// if (MOB_DEBUG) {
//     console.log = debug
//     console.error = debug
//     console.warn = debug
// }

new Vue({render: h => h(App)}).$mount('#app');

// function debug(...argv) {
//     fetch('/debug?argv=' + JSON.stringify(argv))
// }