import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

import pkg from './package.json'

/** @type {import('rollup').RollupOptions} */
let option

const isDev = process.env.ROLLUP_WATCH

if (isDev) {
  option = {
    input: 'test/index.ts',
    output: {
      file: 'test/index.js',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfigOverride: { compilerOptions: { declaration: false } },
      }),
      serve({
        open: true,
        port: 8000,
        openPage: '/test/index.html',
      }),
      livereload({
        watch: 'test',
      }),
    ],
  }
} else {
  option = {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
    },
    plugins: [nodeResolve(), commonjs(), typescript()],
  }
}

export default option
