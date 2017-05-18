// same as main.js, except also includes the styles, so webpack includes the css in the bundle
exports.Grid = require('./main').Grid;
exports.simpleHttpRequest = require('./main').simpleHttpRequest;
exports.initialiseAgGridWithAngular1 = require('./main').initialiseAgGridWithAngular1;

require('./dist/styles/ag-grid.css');
require('./dist/styles/theme-blue.css');
require('./dist/styles/theme-dark.css');
require('./dist/styles/theme-fresh.css');
require('./dist/styles/theme-material.css');
require('./dist/styles/theme-bootstrap.css');
