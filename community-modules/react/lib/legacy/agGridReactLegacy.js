// @ag-grid-community/react v28.2.1
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importStar(require("react"));
const legacyReactComponent_1 = require("./legacyReactComponent");
const agGridColumn_1 = require("../shared/agGridColumn");
const changeDetectionService_1 = require("../shared/changeDetectionService");
const newReactComponent_1 = require("../shared/newReactComponent");
const portalManager_1 = require("../shared/portalManager");
const reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
class AgGridReactLegacy extends react_1.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.changeDetectionService = new changeDetectionService_1.ChangeDetectionService();
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
        const { children } = this.props;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(children);
        }
        this.gridOptions = core_1.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        // don't need the return value
        new core_1.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    }
    getStrategyTypeForProp(propKey) {
        if (propKey === 'rowData') {
            if (this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            else if (this.isImmutableDataActive()) {
                return changeDetectionService_1.ChangeDetectionStrategyType.IdentityCheck;
            }
        }
        // all other cases will default to DeepValueCheck
        return changeDetectionService_1.ChangeDetectionStrategyType.DeepValueCheck;
    }
    isImmutableDataActive() {
        return (this.props.deltaRowDataMode || this.props.immutableData) || this.props.getRowId != null ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode
                || this.props.gridOptions.immutableData
                || this.props.gridOptions.getRowId != null));
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
        this.extractDeclarativeColDefChanges(nextProps, changes);
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    }
    extractDeclarativeColDefChanges(nextProps, changes) {
        // if columnDefs are provided on gridOptions we use those - you can't combine both
        // we also skip if columnDefs are provided as a prop directly on AgGridReact
        if ((this.props.gridOptions && this.props.gridOptions.columnDefs) || this.props.columnDefs) {
            return;
        }
        const debugLogging = !!nextProps.debug;
        const propKey = 'columnDefs';
        const currentColDefs = this.gridOptions.columnDefs;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(nextProps.children)) {
            const detectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
            const newColDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(nextProps.children);
            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log(`agGridReact: colDefs definitions changed`);
                }
                changes[propKey] =
                    {
                        previousValue: currentColDefs,
                        currentValue: newColDefs
                    };
            }
        }
        else if (currentColDefs && currentColDefs.length > 0) {
            changes[propKey] =
                {
                    previousValue: currentColDefs,
                    currentValue: []
                };
        }
    }
    extractGridPropertyChanges(prevProps, nextProps, changes) {
        const debugLogging = !!nextProps.debug;
        Object.keys(nextProps).forEach(propKey => {
            if (core_1._.includes(core_1.ComponentUtil.ALL_PROPERTIES, propKey)) {
                const changeDetectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
                if (!changeDetectionStrategy.areEqual(prevProps[propKey], nextProps[propKey])) {
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
        core_1.ComponentUtil.getEventCallbacks().forEach(funcName => {
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
                core_1.ComponentUtil.processOnChange(synchronousChanges, this.gridOptions, this.api, this.columnApi);
            }
        }
        return asyncChanges;
    }
    processAsynchronousChanges(changes) {
        if (Object.keys(changes).length > 0) {
            window.setTimeout(() => {
                // destroyed?
                if (this.api) {
                    core_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
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
addProperties(core_1.ComponentUtil.getEventCallbacks(), prop_types_1.default.func);
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
