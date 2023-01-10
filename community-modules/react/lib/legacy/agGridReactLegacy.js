// @ag-grid-community/react v29.0.0
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
exports.AgGridReactLegacy = void 0;
const core_1 = require("@ag-grid-community/core");
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importStar(require("react"));
const legacyReactComponent_1 = require("./legacyReactComponent");
const newReactComponent_1 = require("../shared/newReactComponent");
const portalManager_1 = require("../shared/portalManager");
const reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
class AgGridReactLegacy extends react_1.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.api = null;
        this.destroyed = false;
        this.SYNCHRONOUS_CHANGE_PROPERTIES = ['context'];
        this.portalManager = new portalManager_1.PortalManager(this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
    }
    render() {
        return react_1.default.createElement('div', {
            style: this.createStyleForDiv(),
            className: this.props.className,
            ref: (e) => {
                this.eGridDiv = e;
            }
        }, this.portalManager.getPortals());
    }
    createStyleForDiv() {
        return Object.assign({ height: '100%' }, (this.props.containerStyle || {}));
    }
    componentDidMount() {
        const modules = this.props.modules || [];
        const gridParams = {
            providedBeanInstances: {
                agGridReact: this,
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this, this.portalManager)
            },
            modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides(false)
        };
        const gridOptions = this.props.gridOptions || {};
        this.gridOptions = core_1.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        this.checkForDeprecations(this.props);
        // don't need the return value
        new core_1.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    }
    checkForDeprecations(props) {
        if (props.rowDataChangeDetectionStrategy) {
            core_1._.doOnce(() => console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'), 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }
    shouldComponentUpdate(nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as AG Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }
    componentDidUpdate(prevProps) {
        this.processPropsChanges(prevProps, this.props);
    }
    processPropsChanges(prevProps, nextProps) {
        const changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
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
    componentWillUnmount() {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }
        this.destroyed = true;
        this.portalManager.destroy();
    }
    isDisableStaticMarkup() {
        return this.props.disableStaticMarkup === true;
    }
    isLegacyComponentRendering() {
        return this.props.legacyComponentRendering === true;
    }
    processSynchronousChanges(changes) {
        const asyncChanges = Object.assign({}, changes);
        if (Object.keys(asyncChanges).length > 0) {
            const synchronousChanges = {};
            this.SYNCHRONOUS_CHANGE_PROPERTIES.forEach((synchronousChangeProperty) => {
                if (asyncChanges[synchronousChangeProperty]) {
                    synchronousChanges[synchronousChangeProperty] = asyncChanges[synchronousChangeProperty];
                    delete asyncChanges[synchronousChangeProperty];
                }
            });
            if (Object.keys(synchronousChanges).length > 0 && !!this.api) {
                core_1.ComponentUtil.processOnChange(synchronousChanges, this.api);
            }
        }
        return asyncChanges;
    }
    processAsynchronousChanges(changes) {
        if (Object.keys(changes).length > 0) {
            window.setTimeout(() => {
                // destroyed?
                if (this.api) {
                    core_1.ComponentUtil.processOnChange(changes, this.api);
                }
            });
        }
    }
}
exports.AgGridReactLegacy = AgGridReactLegacy;
AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component
AgGridReactLegacy.defaultProps = {
    legacyComponentRendering: false,
    disableStaticMarkup: false,
    maxComponentCreationTimeMs: AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS
};
AgGridReactLegacy.propTypes = {
    gridOptions: prop_types_1.default.object
};
addProperties(core_1.ComponentUtil.EVENT_CALLBACKS, prop_types_1.default.func);
addProperties(core_1.ComponentUtil.BOOLEAN_PROPERTIES, prop_types_1.default.bool);
addProperties(core_1.ComponentUtil.STRING_PROPERTIES, prop_types_1.default.string);
addProperties(core_1.ComponentUtil.OBJECT_PROPERTIES, prop_types_1.default.object);
addProperties(core_1.ComponentUtil.ARRAY_PROPERTIES, prop_types_1.default.array);
addProperties(core_1.ComponentUtil.NUMBER_PROPERTIES, prop_types_1.default.number);
addProperties(core_1.ComponentUtil.FUNCTION_PROPERTIES, prop_types_1.default.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(propKey => {
        AgGridReactLegacy[propKey] = propType;
    });
}
class ReactFrameworkComponentWrapper extends core_1.BaseComponentWrapper {
    constructor(agGridReact, portalManager) {
        super();
        this.agGridReact = agGridReact;
        this.portalManager = portalManager;
    }
    createWrapper(UserReactComponent, componentType) {
        if (this.agGridReact.isLegacyComponentRendering()) {
            return new legacyReactComponent_1.LegacyReactComponent(UserReactComponent, this.agGridReact, this.portalManager, componentType);
        }
        else {
            return new newReactComponent_1.NewReactComponent(UserReactComponent, this.portalManager, componentType);
        }
    }
}

//# sourceMappingURL=agGridReactLegacy.js.map
