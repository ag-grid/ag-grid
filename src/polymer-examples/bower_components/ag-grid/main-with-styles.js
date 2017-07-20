// same as main.js, except also includes the styles, so webpack includes the css in the bundle
var agGrid = require('./main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});

require('./dist/styles/ag-grid.css');
require('./dist/styles/theme-blue.css');
require('./dist/styles/theme-dark.css');
require('./dist/styles/theme-fresh.css');
require('./dist/styles/theme-material.css');
require('./dist/styles/theme-bootstrap.css');
