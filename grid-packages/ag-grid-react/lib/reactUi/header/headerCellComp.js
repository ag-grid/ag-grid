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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var ag_grid_community_1 = require("ag-grid-community");
var utils_1 = require("../utils");
var jsComp_1 = require("../jsComp");
var useEffectOnce_1 = require("../useEffectOnce");
var HeaderCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(), title = _a[0], setTitle = _a[1];
    var _b = react_1.useState(), colId = _b[0], setColId = _b[1];
    var _c = react_1.useState(), ariaSort = _c[0], setAriaSort = _c[1];
    var _d = react_1.useState(), ariaDescription = _d[0], setAriaDescription = _d[1];
    var _e = react_1.useState(), userCompDetails = _e[0], setUserCompDetails = _e[1];
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var eHeaderCompWrapper = react_1.useRef(null);
    var userCompRef = react_1.useRef();
    var ctrl = props.ctrl;
    var cssClassManager = react_1.useMemo(function () { return new ag_grid_community_1.CssClassManager(function () { return eGui.current; }); }, []);
    useEffectOnce_1.useLayoutEffectOnce(function () {
        var compProxy = {
            setWidth: function (width) { return eGui.current.style.width = width; },
            addOrRemoveCssClass: function (name, on) { return cssClassManager.addOrRemoveCssClass(name, on); },
            setColId: function (id) { return setColId(id); },
            setTitle: function (title) { return setTitle(title); },
            setAriaDescription: function (description) { return setAriaDescription(description); },
            setAriaSort: function (sort) { return setAriaSort(sort); },
            setUserCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getUserCompInstance: function () { return userCompRef.current || undefined; }
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
        var selectAllGui = ctrl.getSelectAllGui();
        eResize.current.insertAdjacentElement('afterend', selectAllGui);
    });
    // js comps
    react_1.useLayoutEffect(function () { return jsComp_1.showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef); }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(function () {
        ctrl.setDragSource(eGui.current);
    }, [userCompDetails]);
    var userCompStateless = react_1.useMemo(function () {
        var res = (userCompDetails === null || userCompDetails === void 0 ? void 0 : userCompDetails.componentFromFramework) && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: "ag-header-cell", title: title, "col-id": colId, "aria-sort": ariaSort, role: "columnheader", tabIndex: -1, "aria-description": ariaDescription },
        react_1.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        react_1.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef })))));
};
exports.default = react_1.memo(HeaderCellComp);
