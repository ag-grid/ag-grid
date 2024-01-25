// ag-grid-react v31.0.3
"use strict";
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
var react_1 = __importStar(require("react"));
var customContext_1 = require("../../shared/customComp/customContext");
var CustomWrapperComp = function (params) {
    var initialProps = params.initialProps, addUpdateCallback = params.addUpdateCallback, CustomComponentClass = params.CustomComponentClass, setMethods = params.setMethods;
    var _a = react_1.useState(initialProps), props = _a[0], setProps = _a[1];
    react_1.useEffect(function () {
        addUpdateCallback(function (newProps) { return setProps(newProps); });
    }, []);
    return (react_1.default.createElement(customContext_1.CustomContext.Provider, { value: { setMethods: setMethods } },
        react_1.default.createElement(CustomComponentClass, __assign({}, props))));
};
exports.default = react_1.memo(CustomWrapperComp);
