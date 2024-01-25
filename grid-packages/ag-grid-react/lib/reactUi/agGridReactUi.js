// ag-grid-react v31.0.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgGridReactUi = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var dateComponentWrapper_1 = require("../shared/customComp/dateComponentWrapper");
var filterComponentWrapper_1 = require("../shared/customComp/filterComponentWrapper");
var floatingFilterComponentWrapper_1 = require("../shared/customComp/floatingFilterComponentWrapper");
var loadingOverlayComponentWrapper_1 = require("../shared/customComp/loadingOverlayComponentWrapper");
var noRowsOverlayComponentWrapper_1 = require("../shared/customComp/noRowsOverlayComponentWrapper");
var statusPanelComponentWrapper_1 = require("../shared/customComp/statusPanelComponentWrapper");
var toolPanelComponentWrapper_1 = require("../shared/customComp/toolPanelComponentWrapper");
var reactComponent_1 = require("../shared/reactComponent");
var portalManager_1 = require("../shared/portalManager");
var beansContext_1 = require("./beansContext");
var utils_1 = require("./utils");
var groupCellRenderer_1 = __importDefault(require("../reactUi/cellRenderer/groupCellRenderer"));
var gridComp_1 = __importDefault(require("./gridComp"));
var AgGridReactUi = function (props) {
    var _a, _b;
    var apiRef = react_1.useRef();
    var eGui = react_1.useRef(null);
    var portalManager = react_1.useRef(null);
    var destroyFuncs = react_1.useRef([]);
    var whenReadyFuncs = react_1.useRef([]);
    var prevProps = react_1.useRef(props);
    var ready = react_1.useRef(false);
    var _c = react_1.useState(undefined), context = _c[0], setContext = _c[1];
    // Hook to enable Portals to be displayed via the PortalManager
    var _d = react_1.useState(0), setPortalRefresher = _d[1];
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            destroyFuncs.current.forEach(function (f) { return f(); });
            destroyFuncs.current.length = 0;
            return;
        }
        var modules = props.modules || [];
        if (!portalManager.current) {
            portalManager.current = new portalManager_1.PortalManager(function () { return setPortalRefresher(function (prev) { return prev + 1; }); }, props.componentWrappingElement, props.maxComponentCreationTimeMs);
            destroyFuncs.current.push(function () {
                var _a;
                (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.destroy();
                portalManager.current = null;
            });
        }
        var mergedGridOps = ag_grid_community_1.ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);
        var gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current, !!mergedGridOps.reactiveCustomComponents),
            },
            modules: modules,
            frameworkOverrides: new ReactFrameworkOverrides(),
        };
        var createUiCallback = function (context) {
            setContext(context);
            destroyFuncs.current.push(function () {
                context.destroy();
            });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            var ctrlsService = context.getBean(ag_grid_community_1.CtrlsService.NAME);
            ctrlsService.whenReady(function () {
                if (context.isDestroyed()) {
                    return;
                }
                var api = apiRef.current;
                if (api) {
                    if (props.setGridApi) {
                        props.setGridApi(api, new ag_grid_community_1.ColumnApi(api));
                    }
                }
            });
        };
        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        var acceptChangesCallback = function (context) {
            var ctrlsService = context.getBean(ag_grid_community_1.CtrlsService.NAME);
            ctrlsService.whenReady(function () {
                whenReadyFuncs.current.forEach(function (f) { return f(); });
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };
        var gridCoreCreator = new ag_grid_community_1.GridCoreCreator();
        apiRef.current = gridCoreCreator.create(eGui.current, mergedGridOps, createUiCallback, acceptChangesCallback, gridParams);
    }, []);
    var style = react_1.useMemo(function () {
        return __assign({ height: '100%' }, (props.containerStyle || {}));
    }, [props.containerStyle]);
    var processWhenReady = react_1.useCallback(function (func) {
        if (ready.current) {
            func();
        }
        else {
            whenReadyFuncs.current.push(func);
        }
    }, []);
    react_1.useEffect(function () {
        var changes = extractGridPropertyChanges(prevProps.current, props);
        prevProps.current = props;
        processWhenReady(function () {
            if (apiRef.current) {
                ag_grid_community_1.ComponentUtil.processOnChange(changes, apiRef.current);
            }
        });
    }, [props]);
    return (react_1.default.createElement("div", { style: style, className: props.className, ref: setRef },
        context && !context.isDestroyed() ? react_1.default.createElement(gridComp_1.default, { context: context }) : null, (_b = (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.getPortals()) !== null && _b !== void 0 ? _b : null));
};
exports.AgGridReactUi = AgGridReactUi;
function extractGridPropertyChanges(prevProps, nextProps) {
    var changes = {};
    Object.keys(nextProps).forEach(function (propKey) {
        var propValue = nextProps[propKey];
        if (prevProps[propKey] !== propValue) {
            changes[propKey] = propValue;
        }
    });
    return changes;
}
var ReactFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper(parent, reactiveCustomComponents) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.reactiveCustomComponents = reactiveCustomComponents;
        return _this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (UserReactComponent, componentType) {
        if (this.reactiveCustomComponents) {
            var getComponentClass = function (propertyName) {
                switch (propertyName) {
                    case 'filter':
                        return filterComponentWrapper_1.FilterComponentWrapper;
                    case 'floatingFilterComponent':
                        return floatingFilterComponentWrapper_1.FloatingFilterComponentWrapper;
                    case 'dateComponent':
                        return dateComponentWrapper_1.DateComponentWrapper;
                    case 'loadingOverlayComponent':
                        return loadingOverlayComponentWrapper_1.LoadingOverlayComponentWrapper;
                    case 'noRowsOverlayComponent':
                        return noRowsOverlayComponentWrapper_1.NoRowsOverlayComponentWrapper;
                    case 'statusPanel':
                        return statusPanelComponentWrapper_1.StatusPanelComponentWrapper;
                    case 'toolPanel':
                        return toolPanelComponentWrapper_1.ToolPanelComponentWrapper;
                }
            };
            var ComponentClass = getComponentClass(componentType.propertyName);
            if (ComponentClass) {
                return new ComponentClass(UserReactComponent, this.parent, componentType);
            }
        }
        // only cell renderers and tool panel should use fallback methods
        var suppressFallbackMethods = !componentType.cellRenderer && componentType.propertyName !== 'toolPanel';
        return new reactComponent_1.ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
// Define DetailCellRenderer and ReactFrameworkOverrides here to avoid circular dependency
var DetailCellRenderer = react_1.forwardRef(function (props, ref) {
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
        ag_grid_community_1._.warnOnce('detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/');
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
        if (gridOptionsService.get('detailRowAutoHeight')) {
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
        react_1.default.createElement(exports.AgGridReactUi, __assign({ className: gridClassName }, detailGridOptions, { modules: parentModules, rowData: detailRowData, setGridApi: setGridApi }))));
});
var ReactFrameworkOverrides = /** @class */ (function (_super) {
    __extends(ReactFrameworkOverrides, _super);
    function ReactFrameworkOverrides() {
        var _this = _super.call(this, 'react') || this;
        _this.frameworkComponents = {
            agGroupCellRenderer: groupCellRenderer_1.default,
            agGroupRowRenderer: groupCellRenderer_1.default,
            agDetailCellRenderer: DetailCellRenderer
        };
        _this.renderingEngine = 'react';
        return _this;
    }
    ReactFrameworkOverrides.prototype.frameworkComponent = function (name) {
        return this.frameworkComponents[name];
    };
    ReactFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
        if (!comp) {
            return false;
        }
        var prototype = comp.prototype;
        var isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    };
    return ReactFrameworkOverrides;
}(ag_grid_community_1.VanillaFrameworkOverrides));
