// ag-grid-react v22.0.0
import { Component } from "react";
import * as AgGrid from "@ag-community/grid-core";
import { ColDef, ColGroupDef } from "@ag-community/grid-core";
export interface AgGridColumnProps extends ColDef {
}
export interface AgGridColumnGroupProps extends ColGroupDef {
}
export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    props: any;
    state: any;
    constructor(props: any, state: any);
    render(): any;
    static mapChildColumnDefs(columnProps: any): AgGrid.ColDef[];
    static toColDef(columnProps: any): ColDef;
    static hasChildColumns(columnProps: any): boolean;
    private static getChildColDefs;
    private static createColDefFromGridColumn;
    private static assign;
}
