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
var HeaderCellComp = function (props) {
    var ctrl = props.ctrl;
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var colId = ctrl.getColId();
    var _a = react_1.useState(), userCompDetails = _a[0], setUserCompDetails = _a[1];
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var eHeaderCompWrapper = react_1.useRef(null);
    var userCompRef = react_1.useRef();
    var cssClassManager = react_1.useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new ag_grid_community_1.CssClassManager(function () { return eGui.current; });
    }
    var setRef = react_1.useCallback(function (e) {
        var _a;
        eGui.current = e;
        if (!eGui.current) {
            // Any clean up required?
            return;
        }
        var compProxy = {
            setWidth: function (width) {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: function (name, on) { return cssClassManager.current.addOrRemoveCssClass(name, on); },
            setAriaDescription: function (label) {
                if (eGui.current) {
                    ag_grid_community_1._.setAriaDescription(eGui.current, label);
                }
            },
            setAriaSort: function (sort) {
                if (eGui.current) {
                    sort ? ag_grid_community_1._.setAriaSort(eGui.current, sort) : ag_grid_community_1._.removeAriaSort(eGui.current);
                }
            },
            setUserCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getUserCompInstance: function () { return userCompRef.current || undefined; }
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
        var selectAllGui = ctrl.getSelectAllGui();
        (_a = eResize.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterend', selectAllGui);
    }, []);
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
    return (react_1.default.createElement("div", { ref: setRef, className: "ag-header-cell", "col-id": colId, role: "columnheader", tabIndex: -1 },
        react_1.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        react_1.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef })))));
};
exports.default = react_1.memo(HeaderCellComp);
