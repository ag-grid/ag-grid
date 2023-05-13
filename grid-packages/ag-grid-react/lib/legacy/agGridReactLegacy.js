// ag-grid-react v29.3.5
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var ag_grid_community_1 = require("ag-grid-community");
var prop_types_1 = __importDefault(require("prop-types"));
var react_1 = __importStar(require("react"));
var legacyReactComponent_1 = require("./legacyReactComponent");
var newReactComponent_1 = require("../shared/newReactComponent");
var portalManager_1 = require("../shared/portalManager");
var reactFrameworkOverrides_1 = require("../shared/reactFrameworkOverrides");
var AgGridReactLegacy = /** @class */ (function (_super) {
    __extends(AgGridReactLegacy, _super);
    function AgGridReactLegacy(props) {
        var _this = _super.call(this, props) || this;
        _this.props = props;
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
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);
        this.checkForDeprecations(this.props);
        // don't need the return value
        new ag_grid_community_1.Grid(this.eGridDiv, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this.props.setGridApi(this.api, this.columnApi);
    };
    AgGridReactLegacy.prototype.checkForDeprecations = function (props) {
        if (props.rowDataChangeDetectionStrategy) {
            ag_grid_community_1._.doOnce(function () { return console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'); }, 'rowDataChangeDetectionStrategy_Deprecation');
        }
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
        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    };
    AgGridReactLegacy.prototype.extractGridPropertyChanges = function (prevProps, nextProps, changes) {
        var debugLogging = !!nextProps.debug;
        Object.keys(nextProps).forEach(function (propKey) {
            if (ag_grid_community_1.ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
                if (prevProps[propKey] !== nextProps[propKey]) {
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
        ag_grid_community_1.ComponentUtil.EVENT_CALLBACKS.forEach(function (funcName) {
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
                ag_grid_community_1.ComponentUtil.processOnChange(synchronousChanges_1, this.api);
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
                    ag_grid_community_1.ComponentUtil.processOnChange(changes, _this.api);
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
addProperties(ag_grid_community_1.ComponentUtil.EVENT_CALLBACKS, prop_types_1.default.func);
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
