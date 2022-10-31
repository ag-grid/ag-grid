// ag-grid-react v28.2.1
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var utils_1 = require("../utils");
var reactComment_1 = __importDefault(require("../reactComment"));
var rowComp_1 = __importDefault(require("./rowComp"));
var beansContext_1 = require("../beansContext");
var useEffectOnce_1 = require("../useEffectOnce");
var RowContainerComp = function (params) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var _a = react_1.useState(''), viewportHeight = _a[0], setViewportHeight = _a[1];
    var _b = react_1.useState([]), rowCtrlsOrdered = _b[0], setRowCtrlsOrdered = _b[1];
    var _c = react_1.useState([]), rowCtrls = _c[0], setRowCtrls = _c[1];
    var _d = react_1.useState(false), domOrder = _d[0], setDomOrder = _d[1];
    var _e = react_1.useState(''), containerWidth = _e[0], setContainerWidth = _e[1];
    var name = params.name;
    var containerType = react_1.useMemo(function () { return ag_grid_community_1.getRowContainerTypeForName(name); }, [name]);
    var eWrapper = react_1.useRef(null);
    var eViewport = react_1.useRef(null);
    var eContainer = react_1.useRef(null);
    var cssClasses = react_1.useMemo(function () { return ag_grid_community_1.RowContainerCtrl.getRowContainerCssClasses(name); }, [name]);
    var wrapperClasses = react_1.useMemo(function () { return utils_1.classesList(cssClasses.wrapper); }, []);
    var viewportClasses = react_1.useMemo(function () { return utils_1.classesList(cssClasses.viewport); }, []);
    var containerClasses = react_1.useMemo(function () { return utils_1.classesList(cssClasses.container); }, []);
    // no need to useMemo for boolean types
    var template1 = name === ag_grid_community_1.RowContainerName.CENTER;
    var template2 = name === ag_grid_community_1.RowContainerName.TOP_CENTER
        || name === ag_grid_community_1.RowContainerName.BOTTOM_CENTER
        || name === ag_grid_community_1.RowContainerName.STICKY_TOP_CENTER;
    var template3 = !template1 && !template2;
    var topLevelRef = template1 ? eWrapper : template2 ? eViewport : eContainer;
    reactComment_1.default(' AG Row Container ' + name + ' ', topLevelRef);
    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    react_1.useEffect(function () {
        setRowCtrlsOrdered(function (prev) {
            if (domOrder) {
                return rowCtrls;
            }
            // if dom order not important, we don't want to change the order
            // of the elements in the dom, as this would break transition styles
            var oldRows = prev.filter(function (r) { return rowCtrls.indexOf(r) >= 0; });
            var newRows = rowCtrls.filter(function (r) { return oldRows.indexOf(r) < 0; });
            var next = __spreadArrays(oldRows, newRows);
            return next;
        });
    }, [domOrder, rowCtrls]);
    useEffectOnce_1.useEffectOnce(function () {
        var beansToDestroy = [];
        var compProxy = {
            setViewportHeight: setViewportHeight,
            setRowCtrls: function (rowCtrls) { return setRowCtrls(rowCtrls); },
            setDomOrder: function (domOrder) { return setDomOrder(domOrder); },
            setContainerWidth: function (width) { return setContainerWidth(width); }
        };
        var ctrl = context.createBean(new ag_grid_community_1.RowContainerCtrl(name));
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eContainer.current, eViewport.current, eWrapper.current);
        return function () {
            context.destroyBeans(beansToDestroy);
        };
    });
    var viewportStyle = react_1.useMemo(function () { return ({
        height: viewportHeight
    }); }, [viewportHeight]);
    var containerStyle = react_1.useMemo(function () { return ({
        width: containerWidth
    }); }, [containerWidth]);
    var buildContainer = function () { return (react_1.default.createElement("div", { className: containerClasses, ref: eContainer, role: rowCtrls.length ? "rowgroup" : "presentation", style: containerStyle }, rowCtrlsOrdered.map(function (rowCtrl) { return react_1.default.createElement(rowComp_1.default, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() }); }))); };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        template1 &&
            react_1.default.createElement("div", { className: wrapperClasses, ref: eWrapper, role: "presentation" },
                react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation", style: viewportStyle }, buildContainer())),
        template2 &&
            react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation", style: viewportStyle }, buildContainer()),
        template3 && buildContainer()));
};
exports.default = react_1.memo(RowContainerComp);
