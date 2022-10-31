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
var jsComp_1 = require("../jsComp");
var useEffectOnce_1 = require("../useEffectOnce");
var utils_1 = require("../utils");
var HeaderGroupCellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(new utils_1.CssClasses()), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(new utils_1.CssClasses()), cssResizableClasses = _b[0], setResizableCssClasses = _b[1];
    var _c = react_1.useState(), width = _c[0], setWidth = _c[1];
    var _d = react_1.useState(), title = _d[0], setTitle = _d[1];
    var _e = react_1.useState(), colId = _e[0], setColId = _e[1];
    var _f = react_1.useState(), ariaExpanded = _f[0], setAriaExpanded = _f[1];
    var _g = react_1.useState(), userCompDetails = _g[0], setUserCompDetails = _g[1];
    var eGui = react_1.useRef(null);
    var eResize = react_1.useRef(null);
    var ctrl = props.ctrl;
    useEffectOnce_1.useEffectOnce(function () {
        var compProxy = {
            setWidth: function (width) { return setWidth(width); },
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setColId: function (id) { return setColId(id); },
            setTitle: function (title) { return setTitle(title); },
            setUserCompDetails: function (compDetails) { return setUserCompDetails(compDetails); },
            addOrRemoveResizableCssClass: function (name, on) { return setResizableCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setAriaExpanded: function (expanded) { return setAriaExpanded(expanded); }
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
    });
    // js comps
    react_1.useEffect(function () {
        return jsComp_1.showJsComp(userCompDetails, context, eGui.current);
    }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(function () {
        var userCompDomElement = undefined;
        eGui.current.childNodes.forEach(function (node) {
            if (node != null && node !== eResize.current) {
                userCompDomElement = node;
            }
        });
        userCompDomElement && ctrl.setDragSource(userCompDomElement);
    }, [userCompDetails]);
    var style = react_1.useMemo(function () { return ({
        width: width
    }); }, [width]);
    var className = react_1.useMemo(function () { return 'ag-header-group-cell ' + cssClasses.toString(); }, [cssClasses]);
    var resizableClassName = react_1.useMemo(function () { return 'ag-header-cell-resize ' + cssResizableClasses.toString(); }, [cssResizableClasses]);
    var reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    var UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, title: title, "col-id": colId, role: "columnheader", tabIndex: -1, "aria-expanded": ariaExpanded },
        reactUserComp && react_1.default.createElement(UserCompClass, __assign({}, userCompDetails.params)),
        react_1.default.createElement("div", { ref: eResize, className: resizableClassName })));
};
exports.default = react_1.memo(HeaderGroupCellComp);
