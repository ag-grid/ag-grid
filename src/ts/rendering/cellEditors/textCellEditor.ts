import {Constants} from "../../constants";
import {Component} from "../../widgets/component";
import {ICellEditorComp, ICellEditorParams} from "./iCellEditor";
import {Utils as _} from '../../utils';

/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    useFormatter: boolean;
}

export class TextCellEditor extends Component implements ICellEditorComp {

    private static TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';

    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    private params: ICellEditorParams;

    constructor() {
        super(TextCellEditor.TEMPLATE);
    }

    public init(params: ITextCellEditorParams): void {

        this.params = params;

        let eInput = <HTMLInputElement> this.getGui();
        let startValue: string;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {

            this.focusAfterAttached = true;

            let keyPressBackspaceOrDelete =
                params.keyPress === Constants.KEY_BACKSPACE
                || params.keyPress === Constants.KEY_DELETE;

            if (keyPressBackspaceOrDelete) {
                startValue = '';
            } else if (params.charPress) {
                startValue = params.charPress;
            } else {
                startValue = this.getStartValue(params);
                if (params.keyPress !== Constants.KEY_F2) {
                    this.highlightAllOnFocus = true;
                }
            }

        } else {
            this.focusAfterAttached = false;
            startValue = this.getStartValue(params);
        }

        if (_.exists(startValue)) {
            eInput.value = startValue;
        }

        this.addDestroyableEventListener(eInput, 'keydown', (event: KeyboardEvent)=> {
            let isNavigationKey = event.keyCode===Constants.KEY_LEFT
                || event.keyCode===Constants.KEY_RIGHT
                || event.keyCode===Constants.KEY_UP
                || event.keyCode===Constants.KEY_DOWN
                || event.keyCode===Constants.KEY_PAGE_DOWN
                || event.keyCode===Constants.KEY_PAGE_UP
                || event.keyCode===Constants.KEY_PAGE_HOME
                || event.keyCode===Constants.KEY_PAGE_END;
            if (isNavigationKey) {
                // this stops the grid from executing keyboard navigation
                event.stopPropagation();

                // this stops the browser from scrolling up / down
                let pageUp = event.keyCode===Constants.KEY_PAGE_UP;
                let pageDown = event.keyCode===Constants.KEY_PAGE_DOWN;
                if (pageUp || pageDown) {
                    event.preventDefault();
                }
            }
        });
    }

    public afterGuiAttached(): void {
        if (!this.focusAfterAttached) { return; }

        let eInput = <HTMLInputElement> this.getGui();
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        } else {
            // when we started editing, we want the carot at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the carot
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            let length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length,length);
            }
        }
    }

    // gets called when tabbing trough cells and in full row edit mode
    public focusIn(): void {
        let eInput = <HTMLInputElement> this.getGui();
        eInput.focus();
        eInput.select();
    }

    public getValue(): any {
        let eInput = <HTMLInputElement> this.getGui();
        return this.params.parseValue(eInput.value);
    }

    private getStartValue(params: ITextCellEditorParams) {
        let formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    }
}