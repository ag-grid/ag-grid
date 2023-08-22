import { ICellEditorParams } from "./iCellEditor";
export interface IRichCellEditorParams<TValue = any> {
    /** The list of values to be selected from. */
    values: TValue[];
    /** The row height, in pixels, of each value. */
    cellHeight: number;
    /** The cell renderer to use to render each value. Cell renderers are useful for rendering rich HTML values, or when processing complex data. */
    cellRenderer: any;
    /** The value in `ms` for the fuzzy search debounce delay. Default: `300` */
    searchDebounceDelay?: number;
    /** The space in pixels between the value display and the list of items. Default: `4` */
    valueListGap?: number;
    /** A callback function that allows you to change the displayed value for simple data. */
    formatValue: (value: TValue | null | undefined) => string;
}
export interface RichCellEditorParams<TData = any, TValue = any, TContext = any> extends IRichCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {
}
