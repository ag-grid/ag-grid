import {ReactFrameworkFactory} from './reactFrameworkFactory';
import {ReactFrameworkComponentWrapper} from './reactFrameworkComponentWrapper';

import {Component} from 'react';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as AgGrid from 'ag-grid';

export class AgGridReact extends Component<any, any> {

    static propTypes: any;

    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;

    protected eGridDiv: HTMLElement;

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return React.DOM.div({
            style: this.createStyleForDiv(),
            ref: e => {this.eGridDiv = e;}
        });
    }

    createStyleForDiv() {
        const style: any = {height: '100%'};
        // allow user to override styles
        const containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach( key => {
                const value = containerStyle[key];
                style[key] = value;
            });
        }
        return style;
    }

    componentDidMount() {
        const reactFrameworkFactory = new ReactFrameworkFactory(this);
        const gridParams = {frameworkFactory: reactFrameworkFactory};

        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);

        const grid = new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
    }

    shouldComponentUpdate() {
        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    componentWillReceiveProps(nextProps: any) {
        // keeping consistent with web components, put changing
        // values in currentValue and previousValue pairs and
        // not include items that have not changed.
        const changes = <any>{};
        AgGrid.ComponentUtil.ALL_PROPERTIES.forEach( (propKey: string)=> {
            if (this.props[propKey]!==nextProps[propKey]) {
                changes[propKey] = {
                    previousValue: this.props[propKey],
                    currentValue: nextProps[propKey]
                };
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach( (funcName: string)=> {
            if (this.props[funcName]!==nextProps[funcName]) {
                changes[funcName] = {
                    previousValue: this.props[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });

        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
    }

    componentWillUnmount() {
        this.api.destroy();
    }
};

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

function addProperties(listOfProps: string[], propType: any) {
    listOfProps.forEach( (propKey: string)=> {
        AgGridReact[propKey] = propType;
    });
}