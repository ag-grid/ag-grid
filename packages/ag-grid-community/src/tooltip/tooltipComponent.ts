import type { IComponent, TooltipPosition } from 'ag-stack';

import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { Column, ColumnGroup, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IRowNode } from '../interfaces/iRowNode';

export type { TooltipPosition } from 'ag-stack';

export type TooltipLocation =
    | 'advancedFilter'
    | 'calculatedColumnAutocomplete'
    | 'calculatedColumnExpression'
    | 'cell'
    | 'cellEditor'
    | 'cellFormula'
    | 'columnToolPanelColumn'
    | 'columnToolPanelColumnGroup'
    | 'dialog'
    | 'filterToolPanelColumnGroup'
    | 'filter'
    | 'filterValidation'
    | 'floatingFilter'
    | 'fullWidthRow'
    | 'fullRowEditor'
    | 'header'
    | 'headerGroup'
    | 'input'
    | 'listItem'
    | 'menu'
    | 'pagination'
    | 'pivotColumnsList'
    | 'rowGroupColumnsList'
    | 'richSelectListItem'
    | 'richSelectValue'
    | 'select'
    | 'setFilterValue'
    | 'sideBar'
    | 'toolbar'
    | 'valueColumnsList'
    | 'UNKNOWN';

export type BuiltInTooltipControl =
    | 'firstPage'
    | 'previousPage'
    | 'nextPage'
    | 'lastPage'
    | 'columnMenu'
    | 'filter'
    | 'sort'
    | 'groupExpand'
    | 'expandAll'
    | 'columnSelectAll'
    | 'columnSelect'
    | 'rowGroupExpand'
    | 'filterExpand'
    | 'filterRemove'
    | 'selectAll'
    | 'selectRow'
    | 'resizeColumn'
    | 'rowDrag'
    | 'floatingFilterValue'
    | 'pivotMode'
    | 'remove'
    | 'drag'
    | 'close'
    | 'maximize'
    | 'findPrevious'
    | 'findNext'
    | 'clear'
    | 'toolbarAction'
    | 'toolbarMenu'
    | 'toolPanel';

interface TooltipCommonParams<TData, TValue, TContext> extends AgGridCommon<TData, TContext> {
    /** What part of the application is showing the tooltip, e.g. 'cell', 'header', or 'menu'. */
    location: TooltipLocation;
    /** The formatted source value, when available. */
    valueFormatted?: string | null;
    /** Column / ColumnGroup definition. */
    colDef?: ColDef<TData, TValue> | ColGroupDef<TData> | null;
    /** Column / ColumnGroup */
    column?: Column<TValue> | ColumnGroup | ProvidedColumnGroup;
    /** The index of the row containing the cell rendering the tooltip. */
    rowIndex?: number;
    /** The row node. */
    node?: IRowNode<TData>;
    /** Data for the row node in question. */
    data?: TData;
}

export interface TooltipCallbackParams<TData = any, TValue = any, TContext = any> extends TooltipCommonParams<
    TData,
    TValue,
    TContext
> {
    /** The built-in control showing the tooltip. Unset for text tooltips. */
    control?: BuiltInTooltipControl;
    /**
     * The underlying source value, such as a cell value, header display name or list-item value.
     * For message-only tooltips, such as validation errors and button hints, the resolved tooltip content.
     */
    value?: TValue | null;
}

export interface HeaderTooltipCallbackParams<TData = any, TValue = any, TContext = any> extends TooltipCommonParams<
    TData,
    TValue,
    TContext
> {
    /** The displayed header name, independent of the column's cell value type. */
    value?: string | null;
}

export interface TooltipPositionParams<TData = any, TValue = any, TContext = any> extends TooltipCallbackParams<
    TData,
    TValue,
    TContext
> {
    /** How the tooltip was opened. Pointer and touch activation use `hover`. */
    trigger: 'hover' | 'focus';
}

export type TooltipPositionCallback<TData = any, TValue = any, TContext = any> = (
    params: TooltipPositionParams<TData, TValue, TContext>
) => TooltipPosition | undefined;

/** Callback used to resolve tooltip content. */
export type TooltipCallbackFunc<TData = any, TValue = any, TContext = any> = (
    params: TooltipCallbackParams<TData, TValue, TContext>
) => any;

/**
 * Tooltip content configuration.
 * - `true`: show the displayed value.
 * - `false`: disable the configured tooltip.
 * - `string`: show static content.
 * - callback: resolve content from the supplied params.
 */
export type TooltipDefinition<TData = any, TValue = any, TContext = any> =
    boolean | string | TooltipCallbackFunc<TData, TValue, TContext>;

/** Header tooltip content configuration, with the same value forms as `TooltipDefinition`. */
export type HeaderTooltipDefinition<TData = any, TValue = any, TContext = any> =
    boolean | string | ((params: HeaderTooltipCallbackParams<TData, TValue, TContext>) => any);

interface TooltipValueParams<TData, TValue, TContext, TTooltipValue> extends TooltipCommonParams<
    TData,
    TValue,
    TContext
> {
    /** The resolved value to render in the tooltip. */
    value?: TTooltipValue | null;
}

/** Resolved tooltip content. `TValue` describes column cells; `TTooltipValue` describes the tooltip payload. */
export interface TooltipContentParams<
    TData = any,
    TValue = any,
    TContext = any,
    TTooltipValue = TValue,
> extends TooltipValueParams<TData, TValue, TContext, TTooltipValue> {
    /** The built-in control showing the tooltip. Unset for text tooltips. */
    control?: BuiltInTooltipControl;
}

export interface ITooltipParams<
    TData = any,
    TValue = any,
    TContext = any,
    TTooltipValue = TValue,
> extends TooltipValueParams<TData, TValue, TContext, TTooltipValue> {
    /** A callback function that hides the tooltip. */
    hideTooltipCallback?: () => void;
}

export interface ITooltipComp<TData = any, TValue = any, TContext = any> extends IComponent<
    ITooltipParams<TData, TValue, TContext>
> {}

export interface IBuiltInTooltipParams<TData = any, TContext = any> extends TooltipCommonParams<TData, any, TContext> {
    /** The tooltip text, localised for built-in control hints. */
    text: string;
    /** The built-in control showing the tooltip. */
    control: BuiltInTooltipControl;
    /** Hides the tooltip without moving focus. */
    hideTooltipCallback: () => void;
}

export interface IBuiltInTooltipComp<TData = any, TContext = any> extends IComponent<
    IBuiltInTooltipParams<TData, TContext>
> {}
