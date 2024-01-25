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
var beansContext_1 = require("../beansContext");
var jsComp_1 = require("../jsComp");
var utils_1 = require("../utils");
var HeaderGroupCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var ctrl = props.ctrl;
    var _a = react_1.useState(function () { return new utils_1.CssClasses(); }), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(function () { return new utils_1.CssClasses(); }), cssResizableClasses = _b[0], setResizableCssClasses = _b[1];
    var _c = react_1.useState("false"), resizableAriaHidden = _c[0], setResizableAriaHidden = _c[1];
    var _d = react_1.useState(), ariaExpanded = _d[0], setAriaExpanded = _d[1];
    var _e = react_1.useState(), userCompDetails = _e[0], setUserCompDetails = _e[1];
    var colId = react_1.useMemo(function () { return ctrl.getColId(); }, []);
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var userCompRef = react_1.useRef();
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            return;
        }
        var compProxy = {
            setWidth: function (width) {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setUserCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            setResizableDisplayed: function (displayed) {
                setResizableCssClasses(function (prev) { return prev.setClass('ag-hidden', !displayed); });
                setResizableAriaHidden(!displayed ? "true" : "false");
            },
            setAriaExpanded: function (expanded) { return setAriaExpanded(expanded); },
            getUserCompInstance: function () { return userCompRef.current || undefined; },
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
    }, []);
    // js comps
    react_1.useLayoutEffect(function () { return jsComp_1.showJsComp(userCompDetails, context, eGui.current); }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(function () {
        if (eGui.current) {
            ctrl.setDragSource(eGui.current);
        }
    }, [userCompDetails]);
    var userCompStateless = react_1.useMemo(function () {
        var res = (userCompDetails === null || userCompDetails === void 0 ? void 0 : userCompDetails.componentFromFramework) && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var className = react_1.useMemo(function () { return 'ag-header-group-cell ' + cssClasses.toString(); }, [cssClasses]);
    var resizableClassName = react_1.useMemo(function () { return 'ag-header-cell-resize ' + cssResizableClasses.toString(); }, [cssResizableClasses]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: setRef, className: className, "col-id": colId, role: "columnheader", tabIndex: -1, "aria-expanded": ariaExpanded },
        reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
        reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef })),
        react_1.default.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName })));
};
exports.default = react_1.memo(HeaderGroupCellComp);
