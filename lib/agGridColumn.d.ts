// ag-grid-react v14.2.0
/// <reference types="react" />
import { Component } from "react";
import { ColDef, ColGroupDef } from "ag-grid";
export interface AgGridColumnProps extends ColDef, ColGroupDef {
}
export declare class AgGridColumn extends Component<AgGridColumnProps, {}> {
    props: any;
    state: any;
    constructor(props: any, state: any);
    render(): any;
    static mapChildColumnDefs(columnProps: any): ColDef[];
    static toColDef(columnProps: any): ColDef;
    static hasChildColumns(columnProps: any): boolean;
    private static getChildColDefs(columnChildren);
    private static createColDefFromGridColumn(columnProps);
    private static assign(colDef, from);
}
