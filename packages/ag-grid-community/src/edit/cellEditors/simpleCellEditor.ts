import { KeyCode, RefPlaceholder, _isBrowserSafari } from 'ag-stack';

import type { DefaultProvidedCellEditorParams, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { GridInputTextField } from '../../widgets/gridWidgetTypes';
import { AgAbstractCellEditor } from './agAbstractCellEditor';
import type { CellEditorInput } from './iCellEditorInput';

export class SimpleCellEditor<
    TValue,
    P extends ICellEditorParams & DefaultProvidedCellEditorParams,
    I extends GridInputTextField,
> extends AgAbstractCellEditor<ICellEditorParams, TValue, string> {
    private highlightAllOnFocus: boolean;
    private focusAfterAttached: boolean;
    /** Read off the element, not from `getStartValue`: the widget normalises what it is given, and
     * withholds its value entirely while the input breaks a native bound. */
    private seededText: string | this = this;
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
        let seeded = false;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (cellStartedEdit) {
            this.focusAfterAttached = true;

            if (eventKey === KeyCode.BACKSPACE || eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey?.length === 1) {
                if (suppressPreventDefault) {
                    shouldSetStartValue = false;
                } else {
                    startValue = eventKey;
                }
            } else {
                startValue = cellEditorInput.getStartValue();
                seeded = true;

                if (eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        } else {
            this.focusAfterAttached = false;
            startValue = cellEditorInput.getStartValue();
            seeded = true;
        }

        if (shouldSetStartValue && startValue != null) {
            eEditor.setStartValue(startValue);
        }
        this.seededText = seeded ? eEditor.getInputElement().value : this;

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

    public agFlushInput(): void {
        this.cellEditorInput.flushInput?.();
    }

    private isUntouched(): boolean {
        return this.eEditor.getInputElement().value === this.seededText;
    }

    public getValue(): TValue | null | undefined {
        return this.isUntouched() ? this.params.value : this.cellEditorInput.getValue();
    }

    public override agSetEditValue(value: TValue | null | undefined): void {
        this.params.value = value;
        const startValue = this.cellEditorInput.getStartValue();
        this.eEditor.setStartValue(startValue ?? null);
        this.seededText = this.eEditor.getInputElement().value;
    }

    public override isPopup() {
        return false;
    }

    public getValidationElement(): HTMLInputElement {
        return this.eEditor.getInputElement();
    }

    public getValidationErrors(): string[] | null {
        return this.cellEditorInput.getValidationErrors(this.isUntouched());
    }
}
