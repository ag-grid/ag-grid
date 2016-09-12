// ag-grid-react v5.5.0
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ag_grid_1 = require('ag-grid');
var reactCellRendererFactory_1 = require("../lib/reactCellRendererFactory");
var ReactFrameworkFactory = (function (_super) {
    __extends(ReactFrameworkFactory, _super);
    function ReactFrameworkFactory(agGridReact) {
        _super.call(this);
        this.agGridReact = agGridReact;
    }
    ReactFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.floatingCellRendererFmk)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.floatingCellRendererFmk, this.agGridReact);
        }
        else {
            return _super.prototype.colDefFloatingCellRenderer.call(this, colDef);
        }
    };
    ReactFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (ag_grid_1.Utils.exists(colDef.cellRendererFmk)) {
            return reactCellRendererFactory_1.reactCellRendererFactory(colDef.cellRendererFmk, this.agGridReact);
        }
        else {
            return _super.prototype.colDefCellRenderer.call(this, colDef);
        }
    };
    return ReactFrameworkFactory;
})(ag_grid_1.BaseFrameworkFactory);
exports.ReactFrameworkFactory = ReactFrameworkFactory;
