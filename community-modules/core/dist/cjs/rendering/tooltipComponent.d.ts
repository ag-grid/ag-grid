// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
export interface ITooltipParams {
    location: string;
    api?: any;
    columnApi?: any;
    context?: any;
    colDef?: any;
    column?: any;
    value?: any;
    valueFormatted?: any;
    rowIndex?: number;
    node?: any;
    data?: any;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
