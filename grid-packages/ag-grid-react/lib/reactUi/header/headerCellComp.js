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
var HeaderCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(), width = _a[0], setWidth = _a[1];
    var _b = react_1.useState(), title = _b[0], setTitle = _b[1];
    var _c = react_1.useState(), colId = _c[0], setColId = _c[1];
    var _d = react_1.useState(), ariaSort = _d[0], setAriaSort = _d[1];
    var _e = react_1.useState(), ariaDescription = _e[0], setAriaDescription = _e[1];
    var _f = react_1.useState(), userCompDetails = _f[0], setUserCompDetails = _f[1];
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var eHeaderCompWrapper = react_1.useRef(null);
    var userCompRef = react_1.useRef();
    var ctrl = props.ctrl;
    var cssClassManager = react_1.useMemo(function () { return new ag_grid_community_1.CssClassManager(function () { return eGui.current; }); }, []);
    useEffectOnce_1.useEffectOnce(function () {
        var compProxy = {
            setWidth: function (width) { return setWidth(width); },
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
    react_1.useEffect(function () { return jsComp_1.showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef); }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(function () {
        ctrl.setDragSource(eGui.current);
    }, [userCompDetails]);
    var style = react_1.useMemo(function () { return ({ width: width }); }, [width]);
    var userCompStateless = react_1.useMemo(function () {
        var _a;
        var res = ((_a = userCompDetails) === null || _a === void 0 ? void 0 : _a.componentFromFramework) && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: "ag-header-cell", style: style, title: title, "col-id": colId, "aria-sort": ariaSort, role: "columnheader", tabIndex: -1, "aria-description": ariaDescription },
        react_1.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        react_1.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef })))));
};
exports.default = react_1.memo(HeaderCellComp);
