// ag-grid-react v30.2.1
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
var newReactComponent_1 = require("../shared/newReactComponent");
var portalManager_1 = require("../shared/portalManager");
var reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
var gridComp_1 = __importDefault(require("./gridComp"));
function debug(msg, obj) {
    // console.log(msg, obj);
}
var AgGridReactUi = function (props) {
    var _a, _b;
    var gridOptionsRef = react_1.useRef(null);
    var eGui = react_1.useRef(null);
    var portalManager = react_1.useRef(null);
    var destroyFuncs = react_1.useRef([]);
    var whenReadyFuncs = react_1.useRef([]);
    //prevProps
    var prevProps = react_1.useRef(props);
    var ready = react_1.useRef(false);
    var _c = react_1.useState(undefined), context = _c[0], setContext = _c[1];
    var checkForDeprecations = react_1.useCallback(function (props) {
        if (props.rowDataChangeDetectionStrategy) {
            ag_grid_community_1._.doOnce(function () {
                return console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/');
            }, 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }, []);
    // Hook to enable Portals to be displayed via the PortalManager
    var _d = react_1.useState(0), setPortalRefresher = _d[1];
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            debug('AgGridReactUi.destroy');
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
        var gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current),
            },
            modules: modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides(true),
        };
        gridOptionsRef.current = props.gridOptions || {};
        gridOptionsRef.current = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(gridOptionsRef.current, props);
        checkForDeprecations(props);
        var createUiCallback = function (context) {
            setContext(context);
            destroyFuncs.current.push(function () {
                context.destroy();
            });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            var ctrlsService = context.getBean(ag_grid_community_1.CtrlsService.NAME);
            ctrlsService.whenReady(function () {
                debug('AgGridReactUi. ctlService is ready');
                if (context.isDestroyed()) {
                    return;
                }
                if (gridOptionsRef.current) {
                    var api = gridOptionsRef.current.api;
                    if (api) {
                        if (props.setGridApi) {
                            props.setGridApi(api, gridOptionsRef.current.columnApi);
                        }
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
                debug('AgGridReactUi.acceptChangesCallback');
                whenReadyFuncs.current.forEach(function (f) { return f(); });
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };
        var gridCoreCreator = new ag_grid_community_1.GridCoreCreator();
        gridCoreCreator.create(eGui.current, gridOptionsRef.current, createUiCallback, acceptChangesCallback, gridParams);
    }, []);
    var style = react_1.useMemo(function () {
        return __assign({ height: '100%' }, (props.containerStyle || {}));
    }, [props.containerStyle]);
    var processWhenReady = react_1.useCallback(function (func) {
        if (ready.current) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        }
        else {
            debug('AgGridReactUi.processWhenReady async');
            whenReadyFuncs.current.push(func);
        }
    }, []);
    react_1.useEffect(function () {
        var changes = {};
        extractGridPropertyChanges(prevProps.current, props, changes);
        prevProps.current = props;
        processWhenReady(function () {
            var _a;
            if ((_a = gridOptionsRef.current) === null || _a === void 0 ? void 0 : _a.api) {
                ag_grid_community_1.ComponentUtil.processOnChange(changes, gridOptionsRef.current.api);
            }
        });
    }, [props]);
    return (react_1.default.createElement("div", { style: style, className: props.className, ref: setRef },
        context && !context.isDestroyed() ? react_1.default.createElement(gridComp_1.default, { context: context }) : null, (_b = (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.getPortals()) !== null && _b !== void 0 ? _b : null));
};
exports.AgGridReactUi = AgGridReactUi;
var ReactFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (UserReactComponent, componentType) {
        return new newReactComponent_1.NewReactComponent(UserReactComponent, this.parent, componentType);
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
function extractGridPropertyChanges(prevProps, nextProps, changes) {
    var debugLogging = !!nextProps.debug;
    Object.keys(nextProps).forEach(function (propKey) {
        if (ag_grid_community_1.ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
            if (prevProps[propKey] !== nextProps[propKey]) {
                if (debugLogging) {
                    console.log(" agGridReact: [" + propKey + "] property changed");
                }
                changes[propKey] = {
                    previousValue: prevProps[propKey],
                    currentValue: nextProps[propKey],
                };
            }
        }
    });
    ag_grid_community_1.ComponentUtil.EVENT_CALLBACKS.forEach(function (funcName) {
        if (prevProps[funcName] !== nextProps[funcName]) {
            if (debugLogging) {
                console.log("agGridReact: [" + funcName + "] event callback changed");
            }
            changes[funcName] = {
                previousValue: prevProps[funcName],
                currentValue: nextProps[funcName],
            };
        }
    });
}
