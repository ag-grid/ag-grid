require('../../community-modules/client-side-row-model');
require('./chartsModule');
require('./clipboardModule');
require('./excelExportModule');
require('./rowGroupingModule');
require('./serverSideRowModelModule');
require('./viewportRowModelModule');
require('./dist/es6/main');

// add in exports for ag-Grid-Enterprise
var agGridEnterprise = require('./dist/es6/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    exports[key] = agGridEnterprise[key];
});

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
var agGrid = require('ag-grid-community');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
