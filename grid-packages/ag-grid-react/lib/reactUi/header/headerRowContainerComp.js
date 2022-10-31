// ag-grid-react v28.2.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var ag_grid_community_1 = require("ag-grid-community");
var utils_1 = require("../utils");
var headerRowComp_1 = __importDefault(require("./headerRowComp"));
var useEffectOnce_1 = require("../useEffectOnce");
var HeaderRowContainerComp = function (props) {
    var _a = react_1.useState(new utils_1.CssClasses()), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(), centerContainerWidth = _b[0], setCenterContainerWidth = _b[1];
    var _c = react_1.useState(), centerContainerTransform = _c[0], setCenterContainerTransform = _c[1];
    var _d = react_1.useState(), pinnedContainerWidth = _d[0], setPinnedContainerWidth = _d[1];
    var _e = react_1.useState([]), headerRowCtrls = _e[0], setHeaderRowCtrls = _e[1];
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var eGui = react_1.useRef(null);
    var pinnedLeft = props.pinned === ag_grid_community_1.Constants.PINNED_LEFT;
    var pinnedRight = props.pinned === ag_grid_community_1.Constants.PINNED_RIGHT;
    var centre = !pinnedLeft && !pinnedRight;
    useEffectOnce_1.useEffectOnce(function () {
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setCtrls: function (ctrls) { return setHeaderRowCtrls(ctrls); },
            // centre only
            setCenterWidth: function (width) { return setCenterContainerWidth(width); },
            setContainerTransform: function (transform) { return setCenterContainerTransform(transform); },
            // pinned only
            setPinnedContainerWidth: function (width) { return setPinnedContainerWidth(width); }
        };
        var ctrl = context.createBean(new ag_grid_community_1.HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui.current);
        return function () {
            context.destroyBean(ctrl);
        };
    });
    var className = react_1.useMemo(function () { return cssClasses.toString(); }, [cssClasses]);
    var insertRowsJsx = function () { return headerRowCtrls.map(function (ctrl) { return react_1.default.createElement(headerRowComp_1.default, { ctrl: ctrl, key: ctrl.getInstanceId() }); }); };
    var eCenterContainerStyle = react_1.useMemo(function () { return ({
        width: centerContainerWidth,
        transform: centerContainerTransform
    }); }, [centerContainerWidth, centerContainerTransform]);
    var ePinnedStyle = react_1.useMemo(function () { return ({
        width: pinnedContainerWidth,
        minWidth: pinnedContainerWidth,
        maxWidth: pinnedContainerWidth,
    }); }, [pinnedContainerWidth]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        pinnedLeft &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-pinned-left-header " + className, role: "presentation", style: ePinnedStyle }, insertRowsJsx()),
        pinnedRight &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-pinned-right-header " + className, role: "presentation", style: ePinnedStyle }, insertRowsJsx()),
        centre &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-header-viewport " + className, role: "presentation" },
                react_1.default.createElement("div", { className: "ag-header-container", role: "rowgroup", style: eCenterContainerStyle }, insertRowsJsx()))));
};
exports.default = react_1.memo(HeaderRowContainerComp);
