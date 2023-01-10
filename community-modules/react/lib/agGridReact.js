// @ag-grid-community/react v29.0.0
"use strict";
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
const react_1 = __importStar(require("react"));
const agGridReactLegacy_1 = require("./legacy/agGridReactLegacy");
const agGridReactUi_1 = require("./reactUi/agGridReactUi");
class AgGridReact extends react_1.Component {
    constructor() {
        super(...arguments);
        this.setGridApi = (api, columnApi) => {
            this.api = api;
            this.columnApi = columnApi;
        };
    }
    render() {
        const ReactComponentToUse = this.props.suppressReactUi ?
            react_1.default.createElement(agGridReactLegacy_1.AgGridReactLegacy, Object.assign({}, this.props, { setGridApi: this.setGridApi }))
            : react_1.default.createElement(agGridReactUi_1.AgGridReactUi, Object.assign({}, this.props, { setGridApi: this.setGridApi }));
        return ReactComponentToUse;
    }
}
exports.AgGridReact = AgGridReact;

//# sourceMappingURL=agGridReact.js.map
