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
var headerRowContainerComp_1 = __importDefault(require("./headerRowContainerComp"));
var useEffectOnce_1 = require("../useEffectOnce");
var GridHeaderComp = function () {
    var _a = react_1.useState(new utils_1.CssClasses()), cssClasses = _a[0], setCssClasses = _a[1];
    var _b = react_1.useState(), height = _b[0], setHeight = _b[1];
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var eGui = react_1.useRef(null);
    useEffectOnce_1.useEffectOnce(function () {
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setHeightAndMinHeight: function (height) { return setHeight(height); }
        };
        var ctrl = context.createBean(new ag_grid_community_1.GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui.current, eGui.current);
        return function () {
            context.destroyBean(ctrl);
        };
    });
    var className = react_1.useMemo(function () {
        var res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);
    var style = react_1.useMemo(function () { return ({
        height: height,
        minHeight: height
    }); }, [height]);
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, role: "presentation" },
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: ag_grid_community_1.Constants.PINNED_LEFT }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: null }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: ag_grid_community_1.Constants.PINNED_RIGHT })));
};
exports.default = react_1.memo(GridHeaderComp);
