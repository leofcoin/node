import typescript from '@rollup/plugin-typescript'
import { cp, readdir, unlink } from 'fs/promises'
import { join } from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import modify from 'rollup-plugin-modify'
import json from '@rollup/plugin-json'
import packagesJSON from './package.json' with { type: 'json' }
import materialSymbols from 'rollup-plugin-material-symbols'
import polyfill from 'rollup-plugin-polyfill-node'
import { readFile, writeFile } from 'fs/promises'
import { env } from 'process'
const date = new Date()

const BUILD = `${date.getUTCFullYear()}_${date.getDay()}_${date.getMonth()}-${date.getTime()}`

const views = [
  ...(await readdir('./src/views')).map((path) => join('./src/views', path)).filter((path) => path.endsWith('.ts')),
  ...(await readdir('./src/views/explorer')).map((path) => join('./src/views/explorer', path)),
  ...(await readdir('./src/views/identity')).map((path) => join('./src/views/identity', path))
]

let index = await readFile('./src/index.html', 'utf-8')
if (env.NODE_ENV === 'development') {
  index = index.replace(
    '<body>',
    `
  <body>
  <script>
    const ws = new WebSocket(location.protocol === 'https:' ? 'wss://' + location.host : 'ws://' + location.host, 'reload-app')
    ws.addEventListener('open', () => {
      ws.addEventListener('message', () => location.reload())
    })

  </script>
  `
  )
} else {
  index = index.replace(
    '<!-- service-worker-placeholder -->',
    `<script type="module">
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      } catch (error) {
        console.error(error);
      }
    }
  </script>
  <link rel="manifest" href="/manifest.json">`
  )
}

writeFile('./www/index.html', index)

// const templates = (await readdir('./src/templates')).map(path => join('./src/templates', path))
// const cleanWWW = async (dir) => {
//   return {
//     name: 'clean-www', // this name will show up in warnings and errors
//     generateBundle: async () => {
//       try {
//         const files = await readdir(dir ? join('www', dir) : 'www')
//         for (const file of files) {
//           if (file.endsWith('.js') && !file.includes('monaco'))
//             await unlink(dir ? join('www', dir, file) : join('www', file))
//         }
//       } catch (error) {}
//       return
//     }
//   }
// }
try {
  const files = await readdir('www')
  for (const file of files) {
    if (file.endsWith('.js') && !file.includes('monaco')) await unlink(join('www', file))
  }
} catch (error) {}

try {
  const _files = await readdir('www/workers')
  for (const file of files) {
    if (file.endsWith('.js')) await unlink(join('www/workers', file))
  }
} catch (error) {}

await cp('node_modules/@leofcoin/chain/exports/browser/node-browser.js', 'www/node-browser.js')
await cp('node_modules/@vandeurenglenn/lit-elements/exports/themes/default', 'www/themes/default', {
  recursive: true
})

export default [
  {
    input: ['./src/shell.ts', ...views, './node_modules/@leofcoin/storage/exports/browser-store.js'],
    output: {
      dir: './www',
      format: 'es'
    },
    external: ['./identity.js', './../../monaco/monaco-loader.js', '@monaco-import', './node-browser.js'],
    plugins: [
      typescript(),
      json(),
      resolve({ browser: true, mainFields: ['browser', 'module', 'main'] }),
      commonjs(),
      polyfill(),
      materialSymbols({
        placeholderPrefix: 'symbol'
      }),
      modify({
        '@build': BUILD,
        '@version': packagesJSON.version,
        '@monaco-import': './../../monaco/monaco-loader.js',
        './exports/browser/workers/machine-worker.js': 'workers/machine-worker.js'
      })
    ]
  },
  {
    input: [
      './node_modules/@leofcoin/workers/exports/machine-worker.js',
      './node_modules/@leofcoin/workers/exports/block-worker.js'
    ],
    output: {
      dir: './www/workers',
      format: 'es'
    },

    plugins: [
      json(),
      modify({
        '@leofcoin/workers/block-worker.js': 'block-worker.js'
      }),
      resolve({
        mainFields: ['module', 'browser']
      }),
      commonjs()
    ]
  }
]
