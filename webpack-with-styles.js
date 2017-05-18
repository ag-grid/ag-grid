require('./dist/lib/main');

// add in exports for ag-Grid-Enterprise
var populateClientExports = require('./dist/lib/clientExports').populateClientExports;
populateClientExports(exports);

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
exports.Grid = require('ag-grid/main').Grid;

require('ag-grid/dist/styles/ag-grid.css');
require('ag-grid/dist/styles/theme-fresh.css');
require('ag-grid/dist/styles/theme-dark.css');
require('ag-grid/dist/styles/theme-blue.css');
require('ag-grid/dist/styles/theme-material.css');
require('ag-grid/dist/styles/theme-bootstrap.css');
