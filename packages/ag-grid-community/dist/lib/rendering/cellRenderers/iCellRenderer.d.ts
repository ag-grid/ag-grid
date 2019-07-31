// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "../../interfaces/iComponent";
import { RowNode } from "../../entities/rowNode";
import { ColDef } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";
export interface ICellRendererParams {
    value: any;
    valueFormatted: any;
    getValue: () => any;
    setValue: (value: any) => void;
    formatValue: (value: any) => any;
    data: any;
    node: RowNode;
    colDef: ColDef;
    column: Column;
    $scope: any;
    rowIndex: number;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    refreshCell: () => void;
    eGridCell: HTMLElement;
    eParentOfValue: HTMLElement;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
}
export interface ICellRenderer {
    /** Get the cell to refresh. Return true if successful. Return false if not (or you don't have refresh logic),
     * then the grid will refresh the cell for you. */
    refresh(params: any): boolean;
}
export interface ICellRendererComp extends ICellRenderer, IComponent<ICellRendererParams> {
}
export interface ICellRendererFunc {
    (params: any): HTMLElement | string;
}
