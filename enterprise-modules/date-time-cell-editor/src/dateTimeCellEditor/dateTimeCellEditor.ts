import {
    ICellEditor,
    PopupComponent,
    RefSelector,
    _,
    ICellEditorParams
} from "@ag-grid-community/core";

export class DateTimeCellEditor extends PopupComponent implements ICellEditor {

    // tab index is needed so we can focus, which is needed for keyboard events
    private static TEMPLATE =
        `<div class="ag-date-time-cell-editor" tabindex="0">
            <button ref="eClickButton">click!</button>
        </div>`;

    @RefSelector("eClickButton") eClickButton: HTMLButtonElement;

    private params: ICellEditorParams;
    private cancelled = false;
    private value: Date;

    constructor() {
        super(DateTimeCellEditor.TEMPLATE);
    }

    public init(params: ICellEditorParams): void {
        this.params = params;
        this.value = new Date(this.params.value);
        if (isNaN(this.value.getTime())) {
            this.value = new Date();
        }
    }

    public isPopup() {
        return true;
    }

    public isCancelAfterEnd() {
        return this.cancelled;
    }

    public getValue(): any {
        return this.value;
    }
}
