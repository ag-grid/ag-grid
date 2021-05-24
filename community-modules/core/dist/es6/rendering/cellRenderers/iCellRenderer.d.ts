// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "../../interfaces/iComponent";
import { RowNode } from "../../entities/rowNode";
import { ColDef } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";
export interface ICellRendererParams {
    fullWidth?: boolean;
    pinned?: string | null;
    value: any;
    valueFormatted: any;
    data: any;
    node: RowNode;
    colDef?: ColDef;
    column?: Column;
    $scope: any;
    rowIndex: number;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    eGridCell: HTMLElement;
    eParentOfValue: HTMLElement;
    getValue?: () => any;
    setValue?: (value: any) => void;
    formatValue?: (value: any) => any;
    refreshCell?: () => void;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
    /**
     * registerRowDragger: Function
     * @param rowDraggerElement The HTMLElement to be used as Row Dragger
     * @param dragStartPixels The amount of pixels required to start the drag (Default: 4)
     * @param value The value to be displayed while dragging. Note: Only relevant with Full Width Rows.
     */
    registerRowDragger: (rowDraggerElement: HTMLElement, dragStartPixels?: number, value?: string) => void;
}
export interface ISetFilterCellRendererParams {
    value: any;
    valueFormatted: any;
    api?: GridApi | null;
    context: any;
}
export interface ICellRenderer {
    /** Get the cell to refresh. Return true if successful. Return false if not (or you don't have refresh logic),
     * then the grid will refresh the cell for you. */
    refresh(params: ICellRendererParams): boolean;
}
export interface ICellRendererComp extends ICellRenderer, IComponent<ICellRendererParams> {
}
export interface ICellRendererFunc {
    (params: any): HTMLElement | string;
}
