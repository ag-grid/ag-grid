import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ISelectCellEditorParams<TValue = any> {
    /** List of values to display */
    values: TValue[];
    /**
     * The space in pixels between the value display and the list of items.
     * @default 4
     */
    valueListGap?: number;
    /** The maximum height of the list of items. If the value is a `number` it will be
     * treated as pixels, otherwise it should be a valid CSS size string. Default: Height of Popup Parent.
     */
    valueListMaxHeight?: number | string;
    /** The maximum width of the list of items. If the value is a `number` it will be
     * treated as pixels, otherwise it should be a valid CSS size string. Default: Width of the cell being edited.
     */
    valueListMaxWidth?: number | string;
}
interface SelectCellEditorParams<TData = any, TValue = any, TContext = any> extends ISelectCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private valueService;
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
