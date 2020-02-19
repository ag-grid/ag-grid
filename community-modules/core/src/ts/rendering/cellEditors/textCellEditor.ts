import { Constants } from "../../constants";
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { _ } from '../../utils';
import { AgInputTextField } from "../../widgets/agInputTextField";
import { RefSelector } from "../../widgets/componentAnnotations";

/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    useFormatter: boolean;
}

export class TextCellEditor extends PopupComponent implements ICellEditorComp {

    private static TEMPLATE = '<div class="ag-cell-edit-wrapper"><ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field></div>';

    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    private params: ICellEditorParams;
    @RefSelector('eInput') private eInput: AgInputTextField;

    constructor() {
        super(TextCellEditor.TEMPLATE);
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
            eInput.setValue(startValue, true);
        }

        this.addDestroyableEventListener(eInput.getGui(), 'keydown', (event: KeyboardEvent) => {
            const pageUp = event.keyCode === Constants.KEY_PAGE_UP;
            const pageDown = event.keyCode === Constants.KEY_PAGE_DOWN;
            if (pageUp || pageDown) {
                event.preventDefault();
            }
        });
    }

    public afterGuiAttached(): void {
        if (!this.focusAfterAttached) { return; }

        const eInput = this.eInput;
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focussed before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focussing then blurring an empty field will cause the parent container to scroll.
        if (!_.isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }

        const inputEl = eInput.getInputElement() as HTMLInputElement;
        if (this.highlightAllOnFocus) {
            inputEl.select();
        } else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the caret
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            const value = eInput.getValue();

            if (value.length) {
                inputEl.setSelectionRange(length, length);
            }
        }
    }

    // gets called when tabbing trough cells and in full row edit mode
    public focusIn(): void {
        const eInput = this.eInput;
        const focusEl = eInput.getFocusableElement();
        const inputEl = eInput.getInputElement() as HTMLInputElement;

        focusEl.focus();
        inputEl.select();
    }

    public focusOut(): void {
        const inputEl = this.eInput.getInputElement() as HTMLInputElement;
        if (_.isBrowserIE()) {
            inputEl.setSelectionRange(0, 0);
        }
    }

    public getValue(): any {
        const eInput = this.eInput;
        return this.params.parseValue(eInput.getValue());
    }

    private getStartValue(params: ITextCellEditorParams) {
        const formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    }
    public isPopup() {
        return false;
    }
}