// ag-grid-react v26.2.0
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
var utils_1 = require("../utils");
var jsComp_1 = require("../jsComp");
var HeaderCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(new utils_1.CssClasses()), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(), width = _b[0], setWidth = _b[1];
    var _c = react_1.useState(), title = _c[0], setTitle = _c[1];
    var _d = react_1.useState(), colId = _d[0], setColId = _d[1];
    var _e = react_1.useState(), ariaSort = _e[0], setAriaSort = _e[1];
    var _f = react_1.useState(), ariaDescribedBy = _f[0], setAriaDescribedBy = _f[1];
    var _g = react_1.useState(), userCompDetails = _g[0], setUserCompDetails = _g[1];
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var userCompRef = react_1.useRef();
    var ctrl = props.ctrl;
    react_1.useEffect(function () {
        var compProxy = {
            setWidth: function (width) { return setWidth(width); },
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setAriaSort: function (sort) { return setAriaSort(sort); },
            setColId: function (id) { return setColId(id); },
            setTitle: function (title) { return setTitle(title); },
            setAriaDescribedBy: function (value) { return setAriaDescribedBy(value); },
            setUserCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            getUserCompInstance: function () { return userCompRef.current || undefined; }
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
        var selectAllGui = ctrl.getSelectAllGui();
        eResize.current.insertAdjacentElement('afterend', selectAllGui);
    }, []);
    // js comps
    react_1.useEffect(function () {
        return jsComp_1.showJsComp(userCompDetails, context, eGui.current, userCompRef);
    }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(function () {
        var userCompDomElement = undefined;
        eGui.current.childNodes.forEach(function (node) {
            if (node != null && node !== eResize.current) {
                userCompDomElement = node;
            }
        });
        ctrl.setDragSource(userCompDomElement);
    }, [userCompDetails]);
    var style = react_1.useMemo(function () { return ({
        width: width
    }); }, [width]);
    var className = react_1.useMemo(function () { return 'ag-header-cell ' + cssClasses.toString(); }, [cssClasses]);
    var userCompStateless = react_1.useMemo(function () {
        var res = userCompDetails
            && userCompDetails.componentFromFramework
            && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, title: title, "col-id": colId, "aria-sort": ariaSort, role: "columnheader", unselectable: "on", tabIndex: -1, "aria-describedby": ariaDescribedBy },
        react_1.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
        reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params, { ref: userCompRef }))));
};
exports.default = react_1.memo(HeaderCellComp);
