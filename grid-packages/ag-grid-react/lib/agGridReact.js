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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var agGridReactLegacy_1 = require("./legacy/agGridReactLegacy");
var agGridReactUi_1 = require("./reactUi/agGridReactUi");
var AgGridReact = /** @class */ (function (_super) {
    __extends(AgGridReact, _super);
    function AgGridReact() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setGridApi = function (api, columnApi) {
            _this.api = api;
            _this.columnApi = columnApi;
        };
        return _this;
    }
    AgGridReact.prototype.render = function () {
        var ReactComponentToUse = this.props.suppressReactUi ?
            react_1.default.createElement(agGridReactLegacy_1.AgGridReactLegacy, __assign({}, this.props, { setGridApi: this.setGridApi }))
            : react_1.default.createElement(agGridReactUi_1.AgGridReactUi, __assign({}, this.props, { setGridApi: this.setGridApi }));
        return ReactComponentToUse;
    };
    return AgGridReact;
}(react_1.Component));
exports.AgGridReact = AgGridReact;
