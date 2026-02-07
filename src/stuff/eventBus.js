// eventBus.js
// using mitt for global event bus functionality

import mitt from 'mitt';

const emitter = mitt(); // Create the emitter instance

export default emitter; // Export the instance for use in other files
