// ag-grid-aurelia v14.2.0
import { ColDef } from "ag-grid/main";
import { AgCellTemplate, AgEditorTemplate, AgFilterTemplate, AgHeaderGroupTemplate, AgHeaderTemplate, AgPinnedRowTemplate } from "./agTemplate";
export declare class AgGridColumn {
    private mappedColumnProperties;
    childColumns: AgGridColumn[];
    cellTemplate: AgCellTemplate;
    editorTemplate: AgEditorTemplate;
    filterTemplate: AgFilterTemplate;
    headerTemplate: AgHeaderTemplate;
    headerGroupTemplate: AgHeaderGroupTemplate;
    pinnedRowTemplate: AgPinnedRowTemplate;
    constructor();
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private static getChildColDefs(childColumns);
    private createColDefFromGridColumn();
}
