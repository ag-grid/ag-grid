import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ISelectCellEditorParams extends ICellEditorParams {
    /** List of values to display */
    values: any[];
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private valueFormatterService;
    private eSelect;
    private startedByEnter;
    constructor();
    init(params: ISelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    isPopup(): boolean;
}
