// utils
import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';

// rollup plugins
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import { terser } from 'rollup-plugin-terser';

// configs
const pkg = require('./package.json');
import * as react_config from './rollup/react';

const isProd = process.env.NODE_ENV !== 'development';
const sources = path => `${__dirname}/src/${path}`;
const env_config_key = isProd ? 'prod' : 'dev';

const js_in = pkg.config.js_in;
const js_out = pkg.config[env_config_key].js_out;

// to keep entries in the manifest file
const manifest = {};

/**
 * A Rollup plugin to generate a manifest of chunk names to their filenames
 * (including their content hash). This manifest is then used by the template
 * to point to the currect URL.
 * @return {Object}
 */
function manifestPlugin() {
  return {
    name: 'manifest',
    generateBundle(options, bundle) {
      for (const [name, assetInfo] of Object.entries(bundle)) {
        manifest[assetInfo.name] = name;
      }

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      });

      cleanManifest(manifest, options);
    },
  };
}

/**
 * remove files that are not in the manifest
 * from the output dir
 * @param json manifest
 */
async function cleanManifest(manifest, options) {
  const path_output = options.dir || pkg.config[env_config_key].js_out;

  const publicModules = new Set(await globby('*.+(js|mjs)', { cwd: path_output }));

  // Remove files from the `publicModules` set if they're in the manifest.
  for (const fileName of Object.values(manifest)) {
    if (publicModules.has(fileName)) {
      publicModules.delete(fileName);
    }
  }

  // Delete all remaining modules (not in the manifest).
  for (const fileName of publicModules) {
    await fs.remove(path.join(path_output, fileName));
  }
}

function basePlugins({ nomodule = false } = {}) {
  const browsers = nomodule
    ? ['ie 11']
    : [
        'last 2 Chrome versions',
        'last 2 Safari versions',
        'last 2 iOS versions',
        'last 2 Edge versions',
        'Firefox ESR',
      ];

  const plugins = [
    alias({
      resolve: ['.json', '.js', '.mjs', '.jsx', '.svelte'],
      entries: {
        '@app': sources('js/app'),
        '@config': sources('js/app/config'),
        '@helpers': sources('js/app/helpers'),
      },
    }),
    babel({
      extensions: ['.js', '.mjs', '.jsx', '.html', '.svelte'],
      include: ['src/**/*'],
      presets: [
        ['@babel/preset-typescript'],
        [
          '@babel/preset-env',
          {
            targets: { browsers },
            useBuiltIns: 'usage',
            modules: false,
            corejs: { version: 3, proposals: true },
          },
        ],
      ],
      plugins: ['@babel/plugin-proposal-export-namespace-from', '@babel/plugin-proposal-export-default-from'],
    }),
    resolve({
      browser: true, // we're building for browsers - remove if not
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.svelte', '.json'], // for react, typescript or svelte
      dedupe: ['react', 'react-dom', 'svelte'], // if you are using react or svelte, always take the one installed locally and not from dep
    }),
    replace({
      'process.env.NODE_ENV': isProd ? JSON.stringify('production') : JSON.stringify('development'),
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        ...react_config.namedExports,
      },
    }),
    manifestPlugin(),
  ];
  // Only add minification in production and when not running on Glitch.
  if (isProd) {
    // TODO: enable if actually deploying this to production, but I have
    // minification off for now so it's easier to view the demo source.
    plugins.push(
      terser({
        module: !nomodule,
        output: {
          comments: function(node, comment) {
            var text = comment.value;
            var type = comment.type;
            if (type == 'comment2') {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(text);
            }
          },
        },
      })
    );
  }
  return plugins;
}

// Module config for <script type="module">
const moduleConfig = {
  input: {
    main: js_in + 'main-module.mjs',
  },
  output: {
    dir: js_out,
    format: 'esm',
    entryFileNames: '[name]-[hash].mjs',
    chunkFileNames: '[name]-[hash].mjs',
    dynamicImportFunction: '__import__',
  },
  plugins: basePlugins(),
  manualChunks(id) {
    if (id.includes('node_modules')) {
      // The directory name following the last `node_modules`.
      // Usually this is the package, but it could also be the scope.
      const directories = id.split(path.sep);
      const name = directories[directories.lastIndexOf('node_modules') + 1];

      // Group react dependencies into a common "react" chunk.
      // NOTE: This isn't strictly necessary for this app, but it's included
      // as an example to show how to manually group common dependencies.
      if (name.indexOf('react') !== -1 || ['prop-types', 'scheduler'].includes(name)) {
        return 'react';
      }

      if (name === 'core-js') {
        return 'core-js';
      }

      // Group some librairies in the default bundle
      if (name.indexOf('svelte') !== -1 || name === 'tslib' || name === 'dynamic-import-polyfill') {
        return;
      }

      // Otherwise if in prod, put in a `utils` file
      // if in dev, put in its own file (for easier debugging)
      return isProd ? 'utils' : name;
    }
  },
  watch: {
    clearScreen: false,
  },
};

// Legacy config for <script nomodule>
const nomoduleConfig = {
  input: {
    nomodule: js_in + 'main-nomodule.mjs',
  },
  output: {
    dir: js_out,
    format: 'iife',
    entryFileNames: '[name]-[hash].js',
  },
  plugins: basePlugins({ nomodule: true }),
  inlineDynamicImports: true,
  watch: {
    clearScreen: false,
  },
};

const configs = [moduleConfig];
if (isProd) {
  configs.push(nomoduleConfig);
}

export default configs;
