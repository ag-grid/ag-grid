import {ReactFrameworkFactory} from "./reactFrameworkFactory";
import {ReactFrameworkComponentWrapper} from "./reactFrameworkComponentWrapper";

import * as DOM from 'react-dom-factories';
import {Component} from "react";
import * as PropTypes from "prop-types";
import * as AgGrid from "ag-grid";
import {GridOptions} from "ag-grid";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions
}

export class AgGridReact extends Component<AgGridReactProps, {}> {
    static propTypes: any;

    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;

    protected eGridDiv: HTMLElement;

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return DOM.div({
            style: this.createStyleForDiv(),
            ref: e => {
                this.eGridDiv = e;
            }
        });
    }

    createStyleForDiv() {
        const style: any = {height: '100%'};
        // allow user to override styles
        const containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(key => {
                style[key] = containerStyle[key];
            });
        }
        return style;
    }

    componentDidMount() {
        const reactFrameworkFactory = new ReactFrameworkFactory(this);

        const gridParams = {
            frameworkFactory: reactFrameworkFactory,
            seedBeanInstances:{
                agGridReact: this
            }
        };

        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(this.props.gridOptions, this.props);
        AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);

        // don't need the return value
        new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);

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
        let debugLogging = !!nextProps.debug;

        // keeping consistent with web components, put changing
        // values in currentValue and previousValue pairs and
        // not include items that have not changed.
        const changes = <any>{};
        AgGrid.ComponentUtil.ALL_PROPERTIES.forEach((propKey: string) => {
            if (!this.areEquivalent(this.props[propKey], nextProps[propKey])) {
                if (debugLogging) {
                    console.log(`agGridReact: [${propKey}] property changed`);
                }
                changes[propKey] = {
                    previousValue: this.props[propKey],
                    currentValue: nextProps[propKey]
                };
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach((funcName: string) => {
            if (this.props[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }
                changes[funcName] = {
                    previousValue: this.props[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });

        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
    }

    componentWillUnmount() {
        if (this.api){
            this.api.destroy();
        }
    }

    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    static unwrapStringOrNumber(obj) {
        return (obj instanceof Number || obj instanceof String
            ? obj.valueOf()
            : obj);
    }

    // sigh, here for ie compatibility
    copyObject(obj) {
        if (!obj) {
            return obj;
        }
        return [{}, obj].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }

    areEquivalent(a, b) {
        return AgGridReact.areEquivalent(this.copyObject(a), this.copyObject(b))
    }

    static areEquivalent(a, b) {
        a = AgGridReact.unwrapStringOrNumber(a);
        b = AgGridReact.unwrapStringOrNumber(b);
        if (a === b) return true; //e.g. a and b both null
        if (a === null || b === null || typeof (a) !== typeof (b)) return false;
        if (a instanceof Date)
            return b instanceof Date && a.valueOf() === b.valueOf();
        if (typeof (a) !== "object")
            return a == b; //for boolean, number, string, xml

        const newA = (a.areEquivalent_Eq_91_2_34 === undefined),
            newB = (b.areEquivalent_Eq_91_2_34 === undefined);
        try {
            let prop;
            if (newA) a.areEquivalent_Eq_91_2_34 = [];
            else if (a.areEquivalent_Eq_91_2_34.some(
                    function (other) {
                        return other === b;
                    })) return true;
            if (newB) b.areEquivalent_Eq_91_2_34 = [];
            else if (b.areEquivalent_Eq_91_2_34.some(
                    function (other) {
                        return other === a;
                    })) return true;
            a.areEquivalent_Eq_91_2_34.push(b);
            b.areEquivalent_Eq_91_2_34.push(a);

            const tmp = {};
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
        } finally {
            if (newA) delete a.areEquivalent_Eq_91_2_34;
            if (newB) delete b.areEquivalent_Eq_91_2_34;
        }
    }
}


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
    listOfProps.forEach((propKey: string) => {
        AgGridReact[propKey] = propType;
    });
}

