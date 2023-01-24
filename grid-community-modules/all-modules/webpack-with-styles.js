/**
 * AUTOMATICALLY GENERATED FILE, DO NOT EDIT MANUALLY!
 * Update this file by running `lerna run webpack-updater` in the monorepo root folder.
 */
var ClientSideRowModelModule = require('../../grid-community-modules/client-side-row-model');
var GridCoreModule = require('../../grid-community-modules/core');
var CsvExportModule = require('../../grid-community-modules/csv-export');
var InfiniteRowModelModule = require('../../grid-community-modules/infinite-row-model');
var agGrid = require('./dist/esm/es5/main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
agGrid.ModuleRegistry.register(ClientSideRowModelModule.ClientSideRowModelModule);
agGrid.ModuleRegistry.register(CsvExportModule.CsvExportModule);
agGrid.ModuleRegistry.register(InfiniteRowModelModule.InfiniteRowModelModule);
require('./styles/ag-grid-no-native-widgets.css');
require('./styles/ag-grid.css');
require('./styles/ag-theme-alpine-no-font.css');
require('./styles/ag-theme-alpine.css');
require('./styles/ag-theme-balham-no-font.css');
require('./styles/ag-theme-balham.css');
require('./styles/ag-theme-material-no-font.css');
require('./styles/ag-theme-material.css');
require('./styles/agGridAlpineFont.css');
require('./styles/agGridBalhamFont.css');
require('./styles/agGridClassicFont.css');
require('./styles/agGridMaterialFont.css');