// ag-grid-react v26.2.0
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
var ag_grid_community_1 = require("ag-grid-community");
var jsComp_1 = require("../jsComp");
var utils_1 = require("../utils");
var beansContext_1 = require("../beansContext");
var cellComp_1 = __importDefault(require("../cells/cellComp"));
var maintainOrderOnColumns = function (prev, next, domOrder) {
    if (domOrder) {
        var res_1 = { list: next, instanceIdMap: new Map() };
        next.forEach(function (c) { return res_1.instanceIdMap.set(c.getInstanceId(), c); });
        return res_1;
    }
    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    var oldCellCtrls = [];
    var newCellCtrls = [];
    var newInstanceIdMap = new Map();
    var tempMap = new Map();
    next.forEach(function (c) { return tempMap.set(c.getInstanceId(), c); });
    prev.list.forEach(function (c) {
        var instanceId = c.getInstanceId();
        if (tempMap.has(instanceId)) {
            oldCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    next.forEach(function (c) {
        var instanceId = c.getInstanceId();
        if (!prev.instanceIdMap.has(instanceId)) {
            newCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    var res = {
        list: __spreadArrays(oldCellCtrls, newCellCtrls),
        instanceIdMap: newInstanceIdMap
    };
    return res;
};
var RowComp = function (params) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var rowCtrl = params.rowCtrl, pinned = params.pinned;
    var _a = react_1.useState(), height = _a[0], setHeight = _a[1];
    var _b = react_1.useState(rowCtrl.getInitialRowTop()), top = _b[0], setTop = _b[1];
    var _c = react_1.useState(rowCtrl.getInitialTransform()), transform = _c[0], setTransform = _c[1];
    var _d = react_1.useState(new utils_1.CssClasses()), cssClasses = _d[0], setCssClasses = _d[1];
    var _e = react_1.useState(), rowIndex = _e[0], setRowIndex = _e[1];
    var _f = react_1.useState(), rowId = _f[0], setRowId = _f[1];
    var _g = react_1.useState(), role = _g[0], setRole = _g[1];
    var _h = react_1.useState(), rowBusinessKey = _h[0], setRowBusinessKey = _h[1];
    var _j = react_1.useState(), tabIndex = _j[0], setTabIndex = _j[1];
    var _k = react_1.useState(), ariaRowIndex = _k[0], setAriaRowIndex = _k[1];
    var _l = react_1.useState(), ariaExpanded = _l[0], setAriaExpanded = _l[1];
    var _m = react_1.useState(), ariaLabel = _m[0], setAriaLabel = _m[1];
    var _o = react_1.useState(), ariaSelected = _o[0], setAriaSelected = _o[1];
    var _p = react_1.useState(), userStyles = _p[0], setUserStyles = _p[1];
    var _q = react_1.useState({ list: [], instanceIdMap: new Map() }), cellCtrls = _q[0], setCellCtrls = _q[1];
    var _r = react_1.useState(), fullWidthCompDetails = _r[0], setFullWidthCompDetails = _r[1];
    var _s = react_1.useState(false), domOrder = _s[0], setDomOrder = _s[1];
    var _t = react_1.useState(), display = _t[0], setDisplay = _t[1];
    var eGui = react_1.useRef(null);
    var fullWidthCompRef = react_1.useRef();
    react_1.useEffect(function () {
        var compProxy = {
            setDisplay: function (value) { return setDisplay(value); },
            setDomOrder: function (domOrder) { return setDomOrder(domOrder); },
            setHeight: function (value) { return setHeight(value); },
            setTop: function (value) { return setTop(value); },
            setTransform: function (value) { return setTransform(value); },
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setRowIndex: function (value) { return setRowIndex(value); },
            setAriaRowIndex: function (value) { return setAriaRowIndex(value); },
            setAriaExpanded: function (value) { return setAriaExpanded(value); },
            setAriaLabel: function (value) { return setAriaLabel(value); },
            setRowId: function (value) { return setRowId(value); },
            setRowBusinessKey: function (value) { return setRowBusinessKey(value); },
            setTabIndex: function (value) { return setTabIndex(value); },
            setUserStyles: function (styles) { return setUserStyles(styles); },
            setAriaSelected: function (value) { return setAriaSelected(value); },
            setRole: function (value) { return setRole(value); },
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: function (next) { return setCellCtrls(function (prev) { return maintainOrderOnColumns(prev, next, domOrder); }); },
            showFullWidth: function (compDetails) { return setFullWidthCompDetails(compDetails); },
            getFullWidthCellRenderer: function () { return fullWidthCompRef.current; },
        };
        rowCtrl.setComp(compProxy, eGui.current, pinned);
    }, []);
    react_1.useEffect(function () {
        return jsComp_1.showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef);
    }, [fullWidthCompDetails]);
    var rowStyles = react_1.useMemo(function () {
        var res = {
            height: height,
            top: top,
            transform: transform,
            display: display
        };
        ag_grid_community_1._.assign(res, userStyles);
        return res;
    }, [height, top, transform, userStyles, display]);
    var className = react_1.useMemo(function () { return cssClasses.toString(); }, [cssClasses]);
    var showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    var showCells = cellCtrls != null;
    var reactFullWidthCellRendererStateless = react_1.useMemo(function () {
        var res = fullWidthCompDetails
            && fullWidthCompDetails.componentFromFramework
            && utils_1.isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);
    var showCellsJsx = function () { return cellCtrls.list.map(function (cellCtrl) {
        return (react_1.default.createElement(cellComp_1.default, { cellCtrl: cellCtrl, editingRow: rowCtrl.isEditing(), printLayout: rowCtrl.isPrintLayout(), key: cellCtrl.getInstanceId() }));
    }); };
    var showFullWidthFrameworkJsx = function () {
        var FullWidthComp = fullWidthCompDetails.componentClass;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params)),
            !reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params, { ref: fullWidthCompRef }))));
    };
    return (react_1.default.createElement("div", { ref: eGui, role: role, className: className, style: rowStyles, "row-index": rowIndex, "aria-rowindex": ariaRowIndex, "aria-expanded": ariaExpanded, "aria-label": ariaLabel, "aria-selected": ariaSelected, "row-id": rowId, "row-business-key": rowBusinessKey, tabIndex: tabIndex },
        showCells && showCellsJsx(),
        showFullWidthFramework && showFullWidthFrameworkJsx()));
};
exports.default = react_1.memo(RowComp);
