// ag-grid-react v25.1.0
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_1 = require("react");
var PropTypes = require("prop-types");
var ag_grid_community_1 = require("ag-grid-community");
var agGridColumn_1 = require("./agGridColumn");
var changeDetectionService_1 = require("./changeDetectionService");
var legacyReactComponent_1 = require("./legacyReactComponent");
var newReactComponent_1 = require("./newReactComponent");
var AgGridReact = /** @class */ (function (_super) {
    __extends(AgGridReact, _super);
    function AgGridReact(props) {
        var _this = _super.call(this, props) || this;
        _this.props = props;
        _this.changeDetectionService = new changeDetectionService_1.ChangeDetectionService();
        _this.api = null;
        _this.portals = [];
        _this.hasPendingPortalUpdate = false;
        _this.destroyed = false;
        _this.SYNCHRONOUS_CHANGE_PROPERTIES = ['context'];
        return _this;
    }
    AgGridReact.prototype.render = function () {
        var _this = this;
        return React.createElement('div', {
            style: this.createStyleForDiv(),
            className: this.props.className,
            ref: function (e) {
                _this.eGridDiv = e;
            }
        }, this.portals);
    };
    AgGridReact.prototype.createStyleForDiv = function () {
        return __assign({ height: '100%' }, (this.props.containerStyle || {}));
    };
    AgGridReact.prototype.componentDidMount = function () {
        var modules = this.props.modules || [];
        var gridParams = {
            providedBeanInstances: {
                agGridReact: this,
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            },
            modules: modules
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
    };
    AgGridReact.prototype.waitForInstance = function (reactComponent, resolve, startTime) {
        var _this = this;
        if (startTime === void 0) { startTime = Date.now(); }
        // if the grid has been destroyed in the meantime just resolve
        if (this.destroyed) {
            resolve(null);
            return;
        }
        if (reactComponent.rendered()) {
            resolve(reactComponent);
        }
        else {
            if (Date.now() - startTime >= this.props.maxComponentCreationTimeMs && !this.hasPendingPortalUpdate) {
                // last check - we check if this is a null value being rendered - we do this last as using SSR to check the value
                // can mess up contexts
                if (reactComponent.isNullValue()) {
                    resolve(reactComponent);
                    return;
                }
                console.error("AG Grid: React Component '" + reactComponent.getReactComponentName() + "' not created within " + AgGridReact.MAX_COMPONENT_CREATION_TIME_IN_MS + "ms");
                return;
            }
            window.setTimeout(function () {
                _this.waitForInstance(reactComponent, resolve, startTime);
            });
        }
    };
    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    AgGridReact.prototype.mountReactPortal = function (portal, reactComponent, resolve) {
        this.portals = __spreadArrays(this.portals, [portal]);
        this.waitForInstance(reactComponent, resolve);
        this.batchUpdate();
    };
    AgGridReact.prototype.updateReactPortal = function (oldPortal, newPortal) {
        this.portals[this.portals.indexOf(oldPortal)] = newPortal;
        this.batchUpdate();
    };
    AgGridReact.prototype.batchUpdate = function () {
        var _this = this;
        if (this.hasPendingPortalUpdate) {
            return;
        }
        setTimeout(function () {
            if (_this.api) { // destroyed?
                _this.forceUpdate(function () {
                    _this.hasPendingPortalUpdate = false;
                });
            }
        });
        this.hasPendingPortalUpdate = true;
    };
    AgGridReact.prototype.destroyPortal = function (portal) {
        this.portals = this.portals.filter(function (curPortal) { return curPortal !== portal; });
        this.batchUpdate();
    };
    AgGridReact.prototype.getStrategyTypeForProp = function (propKey) {
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
    AgGridReact.prototype.isImmutableDataActive = function () {
        return (this.props.deltaRowDataMode || this.props.immutableData) ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode || this.props.gridOptions.immutableData));
    };
    AgGridReact.prototype.shouldComponentUpdate = function (nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as AG Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    };
    AgGridReact.prototype.componentDidUpdate = function (prevProps) {
        this.processPropsChanges(prevProps, this.props);
    };
    AgGridReact.prototype.processPropsChanges = function (prevProps, nextProps) {
        var changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    };
    AgGridReact.prototype.extractDeclarativeColDefChanges = function (nextProps, changes) {
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
    AgGridReact.prototype.extractGridPropertyChanges = function (prevProps, nextProps, changes) {
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
            if (_this.props[funcName] !== nextProps[funcName]) {
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
    AgGridReact.prototype.componentWillUnmount = function () {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }
        this.destroyed = true;
    };
    AgGridReact.prototype.isDisableStaticMarkup = function () {
        return this.props.disableStaticMarkup;
    };
    AgGridReact.prototype.isLegacyComponentRendering = function () {
        return this.props.legacyComponentRendering;
    };
    AgGridReact.prototype.processSynchronousChanges = function (changes) {
        var asyncChanges = __assign({}, changes);
        if (Object.keys(asyncChanges).length > 0) {
            var synchronousChanges_1 = {};
            this.SYNCHRONOUS_CHANGE_PROPERTIES.forEach(function (synchronousChangeProperty) {
                if (asyncChanges[synchronousChangeProperty]) {
                    synchronousChanges_1[synchronousChangeProperty] = asyncChanges[synchronousChangeProperty];
                    delete asyncChanges.context;
                }
            });
            if (Object.keys(synchronousChanges_1).length > 0 && !!this.api) {
                ag_grid_community_1.ComponentUtil.processOnChange({ context: asyncChanges.context }, this.gridOptions, this.api, this.columnApi);
            }
        }
        return asyncChanges;
    };
    AgGridReact.prototype.processAsynchronousChanges = function (changes) {
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
    AgGridReact.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component
    AgGridReact.defaultProps = {
        legacyComponentRendering: false,
        disableStaticMarkup: false,
        maxComponentCreationTimeMs: AgGridReact.MAX_COMPONENT_CREATION_TIME_IN_MS
    };
    return AgGridReact;
}(react_1.Component));
exports.AgGridReact = AgGridReact;
AgGridReact.propTypes = {
    gridOptions: PropTypes.object
};
addProperties(ag_grid_community_1.ComponentUtil.getEventCallbacks(), PropTypes.func);
addProperties(ag_grid_community_1.ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(ag_grid_community_1.ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(ag_grid_community_1.ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(ag_grid_community_1.ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(ag_grid_community_1.ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(ag_grid_community_1.ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        AgGridReact[propKey] = propType;
    });
}
var ReactFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper(agGridReact) {
        var _this = _super.call(this) || this;
        _this.agGridReact = agGridReact;
        return _this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (UserReactComponent, componentType) {
        return this.agGridReact.isLegacyComponentRendering() ?
            new legacyReactComponent_1.LegacyReactComponent(UserReactComponent, this.agGridReact, componentType) :
            new newReactComponent_1.NewReactComponent(UserReactComponent, this.agGridReact, componentType);
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
