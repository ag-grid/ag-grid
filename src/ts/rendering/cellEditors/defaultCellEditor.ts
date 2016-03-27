import {Constants} from "../../constants";
import {Component} from "../../widgets/component";
import {ICellEditor} from "./iCellEditor";

export class DefaultCellEditor extends Component implements ICellEditor {

    private static TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';

    private highlightAllOnFocus: boolean;

    constructor() {
        super(DefaultCellEditor.TEMPLATE);
    }

    public init(params: any): void {

        var eInput = <HTMLInputElement> this.getGui();
        var startValue: string;

        var keyPressBackspaceOrDelete =
            params.keyPress === Constants.KEY_BACKSPACE
            || params.keyPress === Constants.KEY_DELETE;

        if (keyPressBackspaceOrDelete) {
            startValue = '';
        } else if (params.charPress) {
            startValue = params.charPress;
        } else {
            startValue = params.value;
            this.highlightAllOnFocus = true;
        }

        eInput.value = startValue;

        eInput.style.width = (params.column.getActualWidth() - 14) + 'px';
    }

    public afterGuiAttached(): void {
        var eInput = <HTMLInputElement> this.getGui();
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        } else {
            // this puts the carot at the end of the first character, which
            // is needed if the user started typing, otherwise in IE, if user
            // typed 'apply', what would end up in the cell would be 'pplea'
            eInput.setSelectionRange(1,1);
        }
    }

    public getValue(): any {
        var eInput = <HTMLInputElement> this.getGui();
        return eInput.value;
    }
}