// ag-grid-react v13.3.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var reactFrameworkFactory_1 = require("./reactFrameworkFactory");
var reactFrameworkComponentWrapper_1 = require("./reactFrameworkComponentWrapper");
var DOM = require("react-dom-factories");
var react_1 = require("react");
var PropTypes = require("prop-types");
var AgGrid = require("ag-grid");
var AgGridReact = (function (_super) {
    __extends(AgGridReact, _super);
    function AgGridReact(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.props = props;
        _this.state = state;
        return _this;
    }
    AgGridReact.prototype.render = function () {
        var _this = this;
        return DOM.div({
            style: this.createStyleForDiv(),
            ref: function (e) {
                _this.eGridDiv = e;
            }
        });
    };
    AgGridReact.prototype.createStyleForDiv = function () {
        var style = { height: '100%' };
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
        var reactFrameworkFactory = new reactFrameworkFactory_1.ReactFrameworkFactory(this);
        var gridParams = {
            frameworkFactory: reactFrameworkFactory,
            seedBeanInstances: {
                agGridReact: this
            }
        };
        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        AgGrid.Grid.setFrameworkBeans([reactFrameworkComponentWrapper_1.ReactFrameworkComponentWrapper]);
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
        return (obj instanceof Number || obj instanceof String
            ? obj.valueOf()
            : obj);
    };
    // sigh, here for ie compatibility
    AgGridReact.prototype.copyObject = function (obj) {
        if (!obj) {
            return obj;
        }
        return [{}, obj].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    };
    AgGridReact.prototype.areEquivalent = function (a, b) {
        return AgGridReact.areEquivalent(this.copyObject(a), this.copyObject(b));
    };
    AgGridReact.areEquivalent = function (a, b) {
        a = AgGridReact.unwrapStringOrNumber(a);
        b = AgGridReact.unwrapStringOrNumber(b);
        if (a === b)
            return true; //e.g. a and b both null
        if (a === null || b === null || typeof (a) !== typeof (b))
            return false;
        if (a instanceof Date)
            return b instanceof Date && a.valueOf() === b.valueOf();
        if (typeof (a) !== "object")
            return a == b; //for boolean, number, string, xml
        var newA = (a.areEquivalent_Eq_91_2_34 === undefined), newB = (b.areEquivalent_Eq_91_2_34 === undefined);
        try {
            var prop = void 0;
            if (newA)
                a.areEquivalent_Eq_91_2_34 = [];
            else if (a.areEquivalent_Eq_91_2_34.some(function (other) {
                return other === b;
            }))
                return true;
            if (newB)
                b.areEquivalent_Eq_91_2_34 = [];
            else if (b.areEquivalent_Eq_91_2_34.some(function (other) {
                return other === a;
            }))
                return true;
            a.areEquivalent_Eq_91_2_34.push(b);
            b.areEquivalent_Eq_91_2_34.push(a);
            var tmp = {};
            for (prop in a)
                if (prop !=
                    "areEquivalent_Eq_91_2_34")
                    tmp[prop] = null;
            for (prop in b)
                if (prop != "areEquivalent_Eq_91_2_34")
                    tmp[prop] = null;
            for (prop in tmp)
                if (!this.areEquivalent(a[prop], b[prop]))
                    return false;
            return true;
        }
        finally {
            if (newA)
                delete a.areEquivalent_Eq_91_2_34;
            if (newB)
                delete b.areEquivalent_Eq_91_2_34;
        }
    };
    return AgGridReact;
}(react_1.Component));
exports.AgGridReact = AgGridReact;
AgGridReact.propTypes = {
    gridOptions: PropTypes.object,
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
