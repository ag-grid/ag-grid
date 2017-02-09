// ag-grid-react v8.0.0
/// <reference path="../typings/tsd"/>
var reactFrameworkFactory_1 = require('./reactFrameworkFactory');
var reactFrameworkComponentWrapper_1 = require("./reactFrameworkComponentWrapper");
var React = require('react');
var ReactDOM = require('react-dom');
var AgGrid = require('ag-grid');
exports.AgGridReact = React.createClass({
    render: function () {
        return React.DOM.div({
            style: this.createStyleForDiv()
        });
    },
    createStyleForDiv: function () {
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
    },
    componentDidMount: function () {
        var reactFrameworkFactory = new reactFrameworkFactory_1.ReactFrameworkFactory(this);
        var gridParams = { frameworkFactory: reactFrameworkFactory };
        var domNode = ReactDOM.findDOMNode(this);
        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        AgGrid.Grid.setFrameworkBeans([reactFrameworkComponentWrapper_1.ReactFrameworkComponentWrapper]);
        new AgGrid.Grid(domNode, this.gridOptions, gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    },
    shouldComponentUpdate: function () {
        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    },
    componentWillReceiveProps: function (nextProps) {
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
    },
    componentWillUnmount: function () {
        this.api.destroy();
    }
});
exports.AgGridReact.propTypes = {
    gridOptions: React.PropTypes.object,
};
addProperties(AgGrid.ComponentUtil.getEventCallbacks(), React.PropTypes.func);
addProperties(AgGrid.ComponentUtil.BOOLEAN_PROPERTIES, React.PropTypes.bool);
addProperties(AgGrid.ComponentUtil.STRING_PROPERTIES, React.PropTypes.string);
addProperties(AgGrid.ComponentUtil.OBJECT_PROPERTIES, React.PropTypes.object);
addProperties(AgGrid.ComponentUtil.ARRAY_PROPERTIES, React.PropTypes.array);
addProperties(AgGrid.ComponentUtil.NUMBER_PROPERTIES, React.PropTypes.number);
addProperties(AgGrid.ComponentUtil.FUNCTION_PROPERTIES, React.PropTypes.func);
function addProperties(listOfProps, propType) {
    listOfProps.forEach(function (propKey) {
        exports.AgGridReact[propKey] = propType;
    });
}
