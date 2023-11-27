import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ILargeTextEditorParams extends ICellEditorParams {
    /**
     * Max number of characters to allow.
     * @default 200
     */
    maxLength: number;
    /**
     * Number of character rows to display.
     * @default 10
     */
    rows: number;
    /**
     * Number of character columns to display.
     * @default 60
     */
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
