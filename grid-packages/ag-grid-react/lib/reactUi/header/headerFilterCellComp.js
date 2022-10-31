// ag-grid-react v28.2.1
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var ag_grid_community_1 = require("ag-grid-community");
var utils_1 = require("../utils");
var jsComp_1 = require("../jsComp");
var useEffectOnce_1 = require("../useEffectOnce");
var HeaderFilterCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(new utils_1.CssClasses('ag-header-cell', 'ag-floating-filter')), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(new utils_1.CssClasses()), cssBodyClasses = _b[0], setBodyCssClasses = _b[1];
    var _c = react_1.useState(new utils_1.CssClasses('ag-floating-filter-button', 'ag-hidden')), cssButtonWrapperClasses = _c[0], setButtonWrapperCssClasses = _c[1];
    var _d = react_1.useState(), width = _d[0], setWidth = _d[1];
    var _e = react_1.useState(), userCompDetails = _e[0], setUserCompDetails = _e[1];
    var eGui = react_1.useRef(null);
    var eFloatingFilterBody = react_1.useRef(null);
    var eButtonWrapper = react_1.useRef(null);
    var eButtonShowMainFilter = react_1.useRef(null);
    var alreadyResolved = react_1.useRef(false);
    var userCompResolve = react_1.useRef();
    var userCompPromise = react_1.useRef();
    useEffectOnce_1.useEffectOnce(function () {
        userCompPromise.current = new ag_grid_community_1.AgPromise(function (resolve) {
            userCompResolve.current = resolve;
        });
    });
    var userCompRef = function (value) {
        // i don't know why, but react was calling this method multiple
        // times, thus un-setting, them immediately setting the reference again.
        // because we are resolving a promise, it's not good to be resolving
        // the promise multiple times, so we only resolve the first time.
        if (alreadyResolved.current) {
            return;
        }
        // we also skip when it's un-setting
        if (value == null) {
            return;
        }
        userCompResolve.current && userCompResolve.current(value);
        alreadyResolved.current = true;
    };
    var ctrl = props.ctrl;
    useEffectOnce_1.useEffectOnce(function () {
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveBodyCssClass: function (name, on) { return setBodyCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveButtonWrapperCssClass: function (name, on) { return setButtonWrapperCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setWidth: function (width) { return setWidth(width); },
            setCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getFloatingFilterComp: function () { return userCompPromise.current ? userCompPromise.current : null; },
            setMenuIcon: function (eIcon) { return eButtonShowMainFilter.current.appendChild(eIcon); }
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    });
    // js comps
    react_1.useEffect(function () {
        return jsComp_1.showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef);
    }, [userCompDetails]);
    var style = react_1.useMemo(function () { return ({
        width: width
    }); }, [width]);
    var className = react_1.useMemo(function () { return cssClasses.toString(); }, [cssClasses]);
    var bodyClassName = react_1.useMemo(function () { return cssBodyClasses.toString(); }, [cssBodyClasses]);
    var buttonWrapperClassName = react_1.useMemo(function () { return cssButtonWrapperClasses.toString(); }, [cssButtonWrapperClasses]);
    var userCompStateless = react_1.useMemo(function () {
        var res = userCompDetails
            && userCompDetails.componentFromFramework
            && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, role: "gridcell", tabIndex: -1 },
        react_1.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef }))),
        react_1.default.createElement("div", { ref: eButtonWrapper, className: buttonWrapperClassName, role: "presentation" },
            react_1.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", "aria-label": "Open Filter Menu", className: "ag-floating-filter-button-button", tabIndex: -1 }))));
};
exports.default = react_1.memo(HeaderFilterCellComp);
