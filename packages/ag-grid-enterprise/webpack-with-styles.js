require('./dist/lib/main');

// add in exports for ag-Grid-Enterprise
var agGridEnterprise = require('./main');
Object.keys(agGridEnterprise).forEach(function(key) {
    exports[key] = agGridEnterprise[key];
});

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
var agGrid = require('ag-grid/main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});

require('ag-grid/dist/styles/ag-grid.css');

require('ag-grid/dist/styles/theme-fresh.css');
require('ag-grid/dist/styles/theme-dark.css');
require('ag-grid/dist/styles/theme-blue.css');
require('ag-grid/dist/styles/theme-material.css');
require('ag-grid/dist/styles/theme-bootstrap.css');

require('ag-grid/dist/styles/ag-theme-fresh.css');
require('ag-grid/dist/styles/ag-theme-dark.css');
require('ag-grid/dist/styles/ag-theme-blue.css');
require('ag-grid/dist/styles/ag-theme-material.css');
require('ag-grid/dist/styles/ag-theme-bootstrap.css');

require('ag-grid/dist/styles/ag-theme-balham.css');
require('ag-grid/dist/styles/ag-theme-balham-dark.css');
