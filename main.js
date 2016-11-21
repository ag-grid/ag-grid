
exports.AgGridAurelia = require('./lib/agGridAurelia').AgGridAurelia;
exports.AgGridColumn = require('./lib/agGridColumn').AgGridColumn;
exports.AgCellTemplate = require('./lib/agTemplate').AgCellTemplate;
exports.AgEditorTemplate = require('./lib/agTemplate').AgEditorTemplate;
exports.AgFilterTemplate = require('./lib/agTemplate').AgFilterTemplate;
exports.AureliaCellRendererComponent = require('./lib/aureliaCellRendererComponent').AureliaCellRendererComponent;
exports.AureliaComponentFactory = require('./lib/aureliaComponentFactory').AureliaComponentFactory;
exports.AureliaFrameworkFactory = require('./lib/aureliaFrameworkFactory').AureliaFrameworkFactory;
exports.BaseAureliaEditor = require('./lib/editorViewModels').BaseAureliaEditor;

function configure(config) {
    config.globalResources(
      './lib/agGridAurelia',
      './lib/agGridColumn',
      './lib/agTemplate'
    );
}

exports.configure = configure;
