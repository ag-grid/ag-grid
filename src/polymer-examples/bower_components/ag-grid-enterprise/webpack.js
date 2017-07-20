require('./dist/lib/main');

// add in exports for ag-Grid-Enterprise
var populateClientExports = require('./dist/lib/clientExports').populateClientExports;
populateClientExports(exports);

// also add in in exports for ag-Grid-Standard, as it's webpack, we want both packed up
var agGrid = require('ag-grid/main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
