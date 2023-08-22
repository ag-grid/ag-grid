import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';
import { AgGridCommon } from '../interfaces/iCommon';
import { IRowNode } from '../interfaces/iRowNode';
export declare type TooltipLocation = 'advancedFilter' | 'cell' | 'columnToolPanelColumn' | 'columnToolPanelColumnGroup' | 'filterToolPanelColumnGroup' | 'header' | 'headerGroup' | 'menu' | 'pivotColumnsList' | 'rowGroupColumnsList' | 'setFilterValue' | 'valueColumnsList' | 'UNKNOWN';
export interface ITooltipParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** What part of the application is showing the tooltip, e.g. 'cell', 'header', 'menuItem' etc */
    location: TooltipLocation;
    /** The value to be rendered by the tooltip. */
    value?: TValue | null;
    /** The formatted value to be rendered by the tooltip. */
    valueFormatted?: string | null;
    /** Column / ColumnGroup definition. */
    colDef?: ColDef<TData, TValue> | ColGroupDef<TData> | null;
    /** Column / ColumnGroup */
    column?: Column<TValue> | ColumnGroup;
    /** The index of the row containing the cell rendering the tooltip. */
    rowIndex?: number;
    /** The row node. */
    node?: IRowNode<TData>;
    /** Data for the row node in question. */
    data?: TData;
    /** A callback function that hides the tooltip */
    hideTooltipCallback?: () => void;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
