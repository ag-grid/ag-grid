// ag-grid-aurelia v13.2.0
import { ColDef } from "ag-grid/main";
import { AgCellTemplate, AgEditorTemplate, AgFilterTemplate } from "./agTemplate";
export declare class AgGridColumn {
    private mappedColumnProperties;
    childColumns: AgGridColumn[];
    cellTemplate: AgCellTemplate;
    editorTemplate: AgEditorTemplate;
    filterTemplate: AgFilterTemplate;
    constructor();
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private static getChildColDefs(childColumns);
    private createColDefFromGridColumn();
}
