import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';

export interface ITooltipParams {
    api: any;
    columnApi: any;
    colDef: any;
    column: any;
    context: any;
    location?: string;
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
