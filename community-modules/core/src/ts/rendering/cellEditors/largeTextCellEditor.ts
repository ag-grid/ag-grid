import { PopupComponent } from "../../widgets/popupComponent";
import { Constants } from "../../constants";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { _ } from "../../utils";
import { RefSelector } from "../../widgets/componentAnnotations";

export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}

export class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE =
        `<div class="ag-large-text" tabindex="0">
            <textarea ref="eTextArea" class="ag-large-text-input"></textarea>
        </div>`;

    private params: ILargeTextEditorParams;
    @RefSelector("eTextArea") private eTextArea: HTMLTextAreaElement;
    private focusAfterAttached: boolean;

    constructor() {
        super(LargeTextCellEditor.TEMPLATE);
    }

    public init(params:ILargeTextEditorParams): void {
        this.params = params;

        this.focusAfterAttached = params.cellStartedEdit;

        this.eTextArea.maxLength = params.maxLength ? params.maxLength : 200;
        this.eTextArea.cols = params.cols ? params.cols : 60;
        this.eTextArea.rows = params.rows ? params.rows : 10;

        if (_.exists(params.value)) {
            this.eTextArea.value = params.value.toString();
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
            this.eTextArea.focus();
        }
    }

    public getValue(): any {
        return this.params.parseValue(this.eTextArea.value);
    }
}
