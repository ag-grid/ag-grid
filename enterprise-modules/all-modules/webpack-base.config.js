require('./dist/esm/es5/main');

var gridExports = {};

// add in exports for AG Grid Enterprise
var agGridEnterprise = require('./dist/esm/es5/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    gridExports[key] = agGridEnterprise[key];
});


// also add in in exports for AG Grid Community, as it's webpack, we want both packed up
var agGrid = require('@ag-grid-community/all-modules');
Object.keys(agGrid).forEach(function(key) {
    gridExports[key] = agGrid[key];
});

exports['agGrid'] = gridExports;
exports['agCharts'] = agGridEnterprise['agCharts'];
