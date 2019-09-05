// ag-grid-react v21.2.1
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
var AgGrid = require("ag-grid-community");
var ag_grid_community_1 = require("ag-grid-community");
var agGridColumn_1 = require("./agGridColumn");
var reactComponent_1 = require("./reactComponent");
var changeDetectionService_1 = require("./changeDetectionService");
var legacyReactComponent_1 = require("./legacyReactComponent");
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
        var gridParams = {
            seedBeanInstances: {
                agGridReact: this
            }
        };
        var gridOptions = this.props.gridOptions || {};
        if (agGridColumn_1.AgGridColumn.hasChildColumns(this.props)) {
            gridOptions.columnDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(this.props);
        }
        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        // don't need the return value
        new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    };
    AgGridReact.prototype.shouldComponentUpdate = function () {
        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    };
    AgGridReact.prototype.waitForInstance = function (reactComponent, resolve, runningTime) {
        var _this = this;
        if (runningTime === void 0) { runningTime = 0; }
        // if the grid has been destroyed in the meantime just resolve
        if (!this.api) {
            resolve(null);
            return;
        }
        if (reactComponent.isStatelessComponent() && reactComponent.statelessComponentRendered()) {
            resolve(null);
        }
        else if (!reactComponent.isStatelessComponent() && reactComponent.getFrameworkComponentInstance()) {
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
        this.portals = this.portals.concat([portal]);
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
            // if deltaRowDataMode we default to IdentityChecks,
            // if not we default to DeepValueChecks (with the rest of the properties)
            if (!!this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            else if (this.props['deltaRowDataMode']) {
                return changeDetectionService_1.ChangeDetectionStrategyType.IdentityCheck;
            }
        }
        // all non row data properties will default to DeepValueCheck
        return changeDetectionService_1.ChangeDetectionStrategyType.DeepValueCheck;
    };
    AgGridReact.prototype.componentWillReceiveProps = function (nextProps) {
        var changes = {};
        this.extractGridPropertyChanges(nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);
        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
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
    AgGridReact.prototype.extractGridPropertyChanges = function (nextProps, changes) {
        var _this = this;
        var debugLogging = !!nextProps.debug;
        var changedKeys = Object.keys(nextProps);
        changedKeys.forEach(function (propKey) {
            if (AgGrid.ComponentUtil.ALL_PROPERTIES.indexOf(propKey) !== -1) {
                var changeDetectionStrategy = _this.changeDetectionService.getStrategy(_this.getStrategyTypeForProp(propKey));
                if (!changeDetectionStrategy.areEqual(_this.props[propKey], nextProps[propKey])) {
                    if (debugLogging) {
                        console.log("agGridReact: [" + propKey + "] property changed");
                    }
                    changes[propKey] = {
                        previousValue: _this.props[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach(function (funcName) {
            if (_this.props[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log("agGridReact: [" + funcName + "] event callback changed");
                }
                changes[funcName] = {
                    previousValue: _this.props[funcName],
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
    };
    AgGridReact.MAX_COMPONENT_CREATION_TIME = 1000; // a second should be more than enough to instantiate a component
    return AgGridReact;
}(React.Component));
exports.AgGridReact = AgGridReact;
AgGridReact.propTypes = {
    gridOptions: PropTypes.object
};
addProperties(AgGrid.ComponentUtil.getEventCallbacks(), PropTypes.func);
addProperties(AgGrid.ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(AgGrid.ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(AgGrid.ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(AgGrid.ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(AgGrid.ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(AgGrid.ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        AgGridReact[propKey] = propType;
    });
}
var ReactFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (UserReactComponent) {
        // at some point soon unstable_renderSubtreeIntoContainer is going to be dropped (and in a minor release at that)
        // this uses the existing mechanism as long as possible, but switches over to using Portals when
        // unstable_renderSubtreeIntoContainer is no longer an option
        return this.useLegacyReact() ?
            new legacyReactComponent_1.LegacyReactComponent(UserReactComponent, this.agGridReact) :
            new reactComponent_1.ReactComponent(UserReactComponent, this.agGridReact);
    };
    ReactFrameworkComponentWrapper.prototype.useLegacyReact = function () {
        // force use of react next (ie portals) if unstable_renderSubtreeIntoContainer is no longer present
        // or if the user elects to try it
        return (typeof ReactDOM.unstable_renderSubtreeIntoContainer !== "function")
            || (this.agGridReact && this.agGridReact.gridOptions && !this.agGridReact.gridOptions.reactNext);
    };
    __decorate([
        ag_grid_community_1.Autowired("agGridReact"),
        __metadata("design:type", AgGridReact)
    ], ReactFrameworkComponentWrapper.prototype, "agGridReact", void 0);
    ReactFrameworkComponentWrapper = __decorate([
        ag_grid_community_1.Bean("frameworkComponentWrapper")
    ], ReactFrameworkComponentWrapper);
    return ReactFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);
