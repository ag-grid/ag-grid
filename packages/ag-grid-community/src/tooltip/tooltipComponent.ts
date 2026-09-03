import type { IComponent } from 'ag-stack';

import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { Column, ColumnGroup, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IRowNode } from '../interfaces/iRowNode';

export type TooltipLocation =
    | 'advancedFilter'
    | 'calculatedColumnAutocomplete'
    | 'calculatedColumnExpression'
    | 'cell'
    | 'cellEditor'
    | 'cellFormula'
    | 'columnToolPanelColumn'
    | 'columnToolPanelColumnGroup'
    | 'filterToolPanelColumnGroup'
    | 'filter'
    | 'fullWidthRow'
    | 'fullRowEditor'
    | 'header'
    | 'headerGroup'
    | 'listItem'
    | 'menu'
    | 'pivotColumnsList'
    | 'rowGroupColumnsList'
    | 'richSelectListItem'
    | 'richSelectValue'
    | 'select'
    | 'setFilterValue'
    | 'valueColumnsList'
    | 'UNKNOWN';

export interface TooltipCallbackParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** What part of the application is showing the tooltip, e.g. 'cell', 'header', or 'menu'. */
    location: TooltipLocation;
    /** The source value. For cell tooltips, this is the cell value before tooltip content is resolved. */
    value?: TValue | null;
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
    | boolean
    | string
    | TooltipCallbackFunc<TData, TValue, TContext>;

export interface ITooltipParams<TData = any, TValue = any, TContext = any> extends TooltipCallbackParams<
    TData,
    TValue,
    TContext
> {
    /** The resolved value to render in the tooltip. */
    value?: TValue | null;
    /** A callback function that hides the tooltip. */
    hideTooltipCallback?: () => void;
}

export interface ITooltipComp extends IComponent<ITooltipParams> {}
