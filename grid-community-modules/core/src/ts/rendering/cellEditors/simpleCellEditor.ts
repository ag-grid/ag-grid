import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputTextField } from "../../widgets/agInputTextField";
import { RefSelector } from "../../widgets/componentAnnotations";
import { exists } from "../../utils/generic";
import { isBrowserSafari } from "../../utils/browser";
import { KeyCode } from '../../constants/keyCode';
import { ITextCellEditorParams } from "./textCellEditor";

export interface ISimpleCellEditorParams extends ICellEditorParams {
    /** If `true`, the editor will use the provided `colDef.valueFormatter` to format the value displayed in the editor.
     * Used when the cell value needs formatting prior to editing, such as when using reference data and you
     * want to display text rather than code. */
    useFormatter: boolean;
}

export interface CellEditorInput<TValue, P extends ISimpleCellEditorParams, I extends AgInputTextField> {
    getTemplate(): string;
    init(eInput: I, params: P): void;
    getValue(): TValue;
    getStartValue(): string | undefined;
}

export class SimpleCellEditor<TValue, P extends ISimpleCellEditorParams, I extends AgInputTextField> extends PopupComponent implements ICellEditorComp {
    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    protected params: ICellEditorParams;
    @RefSelector('eInput') protected eInput: I;

    constructor(protected cellEditorInput: CellEditorInput<TValue, P, I>) {
        super(/* html */`
            <div class="ag-cell-edit-wrapper">
                ${cellEditorInput.getTemplate()}
            </div>`
        );
    }

    public init(params: P): void {
        this.params = params;

        const eInput = this.eInput;
        this.cellEditorInput.init(eInput, params);
        let startValue: string | undefined;

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

        this.addManagedListener(eInput.getGui(), 'keydown', (event: KeyboardEvent) => {
            const { key } = event;

            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    }

    public afterGuiAttached(): void {
        const translate = this.localeService.getLocaleTextFunc();
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
        return this.cellEditorInput.getValue();
    }

    private getStartValue(params: ITextCellEditorParams): string | undefined {
        const formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : this.cellEditorInput.getStartValue();
    }
    public isPopup() {
        return false;
    }
}
