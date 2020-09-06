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
export interface ITooltipComp extends IComponent<ITooltipParams> {
}
export declare class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor();
    init(params: ITooltipParams): void;
}
