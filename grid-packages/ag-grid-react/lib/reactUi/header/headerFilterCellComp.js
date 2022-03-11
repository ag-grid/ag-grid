// ag-grid-react v27.1.0
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
var HeaderFilterCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(new utils_1.CssClasses()), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(new utils_1.CssClasses()), cssBodyClasses = _b[0], setBodyCssClasses = _b[1];
    var _c = react_1.useState(new utils_1.CssClasses()), cssButtonWrapperClasses = _c[0], setButtonWrapperCssClasses = _c[1];
    var _d = react_1.useState(), width = _d[0], setWidth = _d[1];
    var _e = react_1.useState(), userCompDetails = _e[0], setUserCompDetails = _e[1];
    var eGui = react_1.useRef(null);
    var eFloatingFilterBody = react_1.useRef(null);
    var eButtonWrapper = react_1.useRef(null);
    var eButtonShowMainFilter = react_1.useRef(null);
    var userCompResolve = react_1.useRef();
    var userCompPromise = react_1.useMemo(function () { return new ag_grid_community_1.AgPromise(function (resolve) { return userCompResolve.current = resolve; }); }, []);
    var ctrl = props.ctrl;
    react_1.useEffect(function () {
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveBodyCssClass: function (name, on) { return setBodyCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveButtonWrapperCssClass: function (name, on) { return setButtonWrapperCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setWidth: function (width) { return setWidth(width); },
            setCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getFloatingFilterComp: function () { return userCompPromise; },
            setMenuIcon: function (eIcon) { return eButtonShowMainFilter.current.appendChild(eIcon); }
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    }, []);
    // js comps
    react_1.useEffect(function () {
        return jsComp_1.showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompResolve.current);
    }, [userCompDetails]);
    var style = react_1.useMemo(function () { return ({
        width: width
    }); }, [width]);
    var className = react_1.useMemo(function () { return 'ag-header-cell ag-floating-filter ' + cssClasses.toString(); }, [cssClasses]);
    var bodyClassName = react_1.useMemo(function () { return cssBodyClasses.toString(); }, [cssBodyClasses]);
    var buttonWrapperClassName = react_1.useMemo(function () { return 'ag-floating-filter-button ' + cssButtonWrapperClasses.toString(); }, [cssBodyClasses]);
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
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompResolve.current }))),
        react_1.default.createElement("div", { ref: eButtonWrapper, className: buttonWrapperClassName, role: "presentation" },
            react_1.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", "aria-label": "Open Filter Menu", className: "ag-floating-filter-button-button", tabIndex: -1 }))));
};
exports.default = react_1.memo(HeaderFilterCellComp);
