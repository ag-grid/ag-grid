import type { ICellEditorComp, ICellEditorParams } from '../interfaces/iCellEditor';
import type { AgAbstractField } from './agAbstractField';
import { PopupComponent } from './popupComponent';

export abstract class AgAbstractCellEditor<P extends ICellEditorParams = any, TValue = any>
    extends PopupComponent
    implements ICellEditorComp
{
    protected abstract eEditor: AgAbstractField<any, any, any>;
    protected params: P;

    protected abstract initialiseEditor(params: P): void;

    public abstract getValidationElement(): HTMLElement | HTMLInputElement;
    public abstract getValue(): TValue | null | undefined;
    public abstract getValidationErrors(): string[] | null;

    public errorMessages: string[] | null = null;

    public init(params: P) {
        this.params = params;
        this.initialiseEditor(params);
        this.eEditor.onValueChange(() => params.validate());
    }

    public override destroy(): void {
        this.errorMessages = null;
    }
}
