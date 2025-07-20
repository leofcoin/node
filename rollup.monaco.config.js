import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { execSync } from 'child_process'
import postcss from 'rollup-plugin-postcss'
import postcssUrl from 'postcss-url'
import { join, relative } from 'path'
import fs from 'fs-extra'

try {
  execSync('rm -rf www/monaco/*.js')
  execSync('rm -rf www/monaco/*.LICENSE.txt')
} catch {}

export default [
  {
    input: ['./src/monaco-loader.ts'],
    output: [
      {
        format: 'es',
        dir: 'www/monaco'
      }
    ],
    plugins: [
      json(),
      postcss({
        plugins: [
          postcssUrl({
            url: (asset) => {
              if (!/\.ttf$/.test(asset.url)) return asset.url
              const distPath = join(process.cwd(), 'www')
              const distFontsPath = join(distPath, 'fonts')
              fs.ensureDirSync(distFontsPath)
              const targetFontPath = join(distFontsPath, asset.pathname)
              fs.copySync(asset.absolutePath, targetFontPath)
              const relativePath = relative(process.cwd(), targetFontPath)
              const publicPath = './'
              console.log(relativePath)
              return `${publicPath}${relativePath.replace('www/', '')}`
            }
          })
        ]
      }),

      nodeResolve({
        mainFields: ['exports', 'browser:module', 'browser', 'module', 'main'],
        extensions: ['.mjs', '.cjs', '.js', '.json']
      }),
      commonjs()
    ]
  },
  {
    input: ['./node_modules/monaco-editor/esm/vs/language/typescript/ts.worker'],
    output: [
      {
        format: 'iife',
        dir: 'www/monaco',
        name: 'tsWorker'
      }
    ]
  },
  {
    input: ['./node_modules/monaco-editor/esm/vs/editor/editor.worker.js'],
    output: [
      {
        format: 'iife',
        name: 'editorWorker',
        dir: 'www/monaco'
      }
    ]
  }
]
