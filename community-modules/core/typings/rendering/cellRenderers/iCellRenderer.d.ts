import { ColDef } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { AgGridCommon } from "../../interfaces/iCommon";
import { IComponent } from "../../interfaces/iComponent";
export interface ICellRendererParams<TData = any, TValue = any> extends AgGridCommon<TData> {
    /** Value to be rendered. */
    value: TValue;
    /** Formatted value to be rendered. */
    valueFormatted: string | null | undefined;
    /** True if this is a full width row. */
    fullWidth?: boolean;
    /** Pinned state of the cell. */
    pinned?: "left" | "right" | null;
    /** The row's data. Data property can be `undefined` when row grouping or loading infinite row models. */
    data: TData | undefined;
    /** The row node. */
    node: RowNode<TData>;
    /** The current index of the row (this changes after filter and sort). */
    rowIndex: number;
    /** The cell's column definition. */
    colDef?: ColDef;
    /** The cell's column. */
    column?: Column;
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
export interface ISetFilterCellRendererParams<TData = any> extends AgGridCommon<TData> {
    value: any;
    valueFormatted: string | null | undefined;
    /** The cell's column definition. */
    colDef?: ColDef;
    /** The cell's column. */
    column?: Column;
}
export interface ICellRenderer<TData = any> {
    /**
     * Get the cell to refresh. Return true if successful. Return false if not (or you don't have refresh logic),
     * then the grid will refresh the cell for you.
     */
    refresh(params: ICellRendererParams<TData>): boolean;
}
export interface ICellRendererComp<TData = any> extends IComponent<ICellRendererParams<TData>>, ICellRenderer<TData> {
}
export interface ICellRendererFunc<TData = any> {
    (params: ICellRendererParams<TData>): HTMLElement | string;
}
