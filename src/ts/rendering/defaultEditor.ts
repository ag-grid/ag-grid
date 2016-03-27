import {Constants} from "../constants";
import {Component} from "../widgets/component";

export class DefaultEditor extends Component {

    private static TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';

    private highlightAllOnFocus: boolean;

    constructor() {
        super(DefaultEditor.TEMPLATE);
    }

    public init(params: any): void {

        var keyPress = params.keyPress;
        var charPress = params.charPress;
        var value = params.value;

        var eInput = <HTMLInputElement> this.getGui();

        var startValue: string;
        if (keyPress === Constants.KEY_BACKSPACE || keyPress === Constants.KEY_DELETE) {
            startValue = '';
        } else if (charPress) {
            startValue = charPress;
        } else {
            startValue = value;
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
        }
    }

    public getValue(): any {
        var eInput = <HTMLInputElement> this.getGui();
        return eInput.value;
    }
}