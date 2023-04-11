import { AgInputTextField } from "../../widgets/agInputTextField";
import { CellEditorInput, ISimpleCellEditorParams, SimpleCellEditor } from "./simpleCellEditor";

export interface ITextCellEditorParams extends ISimpleCellEditorParams {
    /** Max number of characters to allow. Default: `524288` */
    maxLength?: number
}

class TextCellEditorInput implements CellEditorInput<any, ITextCellEditorParams, AgInputTextField> {
    eInput: AgInputTextField;
    params: ITextCellEditorParams;

    public getTemplate() {
        return /* html */`<ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field>`;
    }

    public init(eInput: AgInputTextField, params: ITextCellEditorParams): void {
        this.eInput = eInput;
        this.params = params;
        if (params.maxLength != null) {
            eInput.setMaxLength(params.maxLength);
        }
    }

    public getValue(): any {
        return this.params.parseValue(this.eInput.getValue());
    }

    public getStartValue(): string | undefined {
        return this.params.value;
    }
}

export class TextCellEditor extends SimpleCellEditor<any, ITextCellEditorParams, AgInputTextField> {
    constructor() {
        super(new TextCellEditorInput());
    }
}
