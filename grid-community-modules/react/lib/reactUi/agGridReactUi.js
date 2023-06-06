// @ag-grid-community/react v30.0.0
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
exports.AgGridReactUi = void 0;
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const newReactComponent_1 = require("../shared/newReactComponent");
const portalManager_1 = require("../shared/portalManager");
const reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
const gridComp_1 = __importDefault(require("./gridComp"));
function debug(msg, obj) {
    // console.log(msg, obj);
}
const AgGridReactUi = (props) => {
    var _a, _b;
    const gridOptionsRef = react_1.useRef(null);
    const eGui = react_1.useRef(null);
    const portalManager = react_1.useRef(null);
    const destroyFuncs = react_1.useRef([]);
    const whenReadyFuncs = react_1.useRef([]);
    //prevProps
    const prevProps = react_1.useRef(props);
    const ready = react_1.useRef(false);
    const [context, setContext] = react_1.useState(undefined);
    const checkForDeprecations = react_1.useCallback((props) => {
        if (props.rowDataChangeDetectionStrategy) {
            core_1._.doOnce(() => console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'), 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }, []);
    // Hook to enable Portals to be displayed via the PortalManager
    const [, setPortalRefresher] = react_1.useState(0);
    react_1.useLayoutEffect(() => {
        const modules = props.modules || [];
        if (!portalManager.current) {
            portalManager.current = new portalManager_1.PortalManager(() => setPortalRefresher((prev) => prev + 1), props.componentWrappingElement, props.maxComponentCreationTimeMs);
            destroyFuncs.current.push(() => {
                portalManager.current.destroy();
                portalManager.current = null;
            });
        }
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current),
            },
            modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides(true),
        };
        gridOptionsRef.current = props.gridOptions || {};
        gridOptionsRef.current = core_1.ComponentUtil.copyAttributesToGridOptions(gridOptionsRef.current, props);
        checkForDeprecations(props);
        const createUiCallback = (context) => {
            setContext(context);
            destroyFuncs.current.push(() => {
                context.destroy();
            });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(core_1.CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi. ctlService is ready');
                if (context.isDestroyed()) {
                    return;
                }
                const api = gridOptionsRef.current.api;
                if (props.setGridApi) {
                    props.setGridApi(api, gridOptionsRef.current.columnApi);
                }
                destroyFuncs.current.push(() => {
                    // Take local reference to api above so correct api gets destroyed on unmount.
                    api.destroy();
                });
            });
        };
        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        const acceptChangesCallback = (context) => {
            const ctrlsService = context.getBean(core_1.CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi.acceptChangesCallback');
                whenReadyFuncs.current.forEach((f) => f());
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };
        const gridCoreCreator = new core_1.GridCoreCreator();
        gridCoreCreator.create(eGui.current, gridOptionsRef.current, createUiCallback, acceptChangesCallback, gridParams);
        return () => {
            debug('AgGridReactUi.destroy');
            destroyFuncs.current.forEach((f) => f());
            destroyFuncs.current.length = 0;
        };
    }, []);
    const style = react_1.useMemo(() => {
        return Object.assign({ height: '100%' }, (props.containerStyle || {}));
    }, [props.containerStyle]);
    const processWhenReady = react_1.useCallback((func) => {
        if (ready.current) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        }
        else {
            debug('AgGridReactUi.processWhenReady async');
            whenReadyFuncs.current.push(func);
        }
    }, []);
    react_1.useEffect(() => {
        const changes = {};
        extractGridPropertyChanges(prevProps.current, props, changes);
        prevProps.current = props;
        processWhenReady(() => core_1.ComponentUtil.processOnChange(changes, gridOptionsRef.current.api));
    }, [props]);
    return (react_1.default.createElement("div", { style: style, className: props.className, ref: eGui },
        context && !context.isDestroyed() ? react_1.default.createElement(gridComp_1.default, { context: context }) : null, (_b = (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.getPortals()) !== null && _b !== void 0 ? _b : null));
};
exports.AgGridReactUi = AgGridReactUi;
class ReactFrameworkComponentWrapper extends core_1.BaseComponentWrapper {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    createWrapper(UserReactComponent, componentType) {
        return new newReactComponent_1.NewReactComponent(UserReactComponent, this.parent, componentType);
    }
}
function extractGridPropertyChanges(prevProps, nextProps, changes) {
    const debugLogging = !!nextProps.debug;
    Object.keys(nextProps).forEach((propKey) => {
        if (core_1.ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
            if (prevProps[propKey] !== nextProps[propKey]) {
                if (debugLogging) {
                    console.log(` agGridReact: [${propKey}] property changed`);
                }
                changes[propKey] = {
                    previousValue: prevProps[propKey],
                    currentValue: nextProps[propKey],
                };
            }
        }
    });
    core_1.ComponentUtil.EVENT_CALLBACKS.forEach((funcName) => {
        if (prevProps[funcName] !== nextProps[funcName]) {
            if (debugLogging) {
                console.log(`agGridReact: [${funcName}] event callback changed`);
            }
            changes[funcName] = {
                previousValue: prevProps[funcName],
                currentValue: nextProps[funcName],
            };
        }
    });
}

//# sourceMappingURL=agGridReactUi.js.map
