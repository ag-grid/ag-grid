// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IComponent } from "../../interfaces/iComponent";
import { RowNode } from "../../entities/rowNode";
import { ColDef } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnController";
export interface ICellRendererParams {
    value: any;
    valueFormatted: any;
    valueGetter: () => any;
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
    /** Get the cell to refresh. If this method is not provided, then when refresh is needed, the grid
     * will remove the component from the DOM and create a new component in it's place with the new values. */
    refresh?(params: any): void;
}
export interface ICellRendererComp extends ICellRenderer, IComponent<ICellRendererParams> {
}
export interface ICellRendererFunc {
    (params: any): HTMLElement | string;
}
