
require('./dist/lib/main');

var populateClientExports = require('ag-grid/dist/lib/clientExports').populateClientExports;
populateClientExports(exports);

require('ag-grid/dist/styles/ag-grid.css');
require('ag-grid/dist/styles/theme-fresh.css');
require('ag-grid/dist/styles/theme-dark.css');
require('ag-grid/dist/styles/theme-blue.css');
