// ag-grid-react v29.3.5
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgGridReact = void 0;
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
