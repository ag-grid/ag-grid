// ag-grid-react v29.3.5
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
var react_1 = __importStar(require("react"));
var ag_grid_community_1 = require("ag-grid-community");
var jsComp_1 = require("../jsComp");
var utils_1 = require("../utils");
var beansContext_1 = require("../beansContext");
var cellComp_1 = __importDefault(require("../cells/cellComp"));
var useEffectOnce_1 = require("../useEffectOnce");
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
    var rowCtrl = params.rowCtrl, containerType = params.containerType;
    var _a = react_1.useState(), rowIndex = _a[0], setRowIndex = _a[1];
    var _b = react_1.useState(), rowId = _b[0], setRowId = _b[1];
    var _c = react_1.useState(), role = _c[0], setRole = _c[1];
    var _d = react_1.useState(), rowBusinessKey = _d[0], setRowBusinessKey = _d[1];
    var _e = react_1.useState(), tabIndex = _e[0], setTabIndex = _e[1];
    var _f = react_1.useState(), userStyles = _f[0], setUserStyles = _f[1];
    var _g = react_1.useState({ list: [], instanceIdMap: new Map() }), cellCtrls = _g[0], setCellCtrls = _g[1];
    var _h = react_1.useState(), fullWidthCompDetails = _h[0], setFullWidthCompDetails = _h[1];
    var _j = react_1.useState(false), domOrder = _j[0], setDomOrder = _j[1];
    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    var _k = react_1.useState(rowCtrl.getInitialRowTop(containerType)), top = _k[0], setTop = _k[1];
    var _l = react_1.useState(rowCtrl.getInitialTransform(containerType)), transform = _l[0], setTransform = _l[1];
    var eGui = react_1.useRef(null);
    var fullWidthCompRef = react_1.useRef();
    var autoHeightSetup = react_1.useRef(false);
    var _m = react_1.useState(0), autoHeightSetupAttempt = _m[0], setAutoHeightSetupAttempt = _m[1];
    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    react_1.useEffect(function () {
        var _a;
        if (autoHeightSetup.current) {
            return;
        }
        if (!fullWidthCompDetails) {
            return;
        }
        if (autoHeightSetupAttempt > 10) {
            return;
        }
        var eChild = (_a = eGui.current) === null || _a === void 0 ? void 0 : _a.firstChild;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        }
        else {
            setAutoHeightSetupAttempt(function (prev) { return prev + 1; });
        }
    }, [fullWidthCompDetails, autoHeightSetupAttempt]);
    var cssClassManager = react_1.useMemo(function () { return new ag_grid_community_1.CssClassManager(function () { return eGui.current; }); }, []);
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.
    useEffectOnce_1.useLayoutEffectOnce(function () {
        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) {
            return;
        }
        var compProxy = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop: function (value) { return setTop(value); },
            setTransform: function (value) { return setTransform(value); },
            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            addOrRemoveCssClass: function (name, on) { return cssClassManager.addOrRemoveCssClass(name, on); },
            setDomOrder: function (domOrder) { return setDomOrder(domOrder); },
            setRowIndex: function (value) { return setRowIndex(value); },
            setRowId: function (value) { return setRowId(value); },
            setRowBusinessKey: function (value) { return setRowBusinessKey(value); },
            setTabIndex: function (value) { return setTabIndex(value); },
            setUserStyles: function (styles) { return setUserStyles(styles); },
            setRole: function (value) { return setRole(value); },
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: function (next, useFlushSync) {
                utils_1.agFlushSync(useFlushSync, function () {
                    setCellCtrls(function (prev) { return maintainOrderOnColumns(prev, next, domOrder); });
                });
            },
            showFullWidth: function (compDetails) { return setFullWidthCompDetails(compDetails); },
            getFullWidthCellRenderer: function () { return fullWidthCompRef.current; },
        };
        rowCtrl.setComp(compProxy, eGui.current, containerType);
        return function () {
            rowCtrl.unsetComp(containerType);
        };
    });
    react_1.useLayoutEffect(function () { return jsComp_1.showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef); }, [fullWidthCompDetails]);
    var rowStyles = react_1.useMemo(function () {
        var res = { top: top, transform: transform };
        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);
    var showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    var showCells = cellCtrls != null;
    var reactFullWidthCellRendererStateless = react_1.useMemo(function () {
        var res = (fullWidthCompDetails === null || fullWidthCompDetails === void 0 ? void 0 : fullWidthCompDetails.componentFromFramework) && utils_1.isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);
    var showCellsJsx = function () { return cellCtrls.list.map(function (cellCtrl) { return (react_1.default.createElement(cellComp_1.default, { cellCtrl: cellCtrl, editingRow: rowCtrl.isEditing(), printLayout: rowCtrl.isPrintLayout(), key: cellCtrl.getInstanceId() })); }); };
    var showFullWidthFrameworkJsx = function () {
        var FullWidthComp = fullWidthCompDetails.componentClass;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params)),
            !reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params, { ref: fullWidthCompRef }))));
    };
    return (react_1.default.createElement("div", { ref: eGui, role: role, style: rowStyles, "row-index": rowIndex, "row-id": rowId, "row-business-key": rowBusinessKey, tabIndex: tabIndex },
        showCells && showCellsJsx(),
        showFullWidthFramework && showFullWidthFrameworkJsx()));
};
exports.default = react_1.memo(RowComp);
