// ag-grid-react v23.0.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_1 = require("react");
var PropTypes = require("prop-types");
var AgGrid = require("ag-grid-community");
var AgGridColumn = /** @class */ (function (_super) {
    __extends(AgGridColumn, _super);
    function AgGridColumn(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.props = props;
        _this.state = state;
        return _this;
    }
    AgGridColumn.prototype.render = function () {
        return null;
    };
    AgGridColumn.mapChildColumnDefs = function (columnProps) {
        return React.Children.map(columnProps.children, function (child) {
            return AgGridColumn.toColDef(child.props);
        });
    };
    AgGridColumn.toColDef = function (columnProps) {
        var colDef = AgGridColumn.createColDefFromGridColumn(columnProps);
        if (AgGridColumn.hasChildColumns(columnProps)) {
            colDef["children"] = AgGridColumn.getChildColDefs(columnProps.children);
        }
        return colDef;
    };
    AgGridColumn.hasChildColumns = function (columnProps) {
        return React.Children.count(columnProps.children) > 0;
    };
    AgGridColumn.getChildColDefs = function (columnChildren) {
        return React.Children.map(columnChildren, function (child) {
            return AgGridColumn.createColDefFromGridColumn(child.props);
        });
    };
    ;
    AgGridColumn.createColDefFromGridColumn = function (columnProps) {
        var colDef = {};
        AgGridColumn.assign(colDef, columnProps);
        delete colDef.children;
        return colDef;
    };
    ;
    AgGridColumn.assign = function (colDef, from) {
        // effectively Object.assign - here for IE compatibility
        return [from].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, colDef);
    };
    return AgGridColumn;
}(react_1.Component));
exports.AgGridColumn = AgGridColumn;
addProperties(AgGrid.ColDefUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(AgGrid.ColDefUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(AgGrid.ColDefUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(AgGrid.ColDefUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(AgGrid.ColDefUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(AgGrid.ColDefUtil.FUNCTION_PROPERTIES, PropTypes.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        AgGridColumn[propKey] = propType;
    });
}
