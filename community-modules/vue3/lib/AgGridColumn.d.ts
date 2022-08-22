import { ColDef } from '@ag-grid-community/core';
export declare class AgGridColumn {
    static hasChildColumns(slots: any): any;
    static mapChildColumnDefs(slots: any): any;
    static toColDef(column: any): ColDef;
    private static getChildColDefs;
    private static createColDefFromGridColumn;
}
