"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VueFrameworkFactory = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _main = require("ag-grid/main");

var _vueComponentFactory = require("./vueComponentFactory");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VueFrameworkFactory = exports.VueFrameworkFactory = function () {
    function VueFrameworkFactory($el, parent) {
        _classCallCheck(this, VueFrameworkFactory);

        this._baseFrameworkFactory = new _main.BaseFrameworkFactory();
        this._componentFactory = new _vueComponentFactory.VueComponentFactory($el, parent);
    }

    _createClass(VueFrameworkFactory, [{
        key: "colDefFloatingCellRenderer",
        value: function colDefFloatingCellRenderer(colDef) {
            if (colDef.floatingCellRendererFramework) {
                return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework);
            } else {
                return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
            }
        }
    }, {
        key: "colDefCellRenderer",
        value: function colDefCellRenderer(colDef) {
            if (colDef.cellRendererFramework) {
                return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework);
            } else {
                return this._baseFrameworkFactory.colDefCellRenderer(colDef);
            }
        }
    }, {
        key: "colDefCellEditor",
        value: function colDefCellEditor(colDef) {
            if (colDef.cellEditorFramework) {
                return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework);
            } else {
                return this._baseFrameworkFactory.colDefCellEditor(colDef);
            }
        }
    }, {
        key: "gridOptionsFullWidthCellRenderer",
        value: function gridOptionsFullWidthCellRenderer(gridOptions) {
            if (gridOptions.fullWidthCellRendererFramework) {
                return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework);
            } else {
                return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
            }
        }
    }, {
        key: "gridOptionsGroupRowRenderer",
        value: function gridOptionsGroupRowRenderer(gridOptions) {
            if (gridOptions.groupRowRendererFramework) {
                return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework);
            } else {
                return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
            }
        }
    }, {
        key: "gridOptionsGroupRowInnerRenderer",
        value: function gridOptionsGroupRowInnerRenderer(gridOptions) {
            if (gridOptions.groupRowInnerRendererFramework) {
                return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework);
            } else {
                return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
            }
        }
    }, {
        key: "colDefFilter",
        value: function colDefFilter(colDef) {
            if (colDef.filterFramework) {
                return this._componentFactory.createFilterFromComponent(colDef.filterFramework);
            } else {

                return this._baseFrameworkFactory.colDefFilter(colDef);
            }
        }
    }, {
        key: "setTimeout",
        value: function setTimeout(action, timeout) {
            this._baseFrameworkFactory.setTimeout(action, timeout);
        }
    }]);

    return VueFrameworkFactory;
}();