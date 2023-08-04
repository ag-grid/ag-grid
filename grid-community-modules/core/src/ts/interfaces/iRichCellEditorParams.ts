import { AgRichSelectValue } from "../widgets/agRichSelect";
import { ICellEditorParams } from "./iCellEditor";

export interface IRichCellEditorParams extends ICellEditorParams {
/** The list of values to be selected from. */
    values: AgRichSelectValue[];
/** The row height, in pixels, of each value. */
    cellHeight: number;
/** The cell renderer to use to render each value. Cell renderers are useful for rendering rich HTML values, or when processing complex data. */
    cellRenderer: any;
/** The value in `ms` for the fuzzy search debounce delay. Default: `300` */
    searchDebounceDelay?: number;
    /** A callback function that allows you to change the displayed value for simple data. */
    formatValue: (value: any) => any;
}
