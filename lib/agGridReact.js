// ag-grid-react v10.1.0
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
var react_1 = require("react");
var React = require("react");
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
        return React.DOM.div({
            style: this.createStyleForDiv(),
            ref: function (e) { _this.eGridDiv = e; }
        });
    };
    AgGridReact.prototype.createStyleForDiv = function () {
        var style = { height: '100%' };
        // allow user to override styles
        var containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(function (key) {
                var value = containerStyle[key];
                style[key] = value;
            });
        }
        return style;
    };
    AgGridReact.prototype.componentDidMount = function () {
        var reactFrameworkFactory = new reactFrameworkFactory_1.ReactFrameworkFactory(this);
        var gridParams = { frameworkFactory: reactFrameworkFactory };
        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        AgGrid.Grid.setFrameworkBeans([reactFrameworkComponentWrapper_1.ReactFrameworkComponentWrapper]);
        var grid = new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);
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
        // keeping consistent with web components, put changing
        // values in currentValue and previousValue pairs and
        // not include items that have not changed.
        var changes = {};
        AgGrid.ComponentUtil.ALL_PROPERTIES.forEach(function (propKey) {
            if (_this.props[propKey] !== nextProps[propKey]) {
                changes[propKey] = {
                    previousValue: _this.props[propKey],
                    currentValue: nextProps[propKey]
                };
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach(function (funcName) {
            if (_this.props[funcName] !== nextProps[funcName]) {
                changes[funcName] = {
                    previousValue: _this.props[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
    };
    AgGridReact.prototype.componentWillUnmount = function () {
        this.api.destroy();
    };
    return AgGridReact;
}(react_1.Component));
exports.AgGridReact = AgGridReact;
;
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
