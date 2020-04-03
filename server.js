/**
 * /!\ WARNING
 *
 * What follow is only for development purpose.
 * Do not put this in production
 */
let express = require('express');
let path = require('path');
let Sqrl = require('squirrelly');
let app = express();
const pkg = require('./package.json');

app.use(express.static('dist'));

app.engine('html', require('squirrelly').__express);

app.set('view engine', 'html');
// setting up squirrelly templates under views
app.set('views', './views');

// setting up /
app.get('/', async function(req, res) {
  // dev because this is definitely not what you'd want in prod
  const path = `${__dirname}/${pkg.config.dev.js_out}manifest.json`;
  delete require.cache[require.resolve(path)];
  const manifest = require(path);
  res.render('index.html', {
    manifest,
  });
});

const port = process.env.PORT || 3333;
app.listen(port, function() {
  console.log('listening to request on port ' + port);
});
