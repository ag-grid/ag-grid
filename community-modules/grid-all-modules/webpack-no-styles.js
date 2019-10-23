var ClientSideRowModelModule = require('../../community-modules/grid-client-side-row-model');
var GridCoreModule = require('../../community-modules/grid-core');
var CsvExportModule = require('../../community-modules/grid-csv-export');
var InfiniteRowModelModule = require('../../community-modules/grid-infinite-row-model');
var agGrid = require('./dist/es6/main');
Object.keys(agGrid).forEach(function(key) {
    exports[key] = agGrid[key];
});
agGrid.ModuleRegistry.register(ClientSideRowModelModule.ClientSideRowModelModule);
agGrid.ModuleRegistry.register(CsvExportModule.CsvExportModule);
agGrid.ModuleRegistry.register(InfiniteRowModelModule.InfiniteRowModelModule);
