var PLATFORM = require('aurelia-pal').PLATFORM;

exports.AgGridAurelia = require('./lib/agGridAurelia').AgGridAurelia;
exports.AgGridColumn = require('./lib/agGridColumn').AgGridColumn;
exports.AgCellTemplate = require('./lib/agTemplate').AgCellTemplate;
exports.AgEditorTemplate = require('./lib/agTemplate').AgEditorTemplate;
exports.AgFullWidthRowTemplate = require('./lib/agTemplate').AgFullWidthRowTemplate;
exports.AgFilterTemplate = require('./lib/agTemplate').AgFilterTemplate;
exports.AureliaFrameworkFactory = require('./lib/aureliaFrameworkFactory').AureliaFrameworkFactory;

function configure(config) {
    config.globalResources(
        PLATFORM.moduleName('./lib/agGridAurelia'),
        PLATFORM.moduleName('./lib/agGridColumn'),
        PLATFORM.moduleName('./lib/agTemplate')
    );
}

exports.configure = configure;
