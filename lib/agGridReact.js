// ag-grid-react v5.1.0
/// <reference path="../typings/tsd"/>
var React = require('react');
var ReactDOM = require('react-dom');
var AgGrid = require('ag-grid');
exports.AgGridReact = React.createClass({
    render: function () {
        return React.DOM.div({
            style: { height: '100%' }
        });
    },
    componentDidMount: function () {
        var domNode = ReactDOM.findDOMNode(this);
        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        new AgGrid.Grid(domNode, this.gridOptions);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    },
    getCallbackForEvent: function (eventName) {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        else {
            return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        }
    },
    // duplicated, taken from gridOptionsWrapper
    globalEventListener: function (eventName, event) {
        var callbackMethodName = this.getCallbackForEvent(eventName);
        var callbackFromProps = this.props[callbackMethodName];
        if (callbackFromProps) {
            callbackFromProps(event);
        }
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
