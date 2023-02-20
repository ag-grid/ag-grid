import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { escapeString } from '../utils/string';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';
import { AgGridCommon } from '../interfaces/iCommon';
import { IRowNode } from '../interfaces/iRowNode';

export interface ITooltipParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** What part of the application is showing the tooltip, e.g. 'cell', 'header', 'menuItem' etc */
    location: string;
    /** The value to be rendered by the tooltip. */
    value?: TValue;
    /** The formatted value to be rendered by the tooltip. */
    valueFormatted?: string | null;
    /** Column / ColumnGroup definition. */
    colDef?: ColDef<TData, TContext> | ColGroupDef<TData, TContext> | null;
    /** Column / ColumnGroup */
    column?: Column | ColumnGroup;
    /** The index of the row containing the cell rendering the tooltip. */
    rowIndex?: number;
    /** The row node. */
    node?: IRowNode<TData>;
    /** Data for the row node in question. */
    data?: TData;
}

export interface ITooltipComp extends IComponent<ITooltipParams> { }

export class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor() {
        super(/* html */`<div class="ag-tooltip"></div>`);
    }

    // will need to type params
    public init(params: ITooltipParams): void {
        const { value } = params;
        this.getGui().innerHTML = escapeString(value) as string;
    }
}
