import { PopupComponent } from "../../widgets/popupComponent";
import { Constants } from "../../constants";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { _ } from "../../utils";

export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}

export class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE =
        // tab index is needed so we can focus, which is needed for keyboard events
        '<div class="ag-large-text" tabindex="0">' +
        '<div class="ag-large-textarea"></div>' +
        '</div>';

    private params: ILargeTextEditorParams;
    private textarea: any;
    private focusAfterAttached: boolean;

    constructor() {
        super(LargeTextCellEditor.TEMPLATE);
    }

    public init(params:ILargeTextEditorParams): void {
        this.params = params;

        this.focusAfterAttached = params.cellStartedEdit;

        this.textarea = document.createElement("textarea");
        this.textarea.maxLength = params.maxLength ? params.maxLength : "200";
        this.textarea.cols = params.cols ? params.cols : "60";
        this.textarea.rows = params.rows ? params.rows : "10";

        if (_.exists(params.value)) {
            this.textarea.value = params.value.toString();
        }

        this.getGui().querySelector('.ag-large-textarea').appendChild(this.textarea);

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
            this.textarea.focus();
        }
    }

    public getValue(): any {
        return this.params.parseValue(this.textarea.value);
    }
}
