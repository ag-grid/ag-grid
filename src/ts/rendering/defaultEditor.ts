import {Constants} from "../constants";
import {Component} from "../widgets/component";

export class DefaultEditor extends Component {

    private static TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';

    constructor() {
        super(DefaultEditor.TEMPLATE);
    }

    public init(params: any): void {

        var keyPress = params.keyPress;
        var value = params.value;

        var eInput = <HTMLInputElement> this.getGui();

        var startWithOldValue = keyPress !== Constants.KEY_BACKSPACE && keyPress !== Constants.KEY_DELETE;
        if (startWithOldValue && value !== null && value !== undefined) {
            eInput.value = value;
        }

        eInput.style.width = (params.column.getActualWidth() - 14) + 'px';
    }

    public afterGuiAttached(): void {
        var eInput = <HTMLInputElement> this.getGui();
        eInput.focus();
        eInput.select();
    }

    public getValue(): any {
        var eInput = <HTMLInputElement> this.getGui();
        return eInput.value;
    }
}