// ag-grid-react v29.3.5
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var headerCellComp_1 = __importDefault(require("./headerCellComp"));
var headerGroupCellComp_1 = __importDefault(require("./headerGroupCellComp"));
var headerFilterCellComp_1 = __importDefault(require("./headerFilterCellComp"));
var useEffectOnce_1 = require("../useEffectOnce");
var HeaderRowComp = function (props) {
    var gridOptionsService = react_1.useContext(beansContext_1.BeansContext).gridOptionsService;
    var _a = react_1.useState(), transform = _a[0], setTransform = _a[1];
    var _b = react_1.useState(), height = _b[0], setHeight = _b[1];
    var _c = react_1.useState(), top = _c[0], setTop = _c[1];
    var _d = react_1.useState(), ariaRowIndex = _d[0], setAriaRowIndex = _d[1];
    var _e = react_1.useState([]), cellCtrls = _e[0], setCellCtrls = _e[1];
    var eGui = react_1.useRef(null);
    var ctrl = props.ctrl;
    var typeColumn = ctrl.getType() === ag_grid_community_1.HeaderRowType.COLUMN;
    var typeGroup = ctrl.getType() === ag_grid_community_1.HeaderRowType.COLUMN_GROUP;
    var typeFilter = ctrl.getType() === ag_grid_community_1.HeaderRowType.FLOATING_FILTER;
    var setCellCtrlsMaintainOrder = react_1.useCallback(function (prev, next) {
        var isEnsureDomOrder = gridOptionsService.is('ensureDomOrder');
        var isPrintLayout = gridOptionsService.isDomLayout('print');
        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (isEnsureDomOrder || isPrintLayout) {
            return next;
        }
        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        var prevMap = ag_grid_community_1._.mapById(prev, function (c) { return c.getInstanceId(); });
        var nextMap = ag_grid_community_1._.mapById(next, function (c) { return c.getInstanceId(); });
        var oldCtrlsWeAreKeeping = prev.filter(function (c) { return nextMap.has(c.getInstanceId()); });
        var newCtrls = next.filter(function (c) { return !prevMap.has(c.getInstanceId()); });
        return __spreadArrays(oldCtrlsWeAreKeeping, newCtrls);
    }, []);
    useEffectOnce_1.useLayoutEffectOnce(function () {
        var compProxy = {
            setTransform: function (transform) { return setTransform(transform); },
            setHeight: function (height) { return setHeight(height); },
            setTop: function (top) { return setTop(top); },
            setHeaderCtrls: function (ctrls) { return setCellCtrls(function (prev) { return setCellCtrlsMaintainOrder(prev, ctrls); }); },
            setWidth: function (width) { return eGui.current.style.width = width; },
            setAriaRowIndex: function (rowIndex) { return setAriaRowIndex(rowIndex); }
        };
        ctrl.setComp(compProxy);
    });
    var style = react_1.useMemo(function () { return ({
        transform: transform,
        height: height,
        top: top,
    }); }, [transform, height, top]);
    var className = react_1.useMemo(function () {
        var res = ["ag-header-row"];
        typeColumn && res.push("ag-header-row-column");
        typeGroup && res.push("ag-header-row-column-group");
        typeFilter && res.push("ag-header-row-column-filter");
        return res.join(' ');
    }, []);
    var createCellJsx = react_1.useCallback(function (cellCtrl) {
        switch (ctrl.getType()) {
            case ag_grid_community_1.HeaderRowType.COLUMN_GROUP:
                return react_1.default.createElement(headerGroupCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            case ag_grid_community_1.HeaderRowType.FLOATING_FILTER:
                return react_1.default.createElement(headerFilterCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            default:
                return react_1.default.createElement(headerCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
        }
    }, []);
    return (react_1.default.createElement("div", { ref: eGui, className: className, role: "row", style: style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx)));
};
exports.default = react_1.memo(HeaderRowComp);
