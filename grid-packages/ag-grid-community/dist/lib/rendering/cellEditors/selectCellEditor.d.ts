import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ISelectCellEditorParams<TValue = any> {
    /** List of values to display */
    values: TValue[];
    /** The space in pixels between the value display and the list of items. Default: `4` */
    valueListGap?: number;
}
interface SelectCellEditorParams<TData = any, TValue = any, TContext = any> extends ISelectCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private valueFormatterService;
    private eSelect;
    private startedByEnter;
    constructor();
    init(params: SelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    isPopup(): boolean;
}
export {};
