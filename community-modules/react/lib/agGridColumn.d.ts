// @ag-grid-community/react v24.1.1
import { Component } from "react";
import * as AgGrid from "@ag-grid-community/core";
import { ColDef, ColGroupDef } from "@ag-grid-community/core";
export interface AgGridColumnProps extends ColDef {
}
export interface AgGridColumnGroupProps extends ColGroupDef {
}
export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    props: any;
    constructor(props: any);
    render(): any;
    static mapChildColumnDefs(children: any): AgGrid.ColDef[];
    static toColDef(columnProps: any): ColDef;
    static hasChildColumns(children: any): boolean;
}
