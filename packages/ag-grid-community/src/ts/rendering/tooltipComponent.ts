import { PopupComponent } from "../widgets/popupComponent";
import { IComponent } from "../interfaces/iComponent";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { EventService } from "../eventService";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { PopupService } from "../widgets/popupService";

import { _ } from '../utils';

export interface ITooltipParams {}

export interface ITooltipComp extends IComponent<ITooltipParams> {}

export class TooltipComponent extends PopupComponent implements ITooltipComp {

    constructor() {
        super(`<div class="ag-tooltip">${Math.random()}</div>`);
    }

    // will need to type params
    public init(params: any): void {
        let tooltip = this.getGui().getAttribute('data-tooltip');
        this.getGui().innerText = tooltip;
    }
}