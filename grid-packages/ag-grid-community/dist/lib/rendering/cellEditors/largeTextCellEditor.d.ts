import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}
export declare class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE;
    private params;
    private eTextArea;
    private focusAfterAttached;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown;
    afterGuiAttached(): void;
    getValue(): any;
}
