import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputTextField } from "../../widgets/agInputTextField";
import { CellEditorInput, SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";

export interface ITextCellEditorParams<TData = any, TValue = any, TContext = any> extends ICellEditorParams<TData, TValue, TContext> {
    /** If `true`, the editor will use the provided `colDef.valueFormatter` to format the value displayed in the editor.
     * Used when the cell value needs formatting prior to editing, such as when using reference data and you
     * want to display text rather than code. */
    useFormatter: boolean;

    /**
     * Max number of characters to allow.
     * @default 524288
     */
    maxLength?: number
}

class TextCellEditorInput<TValue = any> implements CellEditorInput<TValue, ITextCellEditorParams<any, TValue>, AgInputTextField> {
    private eInput: AgInputTextField;
    private params: ITextCellEditorParams<any, TValue>;

    public getTemplate() {
        return /* html */`<ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field>`;
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
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value!);
    }

    public getStartValue(): string | null | undefined {
        const formatValue = this.params.useFormatter || this.params.column.getColDef().refData;
        return formatValue ? this.params.formatValue(this.params.value) : this.params.value as any;
    }

    public setCaret(): void {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const value = this.eInput.getValue();
        const len = (exists(value) && value.length) || 0;

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
