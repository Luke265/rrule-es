import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import path from 'node:path';

const __dirname = path.dirname('');

const baseConfig = {
  target: 'node',
  entry: {
    main: './src/index.ts',
  },
  resolve: {
    extensions: ['.ts'],
    tsConfig: path.resolve(__dirname, './tsconfig.json'),
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          mangle: {
            keep_classnames: true,
          },
        },
      }),
    ],
  },
  devtool: 'source-map',
};

const esmConfig = {
  ...baseConfig,
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
  output: {
    path: path.resolve(__dirname, 'target/esm'),
    filename: 'main.mjs',
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  experiments: {
    outputModule: true,
  },
};

const cjsConfig = {
  ...baseConfig,
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
  output: {
    path: path.resolve(__dirname, 'target/cjs'),
    filename: 'main.cjs',
    libraryTarget: 'commonjs-module',
  },
};
export default [defineConfig(esmConfig), defineConfig(cjsConfig)];
