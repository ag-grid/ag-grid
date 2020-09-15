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

export interface ITooltipComp extends IComponent<ITooltipParams> { }

export class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor() {
        super(/* html */`<div class="ag-tooltip"></div>`);
    }

    // will need to type params
    public init(params: ITooltipParams): void {
        const { value } = params;
        this.getGui().innerHTML = value;
    }
}
