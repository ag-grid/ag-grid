import type { ICellEditorComp } from '../../interfaces/iCellEditor';
import { PopupComponent } from '../../widgets/popupComponent';
import type { ILargeTextEditorParams } from './iLargeTextCellEditor';
export declare class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private readonly eTextArea;
    private params;
    private focusAfterAttached;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown;
    afterGuiAttached(): void;
    getValue(): any;
}
