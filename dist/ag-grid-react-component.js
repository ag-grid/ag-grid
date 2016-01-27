/**
 * ag-grid-react-component - ag-Grid React Component
 * @version v3.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var React = require('react');
var ReactDOM = require('react-dom');
var AgGrid = require('ag-grid');
var ag;
(function (ag) {
    var react;
    (function (react) {
        react.AgGridReact = React.createClass({
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
        react.AgGridReact.propTypes = {
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
                react.AgGridReact[propKey] = propType;
            });
        }
    })(react = ag.react || (ag.react = {}));
})(ag || (ag = {}));
/// <reference path="../../typings/tsd" />
/// <reference path="./AgGridReact" />
// creating the random local variable was needed to get the unit tests working.
// if not, the tests would not load as we were referencing an undefined window object
var __RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ;
if (typeof window !== 'undefined') {
    __RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ = window;
}
(function () {
    if (typeof exports !== 'undefined') {
        exports = ag.react;
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = ag.react;
        }
    }
}).call(__RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ);
var React = require('react');
var ReactDOM = require('react-dom');
var ag;
(function (ag) {
    var react;
    (function (react) {
        function reactCellRendererFactory(reactComponent) {
            return function (params) {
                params.eParentOfValue.addElementAttachedListener(function (eCell) {
                    ReactDOM.render(React.createElement(reactComponent, { params: params }), eCell);
                    // if you are reading this, and want to do it using jsx, the equivalent is below.
                    // however because we don't have the actual class here (just a reference to the class)
                    // it can't be built into jsx. besides, the ag-grid-react-component project is so
                    // small, i didn't set up jsx for it.
                    //ReactDOM.render(<SkillsCellRenderer params={params}/>, eCell);
                    // we want to know when the row is taken out of the grid, so that we do React cleanup
                    params.api.addVirtualRowListener('virtualRowRemoved', params.rowIndex, function () {
                        ReactDOM.unmountComponentAtNode(eCell);
                    });
                });
                // return null to the grid, as we don't want it responsible for rendering
                return null;
            };
        }
        react.reactCellRendererFactory = reactCellRendererFactory;
    })(react = ag.react || (ag.react = {}));
})(ag || (ag = {}));
var React = require('react');
var ReactDOM = require('react-dom');
var ag;
(function (ag) {
    var react;
    (function (react) {
        // wraps the provided React filter component
        function reactFilterFactory(reactComponent) {
            var FilterWrapper = (function () {
                function FilterWrapper() {
                }
                FilterWrapper.prototype.init = function (params) {
                    this.eGui = document.createElement('div');
                    this.backingInstance = ReactDOM.render(React.createElement(reactComponent, { params: params }), this.eGui);
                    if (typeof this.backingInstance.init === 'function') {
                        this.backingInstance.init(params);
                    }
                };
                FilterWrapper.prototype.getGui = function () {
                    return this.eGui;
                };
                FilterWrapper.prototype.isFilterActive = function () {
                    if (typeof this.backingInstance.isFilterActive === 'function') {
                        return this.backingInstance.isFilterActive();
                    }
                    else {
                        return false;
                    }
                };
                FilterWrapper.prototype.doesFilterPass = function (params) {
                    if (typeof this.backingInstance.doesFilterPass === 'function') {
                        return this.backingInstance.doesFilterPass(params);
                    }
                    else {
                        return true;
                    }
                };
                FilterWrapper.prototype.getApi = function () {
                    if (typeof this.backingInstance.getApi === 'function') {
                        return this.backingInstance.getApi();
                    }
                    else {
                        return undefined;
                    }
                };
                // optional methods
                FilterWrapper.prototype.afterGuiAttached = function (params) {
                    if (typeof this.backingInstance.afterGuiAttached === 'function') {
                        return this.backingInstance.afterGuiAttached(params);
                    }
                };
                FilterWrapper.prototype.onNewRowsLoaded = function () {
                    if (typeof this.backingInstance.onNewRowsLoaded === 'function') {
                        return this.backingInstance.onNewRowsLoaded();
                    }
                };
                FilterWrapper.prototype.onAnyFilterChanged = function () {
                    if (typeof this.backingInstance.onAnyFilterChanged === 'function') {
                        return this.backingInstance.onAnyFilterChanged();
                    }
                };
                FilterWrapper.prototype.destroy = function () {
                    if (typeof this.backingInstance.destroy === 'function') {
                        this.backingInstance.destroy();
                    }
                    ReactDOM.unmountComponentAtNode(this.eGui);
                };
                return FilterWrapper;
            })();
            return FilterWrapper;
        }
        react.reactFilterFactory = reactFilterFactory;
    })(react = ag.react || (ag.react = {}));
})(ag || (ag = {}));
