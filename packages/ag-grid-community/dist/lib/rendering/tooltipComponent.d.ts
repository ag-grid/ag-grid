// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../widgets/popupComponent";
import { IComponent } from "../interfaces/iComponent";
export interface ITooltipParams {
    api: any;
    columnApi: any;
    colDef: any;
    column: any;
    context: any;
    value?: any;
    valueFormatted?: any;
    rowIndex?: number;
    node?: any;
    data?: any;
    $scope?: any;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
