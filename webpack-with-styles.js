require('./dist/lib/main');

// add in exports for ag-Grid-Enterprise
var populateClientExports = require('./dist/lib/clientExports').populateClientExports;
populateClientExports(exports);

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
var populateStandardExports = require('ag-grid/dist/lib/clientExports').populateClientExports;
populateStandardExports(exports);

require('ag-grid/dist/styles/ag-grid.css');
require('ag-grid/dist/styles/theme-fresh.css');
require('ag-grid/dist/styles/theme-dark.css');
require('ag-grid/dist/styles/theme-blue.css');
