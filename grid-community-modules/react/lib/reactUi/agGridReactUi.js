// @ag-grid-community/react v29.2.0
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
const gridComp_1 = __importDefault(require("./gridComp"));
const reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
function debug(msg, obj) {
    // console.log(msg, obj);
}
class AgGridReactUi extends react_1.Component {
    // Would like props to be of type AgReactUiProps<TData> but currently breaks build
    constructor(props) {
        super(props);
        this.props = props;
        this.destroyFuncs = [];
        this.eGui = react_1.default.createRef();
        this.whenReadyFuncs = [];
        this.ready = false;
        this.renderedAfterMount = false;
        this.mounted = false;
        debug('AgGridReactUi.constructor');
        this.state = { context: undefined };
        this.portalManager = new portalManager_1.PortalManager(this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
        this.destroyFuncs.push(() => this.portalManager.destroy());
    }
    render() {
        debug('AgGridReactUi.render, context = ' + (this.state.context));
        if (this.state.context) {
            this.renderedAfterMount = true;
        }
        return (react_1.default.createElement("div", { style: this.createStyleForDiv(), className: this.props.className, ref: this.eGui },
            this.state.context && react_1.default.createElement(gridComp_1.default, { context: this.state.context }),
            this.portalManager.getPortals()));
    }
    createStyleForDiv() {
        return Object.assign({ height: '100%' }, (this.props.containerStyle || {}));
    }
    componentDidMount() {
        if (this.mounted) {
            debug('AgGridReactUi.componentDidMount - skipping');
            return;
        }
        debug('AgGridReactUi.componentDidMount');
        this.mounted = true;
        const modules = this.props.modules || [];
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this.portalManager)
            },
            modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides(true)
        };
        this.gridOptions = this.props.gridOptions || {};
        this.gridOptions = core_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this.props);
        this.checkForDeprecations(this.props);
        const createUiCallback = (context) => {
            this.setState({ context: context });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(core_1.CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi.createUiCallback');
                this.api = this.gridOptions.api;
                this.columnApi = this.gridOptions.columnApi;
                this.props.setGridApi(this.api, this.columnApi);
                this.destroyFuncs.push(() => this.api.destroy());
            });
        };
        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        const acceptChangesCallback = (context) => {
            const ctrlsService = context.getBean(core_1.CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi.acceptChangesCallback');
                this.whenReadyFuncs.forEach(f => f());
                this.whenReadyFuncs.length = 0;
                this.ready = true;
            });
        };
        // don't need the return value
        const gridCoreCreator = new core_1.GridCoreCreator();
        gridCoreCreator.create(this.eGui.current, this.gridOptions, createUiCallback, acceptChangesCallback, gridParams);
    }
    checkForDeprecations(props) {
        if (props.rowDataChangeDetectionStrategy) {
            core_1._.doOnce(() => console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'), 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }
    componentWillUnmount() {
        if (this.renderedAfterMount) {
            debug('AgGridReactUi.componentWillUnmount - executing');
            this.destroyFuncs.forEach(f => f());
            this.destroyFuncs.length = 0;
        }
        else {
            debug('AgGridReactUi.componentWillUnmount - skipping');
        }
    }
    componentDidUpdate(prevProps) {
        this.processPropsChanges(prevProps, this.props);
    }
    processPropsChanges(prevProps, nextProps) {
        const changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.processChanges(changes);
    }
    extractGridPropertyChanges(prevProps, nextProps, changes) {
        const debugLogging = !!nextProps.debug;
        Object.keys(nextProps).forEach(propKey => {
            if (core_1.ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
                if (prevProps[propKey] !== nextProps[propKey]) {
                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }
                    changes[propKey] = {
                        previousValue: prevProps[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        core_1.ComponentUtil.EVENT_CALLBACKS.forEach(funcName => {
            if (prevProps[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }
                changes[funcName] = {
                    previousValue: prevProps[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
    }
    processChanges(changes) {
        this.processWhenReady(() => core_1.ComponentUtil.processOnChange(changes, this.api));
    }
    processWhenReady(func) {
        if (this.ready) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        }
        else {
            debug('AgGridReactUi.processWhenReady async');
            this.whenReadyFuncs.push(func);
        }
    }
}
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

//# sourceMappingURL=agGridReactUi.js.map
