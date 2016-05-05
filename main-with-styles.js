// same as main.js, except also includes the styles, so webpack includes the css in the bundle

var populateClientExports = require('./dist/lib/clientExports').populateClientExports;
populateClientExports(exports);

require('./dist/styles/ag-grid.css');
require('./dist/styles/theme-blue.css');
require('./dist/styles/theme-dark.css');
require('./dist/styles/theme-fresh.css');
require('./dist/styles/theme-material.css');
require('./dist/styles/theme-bootstrap.css');
