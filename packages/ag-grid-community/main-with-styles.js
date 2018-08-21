// same as main.js, except also includes the styles, so webpack includes the css in the bundle
var agGrid = require('./main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});

require('./dist/styles/ag-grid.css');

require('./dist/styles/ag-theme-bootstrap.css');
require('./dist/styles/ag-theme-blue.css');
require('./dist/styles/ag-theme-dark.css');
require('./dist/styles/ag-theme-fresh.css');
require('./dist/styles/ag-theme-material.css');
require('./dist/styles/ag-theme-balham.css');
require('./dist/styles/ag-theme-balham-dark.css');
