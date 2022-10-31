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
var utils_1 = require("../utils");
var beansContext_1 = require("../beansContext");
var agGridReactUi_1 = require("../agGridReactUi");
var useEffectOnce_1 = require("../useEffectOnce");
var DetailCellRenderer = function (props, ref) {
    var _a = react_1.useContext(beansContext_1.BeansContext), ctrlsFactory = _a.ctrlsFactory, context = _a.context, gridOptionsWrapper = _a.gridOptionsWrapper, resizeObserverService = _a.resizeObserverService, clientSideRowModel = _a.clientSideRowModel, serverSideRowModel = _a.serverSideRowModel;
    var _b = react_1.useState(new utils_1.CssClasses()), cssClasses = _b[0], setCssClasses = _b[1];
    var _c = react_1.useState(new utils_1.CssClasses()), gridCssClasses = _c[0], setGridCssClasses = _c[1];
    var _d = react_1.useState(), detailGridOptions = _d[0], setDetailGridOptions = _d[1];
    var _e = react_1.useState(), detailRowData = _e[0], setDetailRowData = _e[1];
    var ctrlRef = react_1.useRef();
    var eGuiRef = react_1.useRef(null);
    var topClassName = react_1.useMemo(function () { return cssClasses.toString() + ' ag-details-row'; }, [cssClasses]);
    var gridClassName = react_1.useMemo(function () { return gridCssClasses.toString() + ' ag-details-grid'; }, [gridCssClasses]);
    if (ref) {
        react_1.useImperativeHandle(ref, function () { return ({
            refresh: function () { return ctrlRef.current.refresh(); }
        }); });
    }
    useEffectOnce_1.useEffectOnce(function () {
        if (props.template && typeof props.template === 'string') {
            console.warn('AG Grid: detailCellRendererParams.template is not supported by React - this only works with frameworks that work against String templates. To change the template, please provide your own React Detail Cell Renderer.');
        }
    });
    useEffectOnce_1.useEffectOnce(function () {
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
        var resizeObserverDestroyFunc;
        if (gridOptionsWrapper.isDetailRowAutoHeight()) {
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
            resizeObserverDestroyFunc = resizeObserverService.observeResize(eGuiRef.current, checkRowSizeFunc);
            checkRowSizeFunc();
        }
        return function () {
            context.destroyBean(ctrl);
            if (resizeObserverDestroyFunc) {
                resizeObserverDestroyFunc();
            }
        };
    });
    var setGridApi = react_1.useCallback(function (api, columnApi) {
        ctrlRef.current.registerDetailWithMaster(api, columnApi);
    }, []);
    return (react_1.default.createElement("div", { className: topClassName, ref: eGuiRef }, detailGridOptions &&
        react_1.default.createElement(agGridReactUi_1.AgGridReactUi, __assign({ className: gridClassName }, detailGridOptions, { rowData: detailRowData, setGridApi: setGridApi }))));
};
exports.default = react_1.forwardRef(DetailCellRenderer);
