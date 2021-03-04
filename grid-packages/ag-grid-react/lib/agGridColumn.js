// ag-grid-react v25.1.0
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_1 = require("react");
var PropTypes = require("prop-types");
var AgGrid = require("ag-grid-community");
var AgGridColumn = /** @class */ (function (_super) {
    __extends(AgGridColumn, _super);
    function AgGridColumn(props) {
        var _this = _super.call(this, props) || this;
        _this.props = props;
        return _this;
    }
    AgGridColumn.prototype.render = function () {
        return null;
    };
    AgGridColumn.mapChildColumnDefs = function (children) {
        return React.Children.map(children, function (child) { return !!child ? AgGridColumn.toColDef(child.props) : null; });
    };
    AgGridColumn.toColDef = function (columnProps) {
        var children = columnProps.children, colDef = __rest(columnProps, ["children"]);
        if (AgGridColumn.hasChildColumns(children)) {
            colDef.children = AgGridColumn.mapChildColumnDefs(children);
        }
        return colDef;
    };
    AgGridColumn.hasChildColumns = function (children) {
        return React.Children.count(children) > 0;
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
