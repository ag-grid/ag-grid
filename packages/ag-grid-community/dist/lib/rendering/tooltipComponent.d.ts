// Type definitions for ag-grid-community v20.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../widgets/popupComponent";
import { IComponent } from "../interfaces/iComponent";
import { DynamicComponentParams } from "../components/framework/componentResolver";
export interface ITooltipParams extends DynamicComponentParams {
    value?: any;
    valueFormatted?: any;
    context?: any;
}
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
