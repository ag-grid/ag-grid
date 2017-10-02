// ag-grid-react v13.3.0
/// <reference types="react" />
import { Component } from "react";
import * as AgGrid from "ag-grid";
import { GridOptions } from "ag-grid";
export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
}
export declare class AgGridReact extends Component<AgGridReactProps, {}> {
    props: any;
    state: any;
    static propTypes: any;
    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;
    protected eGridDiv: HTMLElement;
    constructor(props: any, state: any);
    render(): any;
    createStyleForDiv(): any;
    componentDidMount(): void;
    shouldComponentUpdate(): boolean;
    componentWillReceiveProps(nextProps: any): void;
    componentWillUnmount(): void;
    static unwrapStringOrNumber(obj: any): any;
    copyObject(obj: any): any;
    areEquivalent(a: any, b: any): boolean;
    static areEquivalent(a: any, b: any): boolean;
}
