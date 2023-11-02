// ag-grid-react v30.2.1
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var ag_grid_community_1 = require("ag-grid-community");
var utils_1 = require("../utils");
var headerRowContainerComp_1 = __importDefault(require("./headerRowContainerComp"));
var GridHeaderComp = function () {
    var _a = react_1.useState(function () { return new utils_1.CssClasses(); }), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(), height = _b[0], setHeight = _b[1];
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var eGui = react_1.useRef(null);
    var gridCtrlRef = react_1.useRef(null);
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!e) {
            context.destroyBean(gridCtrlRef.current);
            gridCtrlRef.current = null;
            return;
        }
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setHeightAndMinHeight: function (height) { return setHeight(height); }
        };
        gridCtrlRef.current = context.createBean(new ag_grid_community_1.GridHeaderCtrl());
        gridCtrlRef.current.setComp(compProxy, eGui.current, eGui.current);
    }, []);
    var className = react_1.useMemo(function () {
        var res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);
    var style = react_1.useMemo(function () { return ({
        height: height,
        minHeight: height
    }); }, [height]);
    return (react_1.default.createElement("div", { ref: setRef, className: className, style: style, role: "presentation" },
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: 'left' }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: null }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: 'right' })));
};
exports.default = react_1.memo(GridHeaderComp);
