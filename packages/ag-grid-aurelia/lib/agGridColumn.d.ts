// ag-grid-aurelia v19.1.2
import { ColDef } from "ag-grid-community";
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
    private static getChildColDefs;
    private createColDefFromGridColumn;
}
//# sourceMappingURL=agGridColumn.d.ts.map