// ag-grid-react v19.1.2
import * as React from "react";
import * as AgGrid from "ag-grid-community";
import { GridOptions } from "ag-grid-community";
export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
}
export declare class AgGridReact extends React.Component<AgGridReactProps, {}> {
    props: any;
    state: any;
    static propTypes: any;
    gridOptions: AgGrid.GridOptions;
    api: AgGrid.GridApi;
    columnApi: AgGrid.ColumnApi;
    protected eGridDiv: HTMLElement;
    constructor(props: any, state: any);
    render(): React.ReactElement<any>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    shouldComponentUpdate(): boolean;
    componentWillReceiveProps(nextProps: any): void;
    componentWillUnmount(): void;
    static unwrapStringOrNumber(obj: any): any;
    copy(value: any): any;
    areEquivalent(a: any, b: any): boolean;
    static areEquivalent(a: any, b: any): boolean;
}
//# sourceMappingURL=agGridReact.d.ts.map