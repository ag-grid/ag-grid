// ag-grid-react v28.2.1
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var prop_types_1 = __importDefault(require("prop-types"));
var AgGrid = __importStar(require("ag-grid-community"));
var AgGridColumn = /** @class */ (function (_super) {
    __extends(AgGridColumn, _super);
    function AgGridColumn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AgGridColumn.prototype.render = function () {
        return null;
    };
    AgGridColumn.mapChildColumnDefs = function (children) {
        return react_1.default.Children.map(children, function (child) { return !!child ? AgGridColumn.toColDef(child.props) : null; });
    };
    AgGridColumn.toColDef = function (columnProps) {
        var children = columnProps.children, colDef = __rest(columnProps, ["children"]);
        if (AgGridColumn.hasChildColumns(children)) {
            colDef.children = AgGridColumn.mapChildColumnDefs(children);
        }
        return colDef;
    };
    AgGridColumn.hasChildColumns = function (children) {
        return react_1.default.Children.count(children) > 0;
    };
    return AgGridColumn;
}(react_1.Component));
exports.AgGridColumn = AgGridColumn;
addProperties(AgGrid.ColDefUtil.BOOLEAN_PROPERTIES, prop_types_1.default.bool);
addProperties(AgGrid.ColDefUtil.STRING_PROPERTIES, prop_types_1.default.string);
addProperties(AgGrid.ColDefUtil.OBJECT_PROPERTIES, prop_types_1.default.object);
addProperties(AgGrid.ColDefUtil.ARRAY_PROPERTIES, prop_types_1.default.array);
addProperties(AgGrid.ColDefUtil.NUMBER_PROPERTIES, prop_types_1.default.number);
addProperties(AgGrid.ColDefUtil.FUNCTION_PROPERTIES, prop_types_1.default.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        // @ts-ignore
        AgGridColumn[propKey] = propType;
    });
}
