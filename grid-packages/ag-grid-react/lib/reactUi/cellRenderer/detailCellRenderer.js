// ag-grid-react v30.2.1
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
var utils_1 = require("../utils");
var ag_grid_community_1 = require("ag-grid-community");
var beansContext_1 = require("../beansContext");
var agGridReactUi_1 = require("../agGridReactUi");
var DetailCellRenderer = function (props, ref) {
    var _a = react_1.useContext(beansContext_1.BeansContext), ctrlsFactory = _a.ctrlsFactory, context = _a.context, gridOptionsService = _a.gridOptionsService, resizeObserverService = _a.resizeObserverService, clientSideRowModel = _a.clientSideRowModel, serverSideRowModel = _a.serverSideRowModel;
    var _b = react_1.useState(function () { return new utils_1.CssClasses(); }), cssClasses = _b[0], setCssClasses = _b[1];
    var _c = react_1.useState(function () { return new utils_1.CssClasses(); }), gridCssClasses = _c[0], setGridCssClasses = _c[1];
    var _d = react_1.useState(), detailGridOptions = _d[0], setDetailGridOptions = _d[1];
    var _e = react_1.useState(), detailRowData = _e[0], setDetailRowData = _e[1];
    var ctrlRef = react_1.useRef();
    var eGuiRef = react_1.useRef(null);
    var resizeObserverDestroyFunc = react_1.useRef();
    var parentModules = react_1.useMemo(function () { return ag_grid_community_1.ModuleRegistry.__getGridRegisteredModules(props.api.getGridId()); }, [props]);
    var topClassName = react_1.useMemo(function () { return cssClasses.toString() + ' ag-details-row'; }, [cssClasses]);
    var gridClassName = react_1.useMemo(function () { return gridCssClasses.toString() + ' ag-details-grid'; }, [gridCssClasses]);
    if (ref) {
        react_1.useImperativeHandle(ref, function () { return ({
            refresh: function () { var _a, _b; return (_b = (_a = ctrlRef.current) === null || _a === void 0 ? void 0 : _a.refresh()) !== null && _b !== void 0 ? _b : false; }
        }); });
    }
    if (props.template) {
        ag_grid_community_1._.doOnce(function () { return console.warn('AG Grid: detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/'); }, "React_detailCellRenderer.template");
    }
    var setRef = react_1.useCallback(function (e) {
        eGuiRef.current = e;
        if (!eGuiRef.current) {
            context.destroyBean(ctrlRef.current);
            if (resizeObserverDestroyFunc.current) {
                resizeObserverDestroyFunc.current();
            }
            return;
        }
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            addOrRemoveDetailGridCssClass: function (name, on) { return setGridCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setDetailGrid: function (gridOptions) { return setDetailGridOptions(gridOptions); },
            setRowData: function (rowData) { return setDetailRowData(rowData); },
            getGui: function () { return eGuiRef.current; }
        };
        var ctrl = ctrlsFactory.getInstance('detailCellRenderer');
        if (!ctrl) {
            return;
        } // should never happen, means master/detail module not loaded
        context.createBean(ctrl);
        ctrl.init(compProxy, props);
        ctrlRef.current = ctrl;
        if (gridOptionsService.is('detailRowAutoHeight')) {
            var checkRowSizeFunc = function () {
                // when disposed, current is null, so nothing to do, and the resize observer will
                // be disposed of soon
                if (eGuiRef.current == null) {
                    return;
                }
                var clientHeight = eGuiRef.current.clientHeight;
                // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
                // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
                // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
                // empty detail grid would still have some styling around it giving at least a few pixels.
                if (clientHeight != null && clientHeight > 0) {
                    // we do the update in a timeout, to make sure we are not calling from inside the grid
                    // doing another update
                    var updateRowHeightFunc = function () {
                        props.node.setRowHeight(clientHeight);
                        if (clientSideRowModel) {
                            clientSideRowModel.onRowHeightChanged();
                        }
                        else if (serverSideRowModel) {
                            serverSideRowModel.onRowHeightChanged();
                        }
                    };
                    setTimeout(updateRowHeightFunc, 0);
                }
            };
            resizeObserverDestroyFunc.current = resizeObserverService.observeResize(eGuiRef.current, checkRowSizeFunc);
            checkRowSizeFunc();
        }
    }, []);
    var setGridApi = react_1.useCallback(function (api, columnApi) {
        var _a;
        (_a = ctrlRef.current) === null || _a === void 0 ? void 0 : _a.registerDetailWithMaster(api, columnApi);
    }, []);
    return (react_1.default.createElement("div", { className: topClassName, ref: setRef }, detailGridOptions &&
        react_1.default.createElement(agGridReactUi_1.AgGridReactUi, __assign({ className: gridClassName }, detailGridOptions, { modules: parentModules, rowData: detailRowData, setGridApi: setGridApi }))));
};
exports.default = react_1.forwardRef(DetailCellRenderer);
