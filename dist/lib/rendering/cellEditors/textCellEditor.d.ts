import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    useFormatter: boolean;
}
export declare class TextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE;
    private highlightAllOnFocus;
    private focusAfterAttached;
    private params;
    private eInput;
    constructor();
    init(params: ITextCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    private getStartValue;
    isPopup(): boolean;
}
