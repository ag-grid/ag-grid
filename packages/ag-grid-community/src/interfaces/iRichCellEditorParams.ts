import type { AgPickerFieldParams } from '../agWidgets/agPickerFieldParams';
import type { AgComponentSelectorType } from '../widgets/component';
import type { ICellEditorParamsShared } from './iCellEditor';
import type { ICellEditorRendererParams } from './iCellEditorRenderer';

export interface IRichCellEditorRendererParams<TValue> extends ICellEditorRendererParams<TValue> {
    cellRendererParams: any;
}

export interface RichSelectParams<TValue = any> extends AgPickerFieldParams<AgComponentSelectorType> {
    value?: TValue[] | TValue | null;
    valueList?: TValue[];
    onSearch?: (search?: string) => void;
    cellRenderer?: any;
    cellRendererParams?: any;

    cellRowHeight?: number;
    searchDebounceDelay?: number;

    allowTyping?: boolean;
    filterList?: boolean;
    searchType?: 'match' | 'matchAny' | 'fuzzy';
    highlightMatch?: boolean;
    multiSelect?: boolean;
    suppressDeselectAll?: boolean;
    suppressMultiSelectPillRenderer?: boolean;

    placeholder?: string;
    initialInputValue?: string;

    valueFormatter?: (value: TValue[] | TValue | null | undefined) => string;
    searchStringCreator?: (values: TValue[]) => string[];
    allowNoResultsCopy?: boolean;
}

export interface RichCellEditorValuesCallbackParams<TData = any, TValue = any> extends RichCellEditorParams<
    TData,
    TValue
> {
    /** The current search string entered by the user. Is always defined when async filtering is enabled. */
    search?: string;
}

export type RichCellEditorValuesCallback<TData = any, TValue = any> = (
    params: RichCellEditorValuesCallbackParams<TData, TValue>
) => TValue[] | Promise<TValue[]>;

export interface RichCellEditorValuesPageParams<TData = any, TValue = any> extends RichCellEditorParams<TData, TValue> {
    /** The current search string. Empty string means unfiltered values. */
    search: string;
    /** The first row index requested (inclusive). */
    startRow: number;
    /** The last row index requested (exclusive). */
    endRow: number;
    /** Opaque continuation token returned by the previous page. */
    cursor?: string | null;
}

export interface RichCellEditorValuesPageResult<TValue = any> {
    /** The page of values returned by the server. */
    values: TValue[];
    /** Optional absolute row index where data ends. */
    lastRow?: number;
    /** Optional continuation token for the next page. */
    cursor?: string | null;
}

export type RichCellEditorValuesPageCallback<TData = any, TValue = any> = (
    params: RichCellEditorValuesPageParams<TData, TValue>
) => RichCellEditorValuesPageResult<TValue> | Promise<RichCellEditorValuesPageResult<TValue>>;

export type RichCellEditorValuesPageStartRowCallback<TValue = any> = (
    value: TValue[] | TValue | null | undefined
) => number;

export interface IRichCellEditorParams<TData = any, TValue = any, GValue = any> {
    /** The list of values to be selected from. Required when `valuesPage` is not provided. */
    values?: TValue[] | RichCellEditorValuesCallback<TData, TValue>;
    /**
     * Optional paged datasource for very large value lists.
     * When provided, values are loaded incrementally and additional pages are requested as the user scrolls.
     * If both `values` and `valuesPage` are set, `valuesPage` takes precedence.
     */
    valuesPage?: RichCellEditorValuesPageCallback<TData, TValue>;
    /**
     * Initial page start row when using `valuesPage`.
     * Can be a fixed number or a callback that derives the start row from the current editor value.
     * Only applied for the initial, unfiltered load. Filtered searches always start from row `0`.
     * @default 0
     */
    valuesPageInitialStartRow?: number | RichCellEditorValuesPageStartRowCallback<TValue>;
    /**
     * Number of rows requested per page when using `valuesPage`.
     * @default 100
     */
    valuesPageSize?: number;
    /**
     * Number of rows from the end of the loaded list at which the next page is requested.
     * @default 10
     */
    valuesPageLoadThreshold?: number;
    /** The row height, in pixels, of each value. */
    cellHeight?: number;
    /** The cell renderer to use to render each value. Cell renderers are useful for rendering rich HTML values, or when processing complex data. */
    cellRenderer?: any;
    /** The custom parameters to be used by the cell render. */
    cellRendererParams?: any;

    /**
     * Set to `true` to be able to type values in the display area.
     * @default false
     */
    allowTyping?: boolean;
    /**
     * If `true` it will filter the list of values as you type (only relevant when `allowTyping=true`).
     * @default false
     */
    filterList?: boolean;
    /**
     * Set to `true` to enable asynchronous filtering of values via the `values` or `valuesPage` callback.
     * (only relevant when `allowTyping=true` and `filterList=true`).
     * @default false
     */
    filterListAsync?: boolean;
    /**
     * The type of search algorithm that is used when searching for values.
     *  - `match` - Matches if the value starts with the text typed.
     *  - `matchAny` - Matches if the value contains the text typed.
     *  - `fuzzy` - Matches the closest value to text typed.
     * Note: When a cellRenderer is specified, this option will not work.
     * @default 'fuzzy'
     */
    searchType?: 'match' | 'matchAny' | 'fuzzy';
    /**
     * If `true`, each item on the list of values will highlight the part of the text that matches the input.
     * Note: It only makes sense to use this option when `filterList` is `true` and `searchType` is **not** `fuzzy`.
     * @default false
     */
    highlightMatch?: boolean;
    /**
     * If `true` this component will allow multiple items from the list of values to be selected.
     */
    multiSelect?: boolean;
    /**
     * If `true` the option to remove all selected options will not be displayed.
     * Note: This feature only works when `multiSelect=true`.
     */
    suppressDeselectAll?: boolean;
    /**
     * When `multiSelect=true` the editor will automatically show the selected items as "pills". Set this property to `true` suppress this behaviour.
     */
    suppressMultiSelectPillRenderer?: boolean;
    /**
     * The value in `ms` for the search algorithm debounce delay
     * @default 300
     */
    searchDebounceDelay?: number;
    /** A string value to be used when no value has been selected. */
    valuePlaceholder?: string;
    /**
     * The space in pixels between the value display and the list of items.
     * @default 4
     */
    valueListGap?: number;
    /**
     * The maximum height of the list of items. If the value is a `number` it will be
     * treated as pixels, otherwise it should be a valid CSS size string.
     * @default 'calc(var(--ag-row-height) * 6.5)'
     */
    valueListMaxHeight?: number | string;
    /** The maximum width of the list of items. If the value is a `number` it will be
     * treated as pixels, otherwise it should be a valid CSS size string. Default: Width of the cell being edited.
     */
    valueListMaxWidth?: number | string;

    /** A callback function that allows you to change the displayed value for simple data. */
    formatValue?: (value: TValue | null | undefined) => string;

    /**
     * A callback function that allows you to convert the value of the Rich Select Editor to
     * the data format of the Grid Column when they are different.
     */
    parseValue?: (value: TValue[] | TValue | null | undefined) => GValue;
}

export interface RichCellEditorParams<TData = any, TValue = any, TContext = any>
    extends IRichCellEditorParams<TData, TValue>, ICellEditorParamsShared<TData, TValue, TContext> {}
