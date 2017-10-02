// ag-grid-react v13.3.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var reactCellRendererFactory_1 = require("../lib/reactCellRendererFactory");
var reactCellEditorFactory_1 = require("./reactCellEditorFactory");
var reactFilterFactory_1 = require("./reactFilterFactory");
var ReactFrameworkFactory = (function () {
    function ReactFrameworkFactory(agGridReact) {
        this.baseFrameworkFactory = new ag_grid_1.BaseFrameworkFactory();
        this.agGridReact = agGridReact;
    }
    ReactFrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.filterFramework)) {
            return reactFilterFactory_1.reactFilterFactory(colDef.filterFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.colDefFilter(colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.pinnedRowCellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.pinnedRowCellRendererFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.cellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.cellRendererFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.cellEditorFramework)) {
            return reactCellEditorFactory_1.reactCellEditorFactory(colDef.cellEditorFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.fullWidthCellRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.fullWidthCellRendererFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.groupRowRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.groupRowRendererFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };
    ReactFrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (ag_grid_1.Utils.exists(gridOptions.groupRowInnerRendererFramework)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(gridOptions.groupRowInnerRendererFramework, this.agGridReact);
        }
        else {
            return this.baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };
    ReactFrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this.baseFrameworkFactory.setTimeout(action, timeout);
    };
    return ReactFrameworkFactory;
}());
exports.ReactFrameworkFactory = ReactFrameworkFactory;
