// ag-grid-react v30.2.1
"use strict";
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
var RowContainerComp = function (params) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var name = params.name;
    var containerType = react_1.useMemo(function () { return ag_grid_community_1.getRowContainerTypeForName(name); }, [name]);
    var eViewport = react_1.useRef(null);
    var eContainer = react_1.useRef(null);
    var rowCtrlsRef = react_1.useRef([]);
    var _a = react_1.useState(function () { return []; }), rowCtrlsOrdered = _a[0], setRowCtrlsOrdered = _a[1];
    var domOrderRef = react_1.useRef(false);
    var rowContainerCtrlRef = react_1.useRef();
    var cssClasses = react_1.useMemo(function () { return ag_grid_community_1.RowContainerCtrl.getRowContainerCssClasses(name); }, [name]);
    var viewportClasses = react_1.useMemo(function () { return utils_1.classesList(cssClasses.viewport); }, [cssClasses]);
    var containerClasses = react_1.useMemo(function () { return utils_1.classesList(cssClasses.container); }, [cssClasses]);
    // no need to useMemo for boolean types
    var centerTemplate = name === ag_grid_community_1.RowContainerName.CENTER
        || name === ag_grid_community_1.RowContainerName.TOP_CENTER
        || name === ag_grid_community_1.RowContainerName.BOTTOM_CENTER
        || name === ag_grid_community_1.RowContainerName.STICKY_TOP_CENTER;
    var topLevelRef = centerTemplate ? eViewport : eContainer;
    reactComment_1.default(' AG Row Container ' + name + ' ', topLevelRef);
    var areElementsReady = react_1.useCallback(function () {
        if (centerTemplate) {
            return eViewport.current != null && eContainer.current != null;
        }
        return eContainer.current != null;
    }, []);
    var areElementsRemoved = react_1.useCallback(function () {
        if (centerTemplate) {
            return eViewport.current == null && eContainer.current == null;
        }
        return eContainer.current == null;
    }, []);
    var setRef = react_1.useCallback(function () {
        if (areElementsRemoved()) {
            context.destroyBean(rowContainerCtrlRef.current);
            rowContainerCtrlRef.current = null;
        }
        if (areElementsReady()) {
            var updateRowCtrlsOrdered_1 = function (useFlushSync) {
                utils_1.agFlushSync(useFlushSync, function () {
                    setRowCtrlsOrdered(function (prev) { return utils_1.getNextValueIfDifferent(prev, rowCtrlsRef.current, domOrderRef.current); });
                });
            };
            var compProxy = {
                setViewportHeight: function (height) {
                    if (eViewport.current) {
                        eViewport.current.style.height = height;
                    }
                },
                setRowCtrls: function (rowCtrls, useFlushSync) {
                    var useFlush = useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    // Keep a record of the rowCtrls in case we need to reset the Dom order.
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered_1(useFlush);
                },
                setDomOrder: function (domOrder) {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered_1(false);
                    }
                },
                setContainerWidth: function (width) {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                }
            };
            rowContainerCtrlRef.current = context.createBean(new ag_grid_community_1.RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current, eViewport.current);
        }
    }, [areElementsReady, areElementsRemoved]);
    var setContainerRef = react_1.useCallback(function (e) { eContainer.current = e; setRef(); }, [setRef]);
    var setViewportRef = react_1.useCallback(function (e) { eViewport.current = e; setRef(); }, [setRef]);
    var buildContainer = function () { return (react_1.default.createElement("div", { className: containerClasses, ref: setContainerRef, role: rowCtrlsOrdered.length ? "rowgroup" : "presentation" }, rowCtrlsOrdered.map(function (rowCtrl) {
        return react_1.default.createElement(rowComp_1.default, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() });
    }))); };
    return (react_1.default.createElement(react_1.default.Fragment, null, centerTemplate ?
        react_1.default.createElement("div", { className: viewportClasses, ref: setViewportRef, role: "presentation" }, buildContainer()) :
        buildContainer()));
};
exports.default = react_1.memo(RowContainerComp);
