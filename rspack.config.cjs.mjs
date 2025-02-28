import { defineConfig } from '@rspack/cli';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'node:path';

const __dirname = path.dirname('');

export default defineConfig({
  target: 'node',
  entry: {
    main: './src/index.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            target: 'es5',
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
    tsConfig: path.resolve(__dirname, './tsconfig.json'),
  },
  output: {
    path: path.resolve(__dirname, 'target/cjs'),
    libraryTarget: 'commonjs-module',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: /TZDate/,
        },
      }),
    ],
  },
});
