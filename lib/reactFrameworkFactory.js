// ag-grid-react v5.5.0
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ag_grid_1 = require('ag-grid');
var reactCellRendererFactory_1 = require("../lib/reactCellRendererFactory");
var reactCellEditorFactory_1 = require("./reactCellEditorFactory");
var reactFilterFactory_1 = require("./reactFilterFactory");
var ReactFrameworkFactory = (function (_super) {
    __extends(ReactFrameworkFactory, _super);
    function ReactFrameworkFactory(agGridReact) {
        _super.call(this);
        this.agGridReact = agGridReact;
    }
    ReactFrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.floatingCellRendererFramework)) {
            return reactFilterFactory_1.reactFilterFactory(colDef.filterFramework, this.agGridReact);
        }
        else {
            return _super.prototype.colDefFilter.call(this, colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.floatingCellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.floatingCellRendererFramework, this.agGridReact);
        }
        else {
            return _super.prototype.colDefFloatingCellRenderer.call(this, colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.cellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.cellRendererFramework, this.agGridReact);
        }
        else {
            return _super.prototype.colDefCellRenderer.call(this, colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.cellEditorFramework)) {
            return reactCellEditorFactory_1.reactCellEditorFactory(colDef.cellEditorFramework, this.agGridReact);
        }
        else {
            return _super.prototype.colDefCellEditor.call(this, colDef);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.fullWidthCellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.fullWidthCellRendererFramework, this.agGridReact);
        }
        else {
            return _super.prototype.gridOptionsFullWidthCellRenderer.call(this, gridOptions);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.groupRowRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.groupRowRendererFramework, this.agGridReact);
        }
        else {
            return _super.prototype.gridOptionsGroupRowRenderer.call(this, gridOptions);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.groupRowInnerRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.groupRowInnerRendererFramework, this.agGridReact);
        }
        else {
            return _super.prototype.gridOptionsGroupRowInnerRenderer.call(this, gridOptions);
        }
    };
    return ReactFrameworkFactory;
})(ag_grid_1.BaseFrameworkFactory);
exports.ReactFrameworkFactory = ReactFrameworkFactory;
