import { IComponent } from "../../interfaces/iComponent";
import { RowNode } from "../../entities/rowNode";
import { ColDef } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columns/columnApi";
export interface ICellRendererParams {
    /** Value to be rendered. */
    value: any;
    /** Formatted value to be rendered. */
    valueFormatted: any;
    /** True if this is a full width row. */
    fullWidth?: boolean;
    /** Pinned state of the cell. */
    pinned?: string | null;
    /** The row's data. */
    data: any;
    /** The row node. */
    node: RowNode;
    /** The current index of the row (this changes after filter and sort). */
    rowIndex: number;
    /** The cell's column definition. */
    colDef?: ColDef;
    /** The cell's column. */
    column?: Column;
    /** AngularJS scope - null if not using AngularJS, this is legacy and not used if not */
    $scope: any;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context`. */
    context: any;
    /** The grid's cell, a DOM div element. */
    eGridCell: HTMLElement;
    /** The parent DOM item for the cell renderer, same as eGridCell unless using checkbox selection. */
    eParentOfValue: HTMLElement;
    /** Convenience function to get most recent up to date value. */
    getValue?: () => any;
    /** Convenience function to set the value. */
    setValue?: (value: any) => void;
    /** Convenience function to format a value using the column's formatter. */
    formatValue?: (value: any) => any;
    /** Convenience function to refresh the cell. */
    refreshCell?: () => void;
    /**
     * registerRowDragger:
     * @param rowDraggerElement The HTMLElement to be used as Row Dragger
     * @param dragStartPixels The amount of pixels required to start the drag (Default: 4)
     * @param value The value to be displayed while dragging. Note: Only relevant with Full Width Rows.
     * @param suppressVisibilityChange Set to `true` to prevent the Grid from hiding the Row Dragger when it is disabled.
     */
    registerRowDragger: (rowDraggerElement: HTMLElement, dragStartPixels?: number, value?: string, suppressVisibilityChange?: boolean) => void;
}
export interface ISetFilterCellRendererParams {
    value: any;
    valueFormatted: any;
    api: GridApi;
    /** The cell's column definition. */
    colDef?: ColDef;
    /** The cell's column. */
    column?: Column;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
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
    (params: ICellRendererParams): HTMLElement | string;
}
