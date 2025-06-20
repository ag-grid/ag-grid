import { KeyCode } from '../../constants/keyCode';
import type { DefaultProvidedCellEditorParams, ICellEditorParams } from '../../interfaces/iCellEditor';
import { _isBrowserSafari } from '../../utils/browser';
import { AgAbstractCellEditor } from '../../widgets/agAbstractCellEditor';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import { RefPlaceholder } from '../../widgets/component';
import type { CellEditorInput } from './iCellEditorInput';

export class SimpleCellEditor<
    TValue,
    P extends ICellEditorParams & DefaultProvidedCellEditorParams,
    I extends AgInputTextField,
> extends AgAbstractCellEditor<ICellEditorParams, TValue> {
    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    protected readonly eEditor: I = RefPlaceholder;

    constructor(protected cellEditorInput: CellEditorInput<TValue, P, I>) {
        super();
    }

    public initialiseEditor(params: P): void {
        const { cellEditorInput } = this;

        this.setTemplate(
            { tag: 'div', cls: 'ag-cell-edit-wrapper', children: [cellEditorInput.getTemplate()] },
            cellEditorInput.getAgComponents()
        );

        const { eEditor } = this;
        const { cellStartedEdit, eventKey, suppressPreventDefault } = params;

        // disable initial tooltips added to the input field
        // let the validation handle tooltips.
        eEditor.getInputElement().setAttribute('title', '');

        cellEditorInput.init(eEditor, params);
        let startValue: string | null | undefined;
        let shouldSetStartValue = true;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (cellStartedEdit) {
            this.focusAfterAttached = true;

            if (eventKey === KeyCode.BACKSPACE || eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey && eventKey.length === 1) {
                if (suppressPreventDefault) {
                    shouldSetStartValue = false;
                } else {
                    startValue = eventKey;
                }
            } else {
                startValue = cellEditorInput.getStartValue();

                if (eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        } else {
            this.focusAfterAttached = false;
            startValue = cellEditorInput.getStartValue();
        }

        if (shouldSetStartValue && startValue != null) {
            eEditor.setStartValue(startValue);
        }

        this.addGuiEventListener('keydown', (event: KeyboardEvent) => {
            const { key } = event;

            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    }

    public afterGuiAttached(): void {
        const translate = this.getLocaleTextFunc();
        const eInput = this.eEditor;

        eInput.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (!this.focusAfterAttached) {
            return;
        }
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focused before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focusing then blurring an empty field will cause the parent container to scroll.
        if (!_isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }

        const inputEl = eInput.getInputElement();

        if (this.highlightAllOnFocus) {
            inputEl.select();
        } else {
            this.cellEditorInput.setCaret?.();
        }
    }

    // gets called when tabbing through cells and in full row edit mode
    public focusIn(): void {
        const { eEditor } = this;
        const focusEl = eEditor.getFocusableElement();
        const inputEl = eEditor.getInputElement();

        focusEl.focus();
        inputEl.select();
    }

    public getValue(): TValue | null | undefined {
        return this.cellEditorInput.getValue();
    }

    public override isPopup() {
        return false;
    }

    public getValidationElement(): HTMLInputElement {
        return this.eEditor.getInputElement();
    }

    public getValidationErrors(): string[] | null {
        return this.cellEditorInput.getValidationErrors();
    }
}
