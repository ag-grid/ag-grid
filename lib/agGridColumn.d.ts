// ag-grid-aurelia v13.3.0
import { ColDef } from "ag-grid/main";
import { AgCellTemplate, AgEditorTemplate, AgFilterTemplate, AgHeaderGroupTemplate, AgHeaderTemplate } from "./agTemplate";
export declare class AgGridColumn {
    private mappedColumnProperties;
    childColumns: AgGridColumn[];
    cellTemplate: AgCellTemplate;
    editorTemplate: AgEditorTemplate;
    filterTemplate: AgFilterTemplate;
    headerTemplate: AgHeaderTemplate;
    headerGroupTemplate: AgHeaderGroupTemplate;
    constructor();
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private static getChildColDefs(childColumns);
    private createColDefFromGridColumn();
}
