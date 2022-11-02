import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputTextField } from "../../widgets/agInputTextField";
import { RefSelector } from "../../widgets/componentAnnotations";
import { exists } from "../../utils/generic";
import { isBrowserSafari } from "../../utils/browser";
import { KeyCode } from '../../constants/keyCode';
import { getLocaleTextFunc } from '../../localeFunctions';

/**
 * useFormatter: used when the cell value needs formatting prior to editing, such as when using reference data and you
 *               want to display text rather than code.
*/
export interface ITextCellEditorParams extends ICellEditorParams {
    useFormatter: boolean;
    maxLength?: number
}

export class TextCellEditor extends PopupComponent implements ICellEditorComp {

    private static TEMPLATE = /* html */
        `<div class="ag-cell-edit-wrapper">
            <ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field>
        </div>`;

    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    protected params: ICellEditorParams;
    @RefSelector('eInput') protected eInput: AgInputTextField;

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

            if (params.eventKey === KeyCode.BACKSPACE || params.eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (params.charPress) {
                startValue = params.charPress;
            } else {
                startValue = this.getStartValue(params);

                if (params.eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }

        } else {
            this.focusAfterAttached = false;
            startValue = this.getStartValue(params);
        }

        if (startValue != null) {
            eInput.setValue(startValue, true);
        }

        if (params.maxLength != null) {
            eInput.setMaxLength(params.maxLength);
        }

        this.addManagedListener(eInput.getGui(), 'keydown', (event: KeyboardEvent) => {
            const { key } = event;

            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    }

    public afterGuiAttached(): void {
        const translate = getLocaleTextFunc(this.gridOptionsService);
        const eInput = this.eInput;

        eInput.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (!this.focusAfterAttached) { return; }
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focused before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focusing then blurring an empty field will cause the parent container to scroll.
        if (!isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }

        const inputEl = eInput.getInputElement();

        if (this.highlightAllOnFocus) {
            inputEl.select();
        } else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios:
            //   a) when user hits F2
            //   b) when user hits a printable character
            const value = eInput.getValue();
            const len = (exists(value) && value.length) || 0;

            if (len) {
                inputEl.setSelectionRange(len, len);
            }
        }
    }

    // gets called when tabbing trough cells and in full row edit mode
    public focusIn(): void {
        const eInput = this.eInput;
        const focusEl = eInput.getFocusableElement();
        const inputEl = eInput.getInputElement();

        focusEl.focus();
        inputEl.select();
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
