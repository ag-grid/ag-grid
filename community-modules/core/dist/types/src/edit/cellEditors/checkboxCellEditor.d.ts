import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import { PopupComponent } from '../../widgets/popupComponent';
export declare class CheckboxCellEditor extends PopupComponent implements ICellEditorComp {
    constructor();
    private readonly eCheckbox;
    private params;
    init(params: ICellEditorParams<any, boolean>): void;
    getValue(): boolean | undefined;
    focusIn(): void;
    afterGuiAttached(): void;
    isPopup(): boolean;
    private setAriaLabel;
}
