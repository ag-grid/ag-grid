// ag-grid-react v30.2.1
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
var RowComp = function (params) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var rowCtrl = params.rowCtrl, containerType = params.containerType;
    var tabIndex = rowCtrl.getTabIndex();
    var domOrderRef = react_1.useRef(rowCtrl.getDomOrder());
    var isFullWidth = rowCtrl.isFullWidth();
    // Flag used to avoid problematic initialState setter funcs being called on a dead / non displayed row. 
    // Due to async rendering its possible for the row to be destroyed before React has had a chance to render it.
    var isDisplayed = rowCtrl.getRowNode().displayed;
    var _a = react_1.useState(function () { return isDisplayed ? rowCtrl.getRowIndex() : null; }), rowIndex = _a[0], setRowIndex = _a[1];
    var _b = react_1.useState(function () { return rowCtrl.getRowId(); }), rowId = _b[0], setRowId = _b[1];
    var _c = react_1.useState(function () { return rowCtrl.getBusinessKey(); }), rowBusinessKey = _c[0], setRowBusinessKey = _c[1];
    var _d = react_1.useState(function () { return rowCtrl.getRowStyles(); }), userStyles = _d[0], setUserStyles = _d[1];
    var _e = react_1.useState(function () { return null; }), cellCtrls = _e[0], setCellCtrls = _e[1];
    var _f = react_1.useState(), fullWidthCompDetails = _f[0], setFullWidthCompDetails = _f[1];
    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    var _g = react_1.useState(function () { return isDisplayed ? rowCtrl.getInitialRowTop(containerType) : undefined; }), top = _g[0], setTop = _g[1];
    var _h = react_1.useState(function () { return isDisplayed ? rowCtrl.getInitialTransform(containerType) : undefined; }), transform = _h[0], setTransform = _h[1];
    var eGui = react_1.useRef(null);
    var fullWidthCompRef = react_1.useRef();
    var autoHeightSetup = react_1.useRef(false);
    var _j = react_1.useState(0), autoHeightSetupAttempt = _j[0], setAutoHeightSetupAttempt = _j[1];
    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    // I think this looping could be avoided if we use a ref Callback instead of useRef,
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
    var cssClassManager = react_1.useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new ag_grid_community_1.CssClassManager(function () { return eGui.current; });
    }
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            rowCtrl.unsetComp(containerType);
            return;
        }
        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) {
            return;
        }
        var compProxy = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop: setTop,
            setTransform: setTransform,
            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            addOrRemoveCssClass: function (name, on) { return cssClassManager.current.addOrRemoveCssClass(name, on); },
            setDomOrder: function (domOrder) { return domOrderRef.current = domOrder; },
            setRowIndex: setRowIndex,
            setRowId: setRowId,
            setRowBusinessKey: setRowBusinessKey,
            setUserStyles: setUserStyles,
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: function (next, useFlushSync) {
                utils_1.agFlushSync(useFlushSync, function () {
                    setCellCtrls(function (prev) { return utils_1.getNextValueIfDifferent(prev, next, domOrderRef.current); });
                });
            },
            showFullWidth: function (compDetails) { return setFullWidthCompDetails(compDetails); },
            getFullWidthCellRenderer: function () { return fullWidthCompRef.current; },
        };
        rowCtrl.setComp(compProxy, eGui.current, containerType);
    }, []);
    react_1.useLayoutEffect(function () { return jsComp_1.showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef); }, [fullWidthCompDetails]);
    var rowStyles = react_1.useMemo(function () {
        var res = { top: top, transform: transform };
        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);
    var showFullWidthFramework = isFullWidth && fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    var showCells = !isFullWidth && cellCtrls != null;
    var reactFullWidthCellRendererStateless = react_1.useMemo(function () {
        var res = (fullWidthCompDetails === null || fullWidthCompDetails === void 0 ? void 0 : fullWidthCompDetails.componentFromFramework) && utils_1.isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);
    var showCellsJsx = function () { return cellCtrls === null || cellCtrls === void 0 ? void 0 : cellCtrls.map(function (cellCtrl) { return (react_1.default.createElement(cellComp_1.default, { cellCtrl: cellCtrl, editingRow: rowCtrl.isEditing(), printLayout: rowCtrl.isPrintLayout(), key: cellCtrl.getInstanceId() })); }); };
    var showFullWidthFrameworkJsx = function () {
        var FullWidthComp = fullWidthCompDetails.componentClass;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params)),
            !reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, __assign({}, fullWidthCompDetails.params, { ref: fullWidthCompRef }))));
    };
    return (react_1.default.createElement("div", { ref: setRef, role: 'row', style: rowStyles, "row-index": rowIndex, "row-id": rowId, "row-business-key": rowBusinessKey, tabIndex: tabIndex },
        showCells && showCellsJsx(),
        showFullWidthFramework && showFullWidthFrameworkJsx()));
};
exports.default = react_1.memo(RowComp);
