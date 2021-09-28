// ag-grid-react v26.1.0
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ag_grid_community_1 = require("ag-grid-community");
var agGridColumn_1 = require("../agGridColumn");
var changeDetectionService_1 = require("../changeDetectionService");
var reactFrameworkOverrides_1 = require("./reactFrameworkOverrides");
var gridComp_1 = __importDefault(require("./gridComp"));
var AgGridReactFire = /** @class */ (function (_super) {
    __extends(AgGridReactFire, _super);
    function AgGridReactFire(props) {
        var _this = _super.call(this, props) || this;
        _this.props = props;
        _this.destroyFuncs = [];
        _this.changeDetectionService = new changeDetectionService_1.ChangeDetectionService();
        _this.eGui = react_1.default.createRef();
        _this.state = { context: undefined };
        return _this;
    }
    AgGridReactFire.prototype.render = function () {
        return (react_1.default.createElement("div", { style: this.createStyleForDiv(), className: this.props.className, ref: this.eGui }, this.state.context && react_1.default.createElement(gridComp_1.default, { context: this.state.context })));
    };
    AgGridReactFire.prototype.createStyleForDiv = function () {
        return __assign({ height: '100%' }, (this.props.containerStyle || {}));
    };
    AgGridReactFire.prototype.componentDidMount = function () {
        var _this = this;
        var modules = this.props.modules || [];
        var gridParams = {
            // providedBeanInstances: {
            //     agGridReact: this,
            //     frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            // },
            modules: modules,
            frameworkOverrides: new reactFrameworkOverrides_1.ReactFrameworkOverrides()
        };
        this.gridOptions = __assign({}, this.props.gridOptions);
        var children = this.props.children;
        if (agGridColumn_1.AgGridColumn.hasChildColumns(children)) {
            this.gridOptions.columnDefs = agGridColumn_1.AgGridColumn.mapChildColumnDefs(children);
        }
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this.props);
        // don't need the return value
        var gridCoreCreator = new ag_grid_community_1.GridCoreCreator();
        gridCoreCreator.create(this.eGui.current, this.gridOptions, function (context) {
            _this.setState({ context: context });
        }, gridParams);
        this.destroyFuncs.push(function () { return _this.gridOptions.api.destroy(); });
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    };
    AgGridReactFire.prototype.componentWillUnmount = function () {
        this.destroyFuncs.forEach(function (f) { return f(); });
    };
    AgGridReactFire.prototype.componentDidUpdate = function (prevProps) {
        this.processPropsChanges(prevProps, this.props);
    };
    AgGridReactFire.prototype.processPropsChanges = function (prevProps, nextProps) {
        var changes = {};
        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);
        this.processChanges(changes);
    };
    AgGridReactFire.prototype.extractDeclarativeColDefChanges = function (nextProps, changes) {
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
    AgGridReactFire.prototype.extractGridPropertyChanges = function (prevProps, nextProps, changes) {
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
    AgGridReactFire.prototype.processChanges = function (changes) {
        if (this.api) {
            ag_grid_community_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridReactFire.prototype.getStrategyTypeForProp = function (propKey) {
        if (propKey === 'rowData') {
            if (this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            if (this.isImmutableDataActive()) {
                return changeDetectionService_1.ChangeDetectionStrategyType.IdentityCheck;
            }
        }
        // all other cases will default to DeepValueCheck
        return changeDetectionService_1.ChangeDetectionStrategyType.DeepValueCheck;
    };
    AgGridReactFire.prototype.isImmutableDataActive = function () {
        return (this.props.deltaRowDataMode || this.props.immutableData) ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode || this.props.gridOptions.immutableData));
    };
    return AgGridReactFire;
}(react_1.Component));
exports.AgGridReactFire = AgGridReactFire;
