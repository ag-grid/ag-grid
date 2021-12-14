require('./dist/esm/es5/main');

// add in exports for AG Grid Enterprise
var agGridEnterprise = require('./dist/esm/es5/main');
Object.keys(agGridEnterprise).forEach(function(key) {
    exports[key] = agGridEnterprise[key];
});

// also add in in exports for AG Grid Community, as it's webpack, we want both packed up
var agGrid = require('@ag-grid-community/all-modules');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
