exports.AgGridAurelia = require('./lib/agGridAurelia').AgGridAurelia;
exports.AureliaFrameworkFactory = require('./lib/aureliaFrameworkFactory').AureliaFrameworkFactory;
exports.AureliaComponentFactory = require('./lib/aureliaComponentFactory').AureliaComponentFactory;
exports.AgGridColumn = require('./lib/agGridColumn').AgGridColumn;

export function configure(config) {
  config.globalResources('./lib/agGridAurelia');
}
