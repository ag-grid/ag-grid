var React = require('react');
var ReactDOM = require('react-dom');
var AgGrid = require('ag-grid');

module ag.react {

    export var AgGridReact = React.createClass({

        render: function() {
            return React.DOM.div({
                style: this.props.style,
                className: this.props.className
            });
        },

        componentDidMount: function() {
            var domNode = ReactDOM.findDOMNode(this);
            this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
            new AgGrid.Grid(domNode, this.gridOptions);

            this.api = this.gridOptions.api;
            this.columnApi = this.gridOptions.columnApi;
        },

        getCallbackForEvent: function(eventName: string) {
            if (!eventName || eventName.length < 2) {
                return eventName;
            } else {
                return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
            }
        },

        // duplicated, taken from gridOptionsWrapper
        globalEventListener: function(eventName: string, event: any) {
            var callbackMethodName = this.getCallbackForEvent(eventName);
            var callbackFromProps = this.props[callbackMethodName];
            if (callbackFromProps) {
                callbackFromProps(event);
            }

        },

        shouldComponentUpdate: function() {
            // we want full control of the dom, as ag-Grid doesn't use React internally,
            // so for performance reasons we tell React we don't need render called after
            // property changes.
            return false;
        },

        componentWillReceiveProps: function(nextProps: any) {
            // keeping consistent with web components, put changing
            // values in currentValue and previousValue pairs and
            // not include items that have not changed.
            var changes = <any>{};
            AgGrid.ComponentUtil.ALL_PROPERTIES.forEach( (propKey: string)=> {
                if (this.props[propKey]!==nextProps[propKey]) {
                    changes[propKey] = {
                        previousValue: this.props[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            });
            AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        },

        componentWillUnmount: function() {
            this.api.destroy();
        }
    });

    AgGridReact.propTypes = {
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        gridOptions: React.PropTypes.object,

        // we should iterate through all the properties and add them here
        onReady: React.PropTypes.func,
        showToolPanel: React.PropTypes.bool
    };

//
//ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES
//    .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
//    .forEach( (propKey)=> {
//        agGridReactNoType.propTypes[propKey] = React.PropTypes.bool;
//    });

//ComponentUtil.SIMPLE_PROPERTIES
//    .concat(ComponentUtil.WITH_IMPACT_STRING_PROPERTIES)
//    .forEach( (propKey)=> {
//        AgGridReact.propTypes[propKey] = React.PropTypes.bool;
//    });

//.concat(ComponentUtil.)
//.concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
//.concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
//.concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
//.concat(ComponentUtil.CALLBACKS),

}
