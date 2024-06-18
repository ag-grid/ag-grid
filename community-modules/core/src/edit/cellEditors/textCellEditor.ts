import { _exists } from '../../utils/generic';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import { AgInputTextFieldSelector } from '../../widgets/agInputTextField';
import type { CellEditorInput } from './iCellEditorInput';
import type { ITextCellEditorParams } from './iTextCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

class TextCellEditorInput<TValue = any>
    implements CellEditorInput<TValue, ITextCellEditorParams<any, TValue>, AgInputTextField>
{
    private eInput: AgInputTextField;
    private params: ITextCellEditorParams<any, TValue>;

    public getTemplate() {
        return /* html */ `<ag-input-text-field class="ag-cell-editor" data-ref="eInput"></ag-input-text-field>`;
    }
    public getAgComponents() {
        return [AgInputTextFieldSelector];
    }

    public init(eInput: AgInputTextField, params: ITextCellEditorParams<any, TValue>): void {
        this.eInput = eInput;
        this.params = params;
        if (params.maxLength != null) {
            eInput.setMaxLength(params.maxLength);
        }
    }

    public getValue(): TValue | null | undefined {
        const value = this.eInput.getValue();
        if (!_exists(value) && !_exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value!);
    }

    public getStartValue(): string | null | undefined {
        const formatValue = this.params.useFormatter || this.params.column.getColDef().refData;
        return formatValue ? this.params.formatValue(this.params.value) : (this.params.value as any);
    }

    public setCaret(): void {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const value = this.eInput.getValue();
        const len = (_exists(value) && value.length) || 0;

        if (len) {
            this.eInput.getInputElement().setSelectionRange(len, len);
        }
    }
}

export class TextCellEditor extends SimpleCellEditor<any, ITextCellEditorParams, AgInputTextField> {
    constructor() {
        super(new TextCellEditorInput());
    }
}
