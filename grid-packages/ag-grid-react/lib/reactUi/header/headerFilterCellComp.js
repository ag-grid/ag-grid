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
var ag_grid_community_1 = require("ag-grid-community");
var utils_1 = require("../utils");
var jsComp_1 = require("../jsComp");
var floatingFilterComponentProxy_1 = require("../../shared/customComp/floatingFilterComponentProxy");
var customContext_1 = require("../../shared/customComp/customContext");
var HeaderFilterCellComp = function (props) {
    var _a = react_1.useContext(beansContext_1.BeansContext), context = _a.context, gridOptionsService = _a.gridOptionsService;
    var _b = react_1.useState(function () { return new utils_1.CssClasses('ag-header-cell', 'ag-floating-filter'); }), cssClasses = _b[0], setCssClasses = _b[1];
    var _c = react_1.useState(function () { return new utils_1.CssClasses(); }), cssBodyClasses = _c[0], setBodyCssClasses = _c[1];
    var _d = react_1.useState(function () { return new utils_1.CssClasses('ag-floating-filter-button', 'ag-hidden'); }), cssButtonWrapperClasses = _d[0], setButtonWrapperCssClasses = _d[1];
    var _e = react_1.useState("false"), buttonWrapperAriaHidden = _e[0], setButtonWrapperAriaHidden = _e[1];
    var _f = react_1.useState(), userCompDetails = _f[0], setUserCompDetails = _f[1];
    var _g = react_1.useState(1), renderKey = _g[0], setRenderKey = _g[1];
    var eGui = react_1.useRef(null);
    var eFloatingFilterBody = react_1.useRef(null);
    var eButtonWrapper = react_1.useRef(null);
    var eButtonShowMainFilter = react_1.useRef(null);
    var userCompResolve = react_1.useRef();
    var userCompPromise = react_1.useRef();
    var userCompRef = function (value) {
        // We skip when it's un-setting
        if (value == null) {
            return;
        }
        userCompResolve.current && userCompResolve.current(value);
    };
    var ctrl = props.ctrl;
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            return;
        }
        userCompPromise.current = new ag_grid_community_1.AgPromise(function (resolve) {
            userCompResolve.current = resolve;
        });
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveBodyCssClass: function (name, on) { return setBodyCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setButtonWrapperDisplayed: function (displayed) {
                setButtonWrapperCssClasses(function (prev) { return prev.setClass('ag-hidden', !displayed); });
                setButtonWrapperAriaHidden(!displayed ? "true" : "false");
            },
            setWidth: function (width) {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getFloatingFilterComp: function () { return userCompPromise.current ? userCompPromise.current : null; },
            setMenuIcon: function (eIcon) { var _a; return (_a = eButtonShowMainFilter.current) === null || _a === void 0 ? void 0 : _a.appendChild(eIcon); }
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    }, []);
    // js comps
    react_1.useLayoutEffect(function () { return jsComp_1.showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef); }, [userCompDetails]);
    var className = react_1.useMemo(function () { return cssClasses.toString(); }, [cssClasses]);
    var bodyClassName = react_1.useMemo(function () { return cssBodyClasses.toString(); }, [cssBodyClasses]);
    var buttonWrapperClassName = react_1.useMemo(function () { return cssButtonWrapperClasses.toString(); }, [cssButtonWrapperClasses]);
    var userCompStateless = react_1.useMemo(function () {
        var res = userCompDetails
            && userCompDetails.componentFromFramework
            && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var reactiveCustomComponents = react_1.useMemo(function () { return gridOptionsService.get('reactiveCustomComponents'); }, []);
    var floatingFilterCompProxy = react_1.useMemo(function () {
        if (reactiveCustomComponents && userCompDetails) {
            var compProxy = new floatingFilterComponentProxy_1.FloatingFilterComponentProxy(userCompDetails.params, function () { return setRenderKey(function (prev) { return prev + 1; }); });
            userCompRef(compProxy);
            return compProxy;
        }
        return undefined;
    }, [userCompDetails]);
    var floatingFilterProps = floatingFilterCompProxy === null || floatingFilterCompProxy === void 0 ? void 0 : floatingFilterCompProxy.getProps();
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: setRef, className: className, role: "gridcell", tabIndex: -1 },
        react_1.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" },
            reactUserComp && !reactiveCustomComponents && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompStateless ? function () { } : userCompRef })),
            reactUserComp && reactiveCustomComponents && react_1.default.createElement(customContext_1.CustomContext.Provider, { value: {
                    setMethods: function (methods) { return floatingFilterCompProxy.setMethods(methods); }
                } },
                react_1.default.createElement(UserCompClass, __assign({}, floatingFilterProps)))),
        react_1.default.createElement("div", { ref: eButtonWrapper, "aria-hidden": buttonWrapperAriaHidden, className: buttonWrapperClassName, role: "presentation" },
            react_1.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", className: "ag-button ag-floating-filter-button-button", tabIndex: -1 }))));
};
exports.default = react_1.memo(HeaderFilterCellComp);
