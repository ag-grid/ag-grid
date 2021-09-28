import { ICellRendererComp, ICellRendererFunc } from '../rendering/cellRenderers/iCellRenderer';
import { ColDef, ValueFormatterParams } from '../entities/colDef';
import { IProvidedFilterParams } from '../filter/provided/providedFilter';
export interface SetFilterValuesFuncParams {
    /** The function to call with the values to load into the filter once they are ready. */
    success: (values: string[]) => void;
    /** The column definition from which the set filter is invoked. */
    colDef: ColDef;
}
export declare type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export declare type SetFilterValues = SetFilterValuesFunc | any[];
export interface ISetFilterParams extends IProvidedFilterParams {
    /**
     * The values to display in the Filter List.
     * If this is not set, the filter will takes its values from what is loaded in the table.
     */
    values?: SetFilterValues;
    /**
     * Refresh the values every time the Set filter is opened.
     */
    refreshValuesOnOpen?: boolean;
    /** The height of values in the Filter List in pixels. */
    cellHeight?: number;
    /**
     * If `true`, the Set Filter values will not be sorted.
     * Use this if you are providing your own values and don't want them sorted as you are providing in the order you want.
     * Default: false
     */
    suppressSorting?: boolean;
    /**
     * Similar to the Cell Renderer for the grid.
     * Setting it separately here allows for the value to be rendered differently in the filter.
     */
    cellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** Set to `true` to hide the Mini Filter.
     * Default: `false`
     */
    suppressMiniFilter?: boolean;
    /**
     * Set to `true` to apply the Set Filter immediately when the user is typing in the Mini Filter.
     * Default: `false`
     */
    applyMiniFilterWhileTyping?: boolean;
    /**
     * Set to `true` to remove the Select All checkbox.
     * Default: `false`
     */
    suppressSelectAll?: boolean;
    /** By default, when the Set Filter is opened all values are shown selected. Set this to `true` to instead show all values as de-selected by default. */
    defaultToNothingSelected?: boolean;
    /**
     * Comparator for sorting.
     * If not provided, the Column Definition comparator is used.
     * If Column Definition comparator is also not provided, the default (grid provided) comparator is used.
     */
    comparator?: (a: any, b: any) => number;
    /**
     * If specified, this formats the text before applying the Mini Filter compare logic, useful for instance to substitute accented characters.
     */
    textFormatter?: (from: string) => string;
    valueFormatter?: (params: ValueFormatterParams) => string;
    /**
     * If `true`, hovering over a value in the Set Filter will show a tooltip containing the full, untruncated value.
     * Default: `false`
     */
    showTooltips?: boolean;
    /** Changes the behaviour of the Set Filter to match that of Excel's AutoFilter. */
    excelMode?: 'mac' | 'windows';
    /** @deprecated */ suppressRemoveEntries?: boolean;
    /** @deprecated */ suppressSyncValuesAfterDataChange?: boolean;
    /** @deprecated */ selectAllOnMiniFilter?: boolean;
    /** @deprecated */ syncValuesLikeExcel?: boolean;
}
