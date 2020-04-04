# Commands

`npm run dev` to launch dev mode (watch of files, local server)
`npm run build` to build for production.
=> Usually done by a CI script when pushing, that's why `dist` is in `.gitignore`

# Config

config :
- in `package.json` for files location (under `config`)
- in `rollup.config.js` for js
- in `postcss.config.js` for postcss

# Features

## js

Using rollup to build my JS files.
Entry points are children directories of `src/js/`, and rollup will generate as much output files as there are entrypoints.
It will for each directory look for `main-module` and `main-nomodule` files, and create the corresponding outputs

- chunk files for dynamic imports
- creates a manifest.json containing all generated files
- creates a modulepreload.json containing all modules loaded by each entry file so you can setup a preload or know what files are required for one entry file to load properly
- create a non chunked version for older browsers where modules are not supported

Config is in `rollup.config.js` and can be modified easily.
There are already a few default config for JSX use, namedExports for `React` or `.svelte` files

## css

Using postcss to build my CSS files.
Entry points are css files that are direct children of `src/css/`, and postcss will generate as much output files as there is entrypoints.

Default plugins can be seen in `postcss.config.js`, feel free to add your favorites

# Why?

I just put this on github to be able to reuse it easily when starting a new project.
And if that helps anyone to start too with file chuncks, nomododule alternatives already set, and all, that's also good.

