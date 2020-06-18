// ag-grid-react v23.2.1
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
var reactComponent_1 = require("./reactComponent");
var changeDetectionService_1 = require("./changeDetectionService");
var AgGridReact = /** @class */ (function (_super) {
    __extends(AgGridReact, _super);
    function AgGridReact(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.props = props;
        _this.state = state;
        _this.changeDetectionService = new changeDetectionService_1.ChangeDetectionService();
        _this.api = null;
        _this.portals = [];
        _this.hasPendingPortalUpdate = false;
        _this.destroyed = false;
        return _this;
    }
    AgGridReact.prototype.render = function () {
        var _this = this;
        return React.createElement("div", {
            style: this.createStyleForDiv(),
            ref: function (e) {
                _this.eGridDiv = e;
            }
        }, this.portals);
    };
    AgGridReact.prototype.createStyleForDiv = function () {
        var style = { height: "100%" };
        // allow user to override styles
        var containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(function (key) {
                style[key] = containerStyle[key];
            });
        }
        return style;
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
        if (agGridColumn_1.AgGridColumn.hasChildColumns(this.props)) {
            gridOptions.columnDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(this.props);
        }
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        // don't need the return value
        new ag_grid_community_1.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    };
    AgGridReact.prototype.waitForInstance = function (reactComponent, resolve, runningTime) {
        var _this = this;
        if (runningTime === void 0) { runningTime = 0; }
        // if the grid has been destroyed in the meantime just resolve
        if (this.destroyed) {
            resolve(null);
            return;
        }
        if (reactComponent.rendered()) {
            resolve(null);
        }
        else {
            if (runningTime >= AgGridReact.MAX_COMPONENT_CREATION_TIME) {
                console.error("ag-Grid: React Component '" + reactComponent.getReactComponentName() + "' not created within " + AgGridReact.MAX_COMPONENT_CREATION_TIME + "ms");
                return;
            }
            window.setTimeout(function () { return _this.waitForInstance(reactComponent, resolve, runningTime + 5); }, 5);
        }
    };
    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    AgGridReact.prototype.mountReactPortal = function (portal, reactComponent, resolve) {
        this.portals = __spreadArrays(this.portals, [portal]);
        this.batchUpdate(this.waitForInstance(reactComponent, resolve));
    };
    AgGridReact.prototype.batchUpdate = function (callback) {
        var _this = this;
        if (this.hasPendingPortalUpdate) {
            return callback && callback();
        }
        setTimeout(function () {
            if (_this.api) { // destroyed?
                _this.forceUpdate(function () {
                    callback && callback();
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
            // for row data we either return the supplied strategy, or:
            // if deltaRowDataMode/immutableData we default to IdentityChecks,
            // if not we default to DeepValueChecks (with the rest of the properties)
            if (!!this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            else if (this.props['deltaRowDataMode'] || this.props['immutableData']) {
                return changeDetectionService_1.ChangeDetectionStrategyType.IdentityCheck;
            }
        }
        // all non row data properties will default to DeepValueCheck
        return changeDetectionService_1.ChangeDetectionStrategyType.DeepValueCheck;
    };
    AgGridReact.prototype.shouldComponentUpdate = function (nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as ag-Grid doesn't use React internally,
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
        if (Object.keys(changes).length > 0) {
            ag_grid_community_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridReact.prototype.extractDeclarativeColDefChanges = function (nextProps, changes) {
        var debugLogging = !!nextProps.debug;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(nextProps)) {
            var detectionStrategy = this.changeDetectionService.getStrategy(changeDetectionService_1.ChangeDetectionStrategyType.DeepValueCheck);
            var currentColDefs = this.gridOptions.columnDefs;
            var newColDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(nextProps);
            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log("agGridReact: colDefs definitions changed");
                }
                changes['columnDefs'] =
                    {
                        previousValue: this.gridOptions.columnDefs,
                        currentValue: agGridColumn_1.AgGridColumn.mapChildColumnDefs(nextProps)
                    };
            }
        }
    };
    AgGridReact.prototype.extractGridPropertyChanges = function (prevProps, nextProps, changes) {
        var _this = this;
        var debugLogging = !!nextProps.debug;
        var changedKeys = Object.keys(nextProps);
        changedKeys.forEach(function (propKey) {
            if (ag_grid_community_1.ComponentUtil.ALL_PROPERTIES.indexOf(propKey) !== -1) {
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
        return !!this.props.disableStaticMarkup;
    };
    AgGridReact.MAX_COMPONENT_CREATION_TIME = 1000; // a second should be more than enough to instantiate a component
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
        return new reactComponent_1.ReactComponent(UserReactComponent, this.agGridReact, componentType);
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
