import { KeyCode, RefPlaceholder, _exists, _isStringLargerThan } from 'ag-stack';

import { AgInputTextAreaSelector } from '../../agWidgets/agInputTextArea';
import type { ElementParams } from '../../utils/element';
import type { GridInputTextArea } from '../../widgets/gridWidgetTypes';
import { AgAbstractCellEditor } from './agAbstractCellEditor';
import type { ILargeTextEditorParams } from './iLargeTextCellEditor';

const LargeTextCellElement: ElementParams = {
    tag: 'div',
    cls: 'ag-large-text',
    children: [
        {
            tag: 'ag-input-text-area',
            ref: 'eEditor',
            cls: 'ag-large-text-input',
        },
    ],
};
export class LargeTextCellEditor extends AgAbstractCellEditor<ILargeTextEditorParams, string> {
    protected readonly eEditor: GridInputTextArea = RefPlaceholder;
    private focusAfterAttached: boolean;
    private highlightAllOnFocus: boolean;
    /** Last raw input passed to `params.parseValue`. Initialised to `this` as an "uncached" sentinel — a DOM raw value can never equal the editor instance, so the first cache check always misses. */
    private cachedRaw: unknown = this;
    /** Memoised parse result for `cachedRaw`. Returned by `getValue()` when the raw input is unchanged across repeated validation/sync passes within an edit session. */
    private cachedParsed: any;

    constructor() {
        super(LargeTextCellElement, [AgInputTextAreaSelector]);
    }

    public initialiseEditor(params: ILargeTextEditorParams): void {
        const { eEditor } = this;
        const { cellStartedEdit, eventKey, maxLength, cols, rows } = params;
        this.focusAfterAttached = cellStartedEdit;

        // disable initial tooltips added to the input field
        // let the validation handle tooltips.
        eEditor.getInputElement().setAttribute('title', '');

        eEditor
            .setMaxLength(maxLength || 200)
            .setCols(cols || 60)
            .setRows(rows || 10);

        let startValue: string | null | undefined;

        // cellStartedEdit is only false if we are doing fullRow editing
        if (cellStartedEdit) {
            this.focusAfterAttached = true;

            if (eventKey === KeyCode.BACKSPACE || eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey?.length === 1) {
                startValue = eventKey;
            } else {
                startValue = this.getStartValue(params);

                if (eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        } else {
            this.focusAfterAttached = false;
            startValue = this.getStartValue(params);
        }

        if (startValue != null) {
            eEditor.setValue(startValue, true);
        }

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.activateTabIndex();
    }

    private getStartValue(params: ILargeTextEditorParams): string | null | undefined {
        const { value } = params;
        return value?.toString() ?? value;
    }

    public override agSetEditValue(value: string | null | undefined): void {
        this.params.value = value;
        const startValue = this.getStartValue(this.params);
        this.eEditor.setValue(startValue ?? '', true);
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        if (
            key === KeyCode.LEFT ||
            key === KeyCode.UP ||
            key === KeyCode.RIGHT ||
            key === KeyCode.DOWN ||
            (event.shiftKey && key === KeyCode.ENTER)
        ) {
            // shift+enter allows for newlines
            event.stopPropagation();
        }
    }

    public afterGuiAttached(): void {
        const { eEditor, focusAfterAttached, highlightAllOnFocus } = this;
        const translate = this.getLocaleTextFunc();

        eEditor.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (focusAfterAttached) {
            eEditor.getFocusableElement().focus();

            if (highlightAllOnFocus) {
                eEditor.getInputElement().select();
            }
        }
    }

    public getValue(): any {
        const { eEditor, params } = this;
        const { value } = params;
        const editorValue = eEditor.getValue();

        if (!_exists(editorValue) && !_exists(value)) {
            return value;
        }
        if (Object.is(this.cachedRaw, editorValue)) {
            return this.cachedParsed;
        }
        const parsed = params.parseValue(editorValue!);
        this.cachedRaw = editorValue;
        this.cachedParsed = parsed;
        return parsed;
    }

    public getValidationElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getInputElement();
    }

    public getValidationErrors() {
        const { params } = this;
        const { maxLength, getValidationErrors } = params;
        const translate = this.getLocaleTextFunc();
        const value = this.getValue();

        let internalErrors: string[] | null = [];

        if (maxLength != null && _isStringLargerThan(value, maxLength)) {
            internalErrors.push(
                translate('maxLengthValidation', `Must be ${maxLength} characters or fewer.`, [String(maxLength)])
            );
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getValidationErrors) {
            return getValidationErrors({
                value,
                internalErrors,
                cellEditorParams: params,
            });
        }

        return internalErrors;
    }
}
