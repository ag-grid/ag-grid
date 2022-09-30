// @ag-grid-community/react v28.2.0
"use strict";
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
const react_1 = __importStar(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const AgGrid = __importStar(require("@ag-grid-community/core"));
class AgGridColumn extends react_1.Component {
    render() {
        return null;
    }
    static mapChildColumnDefs(children) {
        return react_1.default.Children.map(children, child => !!child ? AgGridColumn.toColDef(child.props) : null);
    }
    static toColDef(columnProps) {
        const { children } = columnProps, colDef = __rest(columnProps, ["children"]);
        if (AgGridColumn.hasChildColumns(children)) {
            colDef.children = AgGridColumn.mapChildColumnDefs(children);
        }
        return colDef;
    }
    static hasChildColumns(children) {
        return react_1.default.Children.count(children) > 0;
    }
}
exports.AgGridColumn = AgGridColumn;
addProperties(AgGrid.ColDefUtil.BOOLEAN_PROPERTIES, prop_types_1.default.bool);
addProperties(AgGrid.ColDefUtil.STRING_PROPERTIES, prop_types_1.default.string);
addProperties(AgGrid.ColDefUtil.OBJECT_PROPERTIES, prop_types_1.default.object);
addProperties(AgGrid.ColDefUtil.ARRAY_PROPERTIES, prop_types_1.default.array);
addProperties(AgGrid.ColDefUtil.NUMBER_PROPERTIES, prop_types_1.default.number);
addProperties(AgGrid.ColDefUtil.FUNCTION_PROPERTIES, prop_types_1.default.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach((propKey) => {
        // @ts-ignore
        AgGridColumn[propKey] = propType;
    });
}

//# sourceMappingURL=agGridColumn.js.map
