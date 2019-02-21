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
