import { AgInputTextArea } from "../../widgets/agInputTextArea";
import { Constants } from "../../constants";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { _ } from "../../utils";

export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}

export class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE =
        `<div class="ag-large-text" tabindex="0">
            <ag-input-text-area ref="eTextArea" class="ag-large-text-input"></ag-input-text-area>
        </div>`;

    private params: ILargeTextEditorParams;
    @RefSelector("eTextArea") private eTextArea: AgInputTextArea;
    private focusAfterAttached: boolean;

    constructor() {
        super(LargeTextCellEditor.TEMPLATE);
    }

    public init(params:ILargeTextEditorParams): void {
        this.params = params;

        this.focusAfterAttached = params.cellStartedEdit;

        this.eTextArea
            .setMaxLength(params.maxLength || 200)
            .setCols(params.cols || 60)
            .setRows(params.rows || 10);

        if (_.exists(params.value)) {
            this.eTextArea.setValue(params.value.toString(), true);
        }

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    }

    private onKeyDown(event:KeyboardEvent): void {
        const key = event.which || event.keyCode;
        if (key == Constants.KEY_LEFT ||
            key == Constants.KEY_UP ||
            key == Constants.KEY_RIGHT ||
            key == Constants.KEY_DOWN ||
            (event.shiftKey && key == Constants.KEY_ENTER)) { // shift+enter allows for newlines
            event.stopPropagation();
        }
    }

    public afterGuiAttached(): void {
        if (this.focusAfterAttached) {
            this.eTextArea.getFocusableElement().focus();
        }
    }

    public getValue(): any {
        return this.params.parseValue(this.eTextArea.getValue());
    }
}
