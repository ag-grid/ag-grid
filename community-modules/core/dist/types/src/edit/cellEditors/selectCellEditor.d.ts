import type { BeanCollection } from '../../context/context';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import { PopupComponent } from '../../widgets/popupComponent';
import type { ISelectCellEditorParams } from './iSelectCellEditor';
interface SelectCellEditorParams<TData = any, TValue = any, TContext = any> extends ISelectCellEditorParams<TValue>, ICellEditorParams<TData, TValue, TContext> {
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private valueService;
    wireBeans(beans: BeanCollection): void;
    private readonly eSelect;
    private startedByEnter;
    constructor();
    init(params: SelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    isPopup(): boolean;
}
export {};
