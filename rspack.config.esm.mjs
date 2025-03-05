import { defineConfig } from '@rspack/cli';
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
            target: 'es2022',
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
    path: path.resolve(__dirname, 'target/esm'),
    filename: 'main.mjs',
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: false,
  },
  devtool: false,
});
