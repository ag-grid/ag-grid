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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var jsComp_1 = require("../jsComp");
var utils_1 = require("../utils");
var GroupCellRenderer = react_1.forwardRef(function (props, ref) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var eGui = react_1.useRef(null);
    var eValueRef = react_1.useRef(null);
    var eCheckboxRef = react_1.useRef(null);
    var eExpandedRef = react_1.useRef(null);
    var eContractedRef = react_1.useRef(null);
    var ctrlRef = react_1.useRef();
    var _a = react_1.useState(), innerCompDetails = _a[0], setInnerCompDetails = _a[1];
    var _b = react_1.useState(), childCount = _b[0], setChildCount = _b[1];
    var _c = react_1.useState(), value = _c[0], setValue = _c[1];
    var _d = react_1.useState(function () { return new utils_1.CssClasses(); }), cssClasses = _d[0], setCssClasses = _d[1];
    var _e = react_1.useState(function () { return new utils_1.CssClasses('ag-hidden'); }), expandedCssClasses = _e[0], setExpandedCssClasses = _e[1];
    var _f = react_1.useState(function () { return new utils_1.CssClasses('ag-hidden'); }), contractedCssClasses = _f[0], setContractedCssClasses = _f[1];
    var _g = react_1.useState(function () { return new utils_1.CssClasses('ag-invisible'); }), checkboxCssClasses = _g[0], setCheckboxCssClasses = _g[1];
    react_1.useImperativeHandle(ref, function () {
        return {
            // force new instance when grid tries to refresh
            refresh: function () { return false; }
        };
    });
    react_1.useLayoutEffect(function () {
        return jsComp_1.showJsComp(innerCompDetails, context, eValueRef.current);
    }, [innerCompDetails]);
    var setRef = react_1.useCallback(function (ref) {
        eGui.current = ref;
        if (!eGui.current) {
            context.destroyBean(ctrlRef.current);
            ctrlRef.current = null;
            return;
        }
        var compProxy = {
            setInnerRenderer: function (details, valueToDisplay) {
                setInnerCompDetails(details);
                setValue(valueToDisplay);
            },
            setChildCount: function (count) { return setChildCount(count); },
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setContractedDisplayed: function (displayed) { return setContractedCssClasses(function (prev) { return prev.setClass('ag-hidden', !displayed); }); },
            setExpandedDisplayed: function (displayed) { return setExpandedCssClasses(function (prev) { return prev.setClass('ag-hidden', !displayed); }); },
            setCheckboxVisible: function (visible) { return setCheckboxCssClasses(function (prev) { return prev.setClass('ag-invisible', !visible); }); }
        };
        ctrlRef.current = context.createBean(new ag_grid_community_1.GroupCellRendererCtrl());
        ctrlRef.current.init(compProxy, eGui.current, eCheckboxRef.current, eExpandedRef.current, eContractedRef.current, GroupCellRenderer, props);
    }, []);
    var className = react_1.useMemo(function () { return "ag-cell-wrapper " + cssClasses.toString(); }, [cssClasses]);
    var expandedClassName = react_1.useMemo(function () { return "ag-group-expanded " + expandedCssClasses.toString(); }, [expandedCssClasses]);
    var contractedClassName = react_1.useMemo(function () { return "ag-group-contracted " + contractedCssClasses.toString(); }, [contractedCssClasses]);
    var checkboxClassName = react_1.useMemo(function () { return "ag-group-checkbox " + checkboxCssClasses.toString(); }, [checkboxCssClasses]);
    var useFwRenderer = innerCompDetails && innerCompDetails.componentFromFramework;
    var FwRenderer = useFwRenderer ? innerCompDetails.componentClass : undefined;
    var useValue = innerCompDetails == null && value != null;
    var escapedValue = ag_grid_community_1._.escapeString(value, true);
    return (react_1.default.createElement("span", __assign({ className: className, ref: setRef }, (!props.colDef ? { role: 'gridcell' } : {})),
        react_1.default.createElement("span", { className: expandedClassName, ref: eExpandedRef }),
        react_1.default.createElement("span", { className: contractedClassName, ref: eContractedRef }),
        react_1.default.createElement("span", { className: checkboxClassName, ref: eCheckboxRef }),
        react_1.default.createElement("span", { className: "ag-group-value", ref: eValueRef },
            useValue && react_1.default.createElement(react_1.default.Fragment, null, escapedValue),
            useFwRenderer && react_1.default.createElement(FwRenderer, __assign({}, innerCompDetails.params))),
        react_1.default.createElement("span", { className: "ag-group-child-count" }, childCount)));
});
// we do not memo() here, as it would stop the forwardRef working
exports.default = GroupCellRenderer;
