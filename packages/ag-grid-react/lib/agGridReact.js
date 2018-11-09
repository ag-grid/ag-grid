// ag-grid-react v19.1.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
var PropTypes = require("prop-types");
var AgGrid = require("ag-grid-community");
var ag_grid_community_1 = require("ag-grid-community");
var agGridColumn_1 = require("./agGridColumn");
var agReactComponent_1 = require("./agReactComponent");
var AgGridReact = /** @class */ (function (_super) {
    __extends(AgGridReact, _super);
    function AgGridReact(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.props = props;
        _this.state = state;
        return _this;
    }
    AgGridReact.prototype.render = function () {
        var _this = this;
        return React.createElement("div", {
            style: this.createStyleForDiv(),
            ref: function (e) {
                _this.eGridDiv = e;
            }
        });
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
    AgGridReact.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        var debugLogging = !!nextProps.debug;
        // keeping consistent with web components, put changing
        // values in currentValue and previousValue pairs and
        // not include items that have not changed.
        var changes = {};
        AgGrid.ComponentUtil.ALL_PROPERTIES.forEach(function (propKey) {
            if (!_this.areEquivalent(_this.props[propKey], nextProps[propKey])) {
                if (debugLogging) {
                    console.log("agGridReact: [" + propKey + "] property changed");
                }
                changes[propKey] = {
                    previousValue: _this.props[propKey],
                    currentValue: nextProps[propKey]
                };
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
        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
    };
    AgGridReact.prototype.componentWillUnmount = function () {
        if (this.api) {
            this.api.destroy();
        }
    };
    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    AgGridReact.unwrapStringOrNumber = function (obj) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    };
    // sigh, here for ie compatibility
    AgGridReact.prototype.copy = function (value) {
        if (!value) {
            return value;
        }
        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            var arrayCopy = [];
            for (var i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }
        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them, IE will fail (correctly, imho)
        if (typeof value !== "object") {
            return value;
        }
        return [{}, value].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    };
    AgGridReact.prototype.areEquivalent = function (a, b) {
        return AgGridReact.areEquivalent(this.copy(a), this.copy(b));
    };
    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    AgGridReact.areEquivalent = function (a, b) {
        a = AgGridReact.unwrapStringOrNumber(a);
        b = AgGridReact.unwrapStringOrNumber(b);
        if (a === b)
            return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b)
            return false;
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            return a.toString() === b.toString();
        }
        if (typeof a !== "object") {
            return a == b; //for boolean, number, string, function, xml
        }
        var newA = a.areEquivPropertyTracking === undefined, newB = b.areEquivPropertyTracking === undefined;
        try {
            var prop = void 0;
            if (newA) {
                a.areEquivPropertyTracking = [];
            }
            else if (a.areEquivPropertyTracking.some(function (other) {
                return other === b;
            }))
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            }
            else if (b.areEquivPropertyTracking.some(function (other) { return other === a; })) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);
            var tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }
            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        }
        finally {
            if (newA)
                delete a.areEquivPropertyTracking;
            if (newB)
                delete b.areEquivPropertyTracking;
        }
    };
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
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (ReactComponent) {
        var _self = this;
        var DynamicAgReactComponent = /** @class */ (function (_super) {
            __extends(DynamicAgReactComponent, _super);
            function DynamicAgReactComponent() {
                return _super.call(this, ReactComponent, _self.agGridReact) || this;
            }
            DynamicAgReactComponent.prototype.init = function (params) {
                return _super.prototype.init.call(this, params);
            };
            DynamicAgReactComponent.prototype.hasMethod = function (name) {
                var frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                if (frameworkComponentInstance == null) {
                    return true;
                }
                return frameworkComponentInstance[name] != null;
            };
            DynamicAgReactComponent.prototype.callMethod = function (name, args) {
                var _this = this;
                var frameworkComponentInstance = this.getFrameworkComponentInstance();
                if (frameworkComponentInstance == null) {
                    setTimeout(function () { return _this.callMethod(name, args); }, 100);
                }
                else {
                    var method = wrapper.getFrameworkComponentInstance()[name];
                    if (method == null)
                        return null;
                    return method.apply(frameworkComponentInstance, args);
                }
            };
            DynamicAgReactComponent.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            return DynamicAgReactComponent;
        }(agReactComponent_1.AgReactComponent));
        var wrapper = new DynamicAgReactComponent();
        return wrapper;
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
