import { Constants } from "../../constants";
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { _ } from '../../utils';

/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    useFormatter: boolean;
}

export class TextCellEditor extends PopupComponent implements ICellEditorComp {

    private static TEMPLATE = '<div class="ag-input-wrapper"><input class="ag-cell-edit-input" type="text"/></div>';

    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    private params: ICellEditorParams;
    private eInput: HTMLInputElement;

    constructor() {
        super(TextCellEditor.TEMPLATE);
        this.eInput = this.getGui().querySelector('input') as HTMLInputElement;
    }

    public init(params: ITextCellEditorParams): void {

        this.params = params;

        const eInput = this.eInput;
        let startValue: string;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;

            const keyPressBackspaceOrDelete =
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

        this.addDestroyableEventListener(eInput, 'keydown', (event: KeyboardEvent) => {
            const isNavigationKey = event.keyCode === Constants.KEY_LEFT
                || event.keyCode === Constants.KEY_RIGHT
                || event.keyCode === Constants.KEY_UP
                || event.keyCode === Constants.KEY_DOWN
                || event.keyCode === Constants.KEY_PAGE_DOWN
                || event.keyCode === Constants.KEY_PAGE_UP
                || event.keyCode === Constants.KEY_PAGE_HOME
                || event.keyCode === Constants.KEY_PAGE_END;
            if (isNavigationKey) {
                // this stops the grid from executing keyboard navigation
                event.stopPropagation();

                // this stops the browser from scrolling up / down
                const pageUp = event.keyCode === Constants.KEY_PAGE_UP;
                const pageDown = event.keyCode === Constants.KEY_PAGE_DOWN;
                if (pageUp || pageDown) {
                    event.preventDefault();
                }
            }
        });
    }

    public afterGuiAttached(): void {
        if (!this.focusAfterAttached) { return; }

        const eInput = this.eInput;
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        } else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the caret
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            const length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length, length);
            }
        }
    }

    // gets called when tabbing trough cells and in full row edit mode
    public focusIn(): void {
        const eInput = this.eInput;
        eInput.focus();
        eInput.select();
    }

    public getValue(): any {
        const eInput = this.eInput;
        return this.params.parseValue(eInput.value);
    }

    private getStartValue(params: ITextCellEditorParams) {
        const formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    }
    public isPopup() {
        return false;
    }
}