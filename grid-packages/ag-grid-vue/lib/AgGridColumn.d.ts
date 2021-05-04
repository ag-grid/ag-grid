import { ColDef } from 'ag-grid-community';
export declare class AgGridColumn {
    static hasChildColumns(slots: any): boolean;
    static mapChildColumnDefs(slots: any): any;
    static toColDef(column: any): ColDef;
    private static getChildColDefs;
    private static createColDefFromGridColumn;
    private static assign;
}
