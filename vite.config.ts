import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

import { defineConfig, build, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sirv from 'sirv'
import lz from 'lz-string'

const WW_SRC  = fileURLToPath(new URL('./src/helpers/script_ww.js', import.meta.url))
const WW_OUT  = fileURLToPath(new URL('./src/helpers/tmp/ww$$$.json', import.meta.url))

// Port of webpack/ww_plugin.js — compiles script_ww.js as an IIFE worker,
// lz-compresses the output, and writes src/helpers/tmp/ww$$$.json so that
// script_ww_api.js can spawn the worker via a Blob URL at runtime.
async function buildWorker() {
  const result = await build({
    configFile: false,
    build: {
      write: false,       // keep output in memory
      minify: false,
      lib: {
        entry: WW_SRC,
        formats: ['iife'],
        name: 'ww',
      },
      rollupOptions: { external: [] },
    },
  }) as { output: Array<{ code?: string }> }

  const code = Array.isArray(result)
    ? (result[0].output[0] as { code: string }).code
    : (result.output[0] as { code: string }).code

  const compressed = lz.compressToBase64(code)
  const json = JSON.stringify([compressed])

  // Only write if the content changed (same guard as the webpack plugin)
  let prev = ''
  try { prev = fs.readFileSync(WW_OUT, 'utf8') } catch (_) {}
  if (json !== prev) fs.writeFileSync(WW_OUT, json, 'utf8')
}

function viteWWPlugin(): Plugin {
  return {
    name: 'vite-ww-plugin',
    async buildStart() {
      await buildWorker()
    },
  }
}

// Serve extra directories at the dev-server root (equiv. to webpack contentBase)
function serveStaticDirs(dirs: string[]): Plugin {
  return {
    name: 'serve-static-dirs',
    configureServer(server) {
      for (const dir of dirs) {
        server.middlewares.use(sirv(dir, { dev: true, etag: true }))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteWWPlugin(),
    serveStaticDirs([
      fileURLToPath(new URL('./data', import.meta.url)),
      fileURLToPath(new URL('./assets', import.meta.url)),
    ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@src': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@component-js': fileURLToPath(new URL('./src/components/js', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./src/helpers', import.meta.url)),
      '@icons': fileURLToPath(new URL('./src/icons', import.meta.url)),
      '@overlay-comps': fileURLToPath(new URL('./src/components/overlays', import.meta.url)),
      '@stuff': fileURLToPath(new URL('./src/stuff', import.meta.url)),
    },
  },
  define: {
    // env constant to use in the file
    MOB_DEBUG: JSON.stringify(process.env.MOB_DEBUG),
  },
  server: {
    host: true, // expose on LAN (equiv. to webpack host: '0.0.0.0')
  },
  build: {
    // Preserve _id and _tf from mangling — required by script std (same as webpack TerserPlugin)
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: ['_id', '_tf'],
      },
    },
  },
  worker: {
    // IIFE keeps the worker self-contained (same as webpack worker-loader output),
    // which is required for the blob-URL approach in script_ww_api.js
    format: 'iife',
  },
})
