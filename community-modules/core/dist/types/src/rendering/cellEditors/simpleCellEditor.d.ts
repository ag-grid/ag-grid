import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputTextField } from "../../widgets/agInputTextField";
export interface CellEditorInput<TValue, P extends ICellEditorParams, I extends AgInputTextField> {
    getTemplate(): string;
    init(eInput: I, params: P): void;
    getValue(): TValue | null | undefined;
    getStartValue(): string | null | undefined;
    setCaret?(): void;
}
export declare class SimpleCellEditor<TValue, P extends ICellEditorParams, I extends AgInputTextField> extends PopupComponent implements ICellEditorComp {
    protected cellEditorInput: CellEditorInput<TValue, P, I>;
    private highlightAllOnFocus;
    private focusAfterAttached;
    protected params: ICellEditorParams;
    protected eInput: I;
    constructor(cellEditorInput: CellEditorInput<TValue, P, I>);
    init(params: P): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): TValue | null | undefined;
    isPopup(): boolean;
}
