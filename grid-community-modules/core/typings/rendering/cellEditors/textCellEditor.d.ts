import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputTextField } from "../../widgets/agInputTextField";
/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    /** If `true`, the editor will use the provided `colDef.valueFormatter` to format the value displayed in the editor. */
    useFormatter: boolean;
    /** Max number of characters to allow. Default: `524288` */
    maxLength?: number;
}
export declare class TextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE;
    private highlightAllOnFocus;
    private focusAfterAttached;
    protected params: ICellEditorParams;
    protected eInput: AgInputTextField;
    constructor();
    init(params: ITextCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    private getStartValue;
    isPopup(): boolean;
}
