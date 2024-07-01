import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import { PopupComponent } from '../../widgets/popupComponent';
import type { CellEditorInput } from './iCellEditorInput';
export declare class SimpleCellEditor<TValue, P extends ICellEditorParams, I extends AgInputTextField> extends PopupComponent implements ICellEditorComp {
    protected cellEditorInput: CellEditorInput<TValue, P, I>;
    private highlightAllOnFocus;
    private focusAfterAttached;
    protected params: ICellEditorParams;
    protected readonly eInput: I;
    constructor(cellEditorInput: CellEditorInput<TValue, P, I>);
    init(params: P): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): TValue | null | undefined;
    isPopup(): boolean;
}
