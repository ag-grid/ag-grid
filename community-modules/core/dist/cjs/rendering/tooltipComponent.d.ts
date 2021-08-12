// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { GridApi } from '../gridApi';
import { ColumnApi } from '../columns/columnApi';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';
export interface ITooltipParams {
    location: string;
    api?: GridApi;
    columnApi?: ColumnApi;
    context?: any;
    colDef?: ColDef | ColGroupDef | null;
    column?: Column | ColumnGroup;
    value?: any;
    valueFormatted?: any;
    rowIndex?: number;
    node?: RowNode;
    data?: any;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
