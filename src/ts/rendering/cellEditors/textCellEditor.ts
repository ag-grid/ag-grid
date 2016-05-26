import {Constants} from "../../constants";
import {Component} from "../../widgets/component";
import {ICellEditor} from "./iCellEditor";
import {Utils as _} from '../../utils';

export class TextCellEditor extends Component implements ICellEditor {

    private static TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';

    private highlightAllOnFocus: boolean;
    private putCursorAtEndOnFocus: boolean;

    constructor() {
        super(TextCellEditor.TEMPLATE);
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
            if (params.keyPress === Constants.KEY_F2) {
                this.putCursorAtEndOnFocus = true;
            } else {
                this.highlightAllOnFocus = true;
            }
        }

        if (_.exists(startValue)) {
            eInput.value = startValue;
        }

        this.addDestroyableEventListener(eInput, 'keydown', (event: KeyboardEvent)=> {
            var isNavigationKey = event.keyCode===Constants.KEY_LEFT || event.keyCode===Constants.KEY_RIGHT;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });
    }

    public afterGuiAttached(): void {
        var eInput = <HTMLInputElement> this.getGui();
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        } else {
            // when we started editing, we want the carot at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the carot
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            var length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length,length);
            }
        }
    }

    public getValue(): any {
        var eInput = <HTMLInputElement> this.getGui();
        return eInput.value;
    }
}