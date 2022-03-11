// ag-grid-react v27.1.0
import { Component } from 'react';
import { ColDef, ColGroupDef } from 'ag-grid-community';
export interface AgGridColumnProps extends ColDef {
}
export interface AgGridColumnGroupProps extends ColGroupDef {
}
export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    props: any;
    constructor(props: any);
    render(): any;
    static mapChildColumnDefs(children: any): any;
    static toColDef(columnProps: any): ColDef;
    static hasChildColumns(children: any): boolean;
}
