import { PopupComponent } from "../widgets/popupComponent";
import { IComponent } from "../interfaces/iComponent";
import { DynamicComponentParams } from "../components/framework/componentResolver";

export interface ITooltipParams extends DynamicComponentParams {
    value?: any;
    valueFormatted?: any;
    context?: any;
}

export interface ITooltipComp extends IComponent<ITooltipParams> {}

export class TooltipComponent extends PopupComponent implements ITooltipComp {

    constructor() {
        super(`<div class="ag-tooltip"></div>`);
    }

    // will need to type params
    public init(params: ITooltipParams): void {
        const { value } = params;
        this.getGui().innerHTML = value;
    }
}