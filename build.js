const fs = require('fs');
const pkg = require('./package.json');

const { TwingEnvironment, TwingLoaderFilesystem } = require('twing');
let loader = new TwingLoaderFilesystem('./views');
let twing = new TwingEnvironment(loader);

const path = `${__dirname}/${pkg.config.prod.js_out}manifest.json`;
const manifest = require(path);

console.log(pkg.config.html_in);
twing.render('index.html', { manifest }).then((output) => fs.writeFile(pkg.config.prod.html_out, output, () => true));
