// ag-grid-react v12.0.0
/// <reference types="react" />
import * as React from "react";
import { Component } from "react";
import * as AgGrid from "ag-grid";
export declare class AgGridReact extends Component<any, any> {
    props: any;
    state: any;
    static propTypes: any;
    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;
    protected eGridDiv: HTMLElement;
    constructor(props: any, state: any);
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    shouldComponentUpdate(): boolean;
    componentWillReceiveProps(nextProps: any): void;
    componentWillUnmount(): void;
    static unwrapStringOrNumber(obj: any): any;
    areEquivalent(a: any, b: any): boolean;
}
