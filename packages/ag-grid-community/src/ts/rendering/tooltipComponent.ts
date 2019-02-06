import { PopupComponent } from "../widgets/popupComponent";
import { IComponent } from "../interfaces/iComponent";

import { _ } from '../utils';
import { DynamicComponentParams } from "../components/framework/componentResolver";

export interface ITooltipParams extends DynamicComponentParams {}

export interface ITooltipComp extends IComponent<ITooltipParams> {}

export class TooltipComponent extends PopupComponent implements ITooltipComp {

    constructor() {
        super(`<div class="ag-tooltip"></div>`);
    }

    // will need to type params
    public init(params: ITooltipParams): void {
        const { data } = params ;
        this.getGui().innerHTML = data;
    }
}