import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

import pkg from './package.json'

const isDev = process.env.ROLLUP_WATCH

const devPlugins = isDev
  ? [
      serve({
        open: true,
        port: 8000,
        openPage: '/public/index.html',
      }),
      livereload({
        watch: 'dist',
      }),
    ]
  : []

/** @type {import('rollup').RollupOptions} */
const option = {
  input: 'src/index.ts',
  output: {
    file: pkg.module,
    format: 'es',
  },
  plugins: [nodeResolve(), commonjs(), typescript(), ...devPlugins],
}

export default option
