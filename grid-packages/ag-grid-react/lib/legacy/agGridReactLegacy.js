// ag-grid-react v28.2.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var ag_grid_community_1 = require("ag-grid-community");
var prop_types_1 = __importDefault(require("prop-types"));
var react_1 = __importStar(require("react"));
var legacyReactComponent_1 = require("./legacyReactComponent");
var agGridColumn_1 = require("../shared/agGridColumn");
var changeDetectionService_1 = require("../shared/changeDetectionService");
var newReactComponent_1 = require("../shared/newReactComponent");
var portalManager_1 = require("../shared/portalManager");
var reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
var AgGridReactLegacy = /** @class */ (function (_super) {
    __extends(AgGridReactLegacy, _super);
    function AgGridReactLegacy(props) {
        var _this = _super.call(this, props) || this;
        _this.props = props;
        _this.changeDetectionService = new changeDetectionService_1.ChangeDetectionService();
        _this.api = null;
        _this.destroyed = false;
        _this.SYNCHRONOUS_CHANGE_PROPERTIES = ['context'];
        _this.portalManager = new portalManager_1.PortalManager(_this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
        return _this;
    }
    AgGridReactLegacy.prototype.render = function () {
        var _this = this;
        return react_1.default.createElement('div', {
            style: this.createStyleForDiv(),
            className: this.props.className,
            ref: function (e) {
                _this.eGridDiv = e;
            }
        }, this.portalManager.getPortals());
    };
    AgGridReactLegacy.prototype.createStyleForDiv = function () {
        return __assign({ height: '100%' }, (this.props.containerStyle || {}));
    };
    AgGridReactLegacy.prototype.componentDidMount = function () {
        var modules = this.props.modules || [];
        var gridParams = {
            providedBeanInstances: {
                agGridReact: this,
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this, this.portalManager)
            },
            modules: modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides(false)
        };
        var gridOptions = this.props.gridOptions || {};
        var children = this.props.children;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(children);
        }
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        // don't need the return value
        new ag_grid_community_1.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    };
    AgGridReactLegacy.prototype.getStrategyTypeForProp = function (propKey) {
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
    };
    AgGridReactLegacy.prototype.isImmutableDataActive = function () {
        return (this.props.deltaRowDataMode || this.props.immutableData) || this.props.getRowId != null ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode
                || this.props.gridOptions.immutableData
                || this.props.gridOptions.getRowId != null));
    };
    AgGridReactLegacy.prototype.shouldComponentUpdate = function (nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as AG Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    };
    AgGridReactLegacy.prototype.componentDidUpdate = function (prevProps) {
        this.processPropsChanges(prevProps, this.props);
    };
    AgGridReactLegacy.prototype.processPropsChanges = function (prevProps, nextProps) {
        var changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    };
    AgGridReactLegacy.prototype.extractDeclarativeColDefChanges = function (nextProps, changes) {
        // if columnDefs are provided on gridOptions we use those - you can't combine both
        // we also skip if columnDefs are provided as a prop directly on AgGridReact
        if ((this.props.gridOptions && this.props.gridOptions.columnDefs) || this.props.columnDefs) {
            return;
        }
        var debugLogging = !!nextProps.debug;
        var propKey = 'columnDefs';
        var currentColDefs = this.gridOptions.columnDefs;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(nextProps.children)) {
            var detectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
            var newColDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(nextProps.children);
            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log("agGridReact: colDefs definitions changed");
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
    };
    AgGridReactLegacy.prototype.extractGridPropertyChanges = function (prevProps, nextProps, changes) {
        var _this = this;
        var debugLogging = !!nextProps.debug;
        Object.keys(nextProps).forEach(function (propKey) {
            if (ag_grid_community_1._.includes(ag_grid_community_1.ComponentUtil.ALL_PROPERTIES, propKey)) {
                var changeDetectionStrategy = _this.changeDetectionService.getStrategy(_this.getStrategyTypeForProp(propKey));
                if (!changeDetectionStrategy.areEqual(prevProps[propKey], nextProps[propKey])) {
                    if (debugLogging) {
                        console.log("agGridReact: [" + propKey + "] property changed");
                    }
                    changes[propKey] = {
                        previousValue: prevProps[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        ag_grid_community_1.ComponentUtil.getEventCallbacks().forEach(function (funcName) {
            if (prevProps[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log("agGridReact: [" + funcName + "] event callback changed");
                }
                changes[funcName] = {
                    previousValue: prevProps[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
    };
    AgGridReactLegacy.prototype.componentWillUnmount = function () {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }
        this.destroyed = true;
        this.portalManager.destroy();
    };
    AgGridReactLegacy.prototype.isDisableStaticMarkup = function () {
        return this.props.disableStaticMarkup === true;
    };
    AgGridReactLegacy.prototype.isLegacyComponentRendering = function () {
        return this.props.legacyComponentRendering === true;
    };
    AgGridReactLegacy.prototype.processSynchronousChanges = function (changes) {
        var asyncChanges = __assign({}, changes);
        if (Object.keys(asyncChanges).length > 0) {
            var synchronousChanges_1 = {};
            this.SYNCHRONOUS_CHANGE_PROPERTIES.forEach(function (synchronousChangeProperty) {
                if (asyncChanges[synchronousChangeProperty]) {
                    synchronousChanges_1[synchronousChangeProperty] = asyncChanges[synchronousChangeProperty];
                    delete asyncChanges[synchronousChangeProperty];
                }
            });
            if (Object.keys(synchronousChanges_1).length > 0 && !!this.api) {
                ag_grid_community_1.ComponentUtil.processOnChange(synchronousChanges_1, this.gridOptions, this.api, this.columnApi);
            }
        }
        return asyncChanges;
    };
    AgGridReactLegacy.prototype.processAsynchronousChanges = function (changes) {
        var _this = this;
        if (Object.keys(changes).length > 0) {
            window.setTimeout(function () {
                // destroyed?
                if (_this.api) {
                    ag_grid_community_1.ComponentUtil.processOnChange(changes, _this.gridOptions, _this.api, _this.columnApi);
                }
            });
        }
    };
    AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component
    AgGridReactLegacy.defaultProps = {
        legacyComponentRendering: false,
        disableStaticMarkup: false,
        maxComponentCreationTimeMs: AgGridReactLegacy.MAX_COMPONENT_CREATION_TIME_IN_MS
    };
    return AgGridReactLegacy;
}(react_1.Component));
exports.AgGridReactLegacy = AgGridReactLegacy;
AgGridReactLegacy.propTypes = {
    gridOptions: prop_types_1.default.object
};
addProperties(ag_grid_community_1.ComponentUtil.getEventCallbacks(), prop_types_1.default.func);
addProperties(ag_grid_community_1.ComponentUtil.BOOLEAN_PROPERTIES, prop_types_1.default.bool);
addProperties(ag_grid_community_1.ComponentUtil.STRING_PROPERTIES, prop_types_1.default.string);
addProperties(ag_grid_community_1.ComponentUtil.OBJECT_PROPERTIES, prop_types_1.default.object);
addProperties(ag_grid_community_1.ComponentUtil.ARRAY_PROPERTIES, prop_types_1.default.array);
addProperties(ag_grid_community_1.ComponentUtil.NUMBER_PROPERTIES, prop_types_1.default.number);
addProperties(ag_grid_community_1.ComponentUtil.FUNCTION_PROPERTIES, prop_types_1.default.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        AgGridReactLegacy[propKey] = propType;
    });
}
var ReactFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper(agGridReact, portalManager) {
        var _this = _super.call(this) || this;
        _this.agGridReact = agGridReact;
        _this.portalManager = portalManager;
        return _this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (UserReactComponent, componentType) {
        if (this.agGridReact.isLegacyComponentRendering()) {
            return new legacyReactComponent_1.LegacyReactComponent(UserReactComponent, this.agGridReact, this.portalManager, componentType);
        }
        else {
            return new newReactComponent_1.NewReactComponent(UserReactComponent, this.portalManager, componentType);
        }
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
