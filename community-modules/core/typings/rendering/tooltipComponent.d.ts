import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { GridApi } from '../gridApi';
import { ColumnApi } from '../columns/columnApi';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';
export interface ITooltipParams {
    /** What part of the application is showing the tooltip, e.g. 'cell', 'header', 'menuItem' etc */
    location: string;
    /** The value to be rendered by the tooltip. */
    value?: any;
    /** The formatted value to be rendered by the tooltip. */
    valueFormatted?: any;
    /** Column / ColumnGroup definition. */
    colDef?: ColDef | ColGroupDef | null;
    /** Column / ColumnGroup */
    column?: Column | ColumnGroup;
    /** The index of the row containing the cell rendering the tooltip. */
    rowIndex?: number;
    /** The row node. */
    node?: RowNode;
    /** Data for the row node in question. */
    data?: any;
    /** Context as set on gridOptions.context. */
    context?: any;
    api?: GridApi;
    columnApi?: ColumnApi;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
