import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';
import { AgGridCommon } from '../interfaces/iCommon';
export interface ITooltipParams extends AgGridCommon {
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
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
