/**
 * /!\ WARNING
 *
 * What follow is only for development purpose.
 * Do not put this in production
 */
let express = require('express');
let app = express();
const pkg = require('./package.json');

app.use(express.static('dist'));

app.engine('html', require('squirrelly').__express);

// setting up squirrelly templates under views
app.set('views', './views');

// setting up /
app.get('/', async function (req, res) {
  const path = `${__dirname}/${pkg.config.dev.js_out}manifest.json`;
  // delete manifest from cache else it will always load the same
  delete require.cache[require.resolve(path)];
  const manifest = require(path);
  res.render('index.html', {
    manifest,
  });
});

const port = process.env.PORT || 3333;
app.listen(port, function () {
  console.log(`Connect to the home page: http://localhost:${port}`);
});
