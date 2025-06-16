import { KeyCode } from '../../constants/keyCode';
import type { ElementParams } from '../../utils/dom';
import { _exists } from '../../utils/generic';
import { AgAbstractCellEditor } from '../../widgets/agAbstractCellEditor';
import type { AgInputTextArea } from '../../widgets/agInputTextArea';
import { AgInputTextAreaSelector } from '../../widgets/agInputTextArea';
import { RefPlaceholder } from '../../widgets/component';
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
export class LargeTextCellEditor extends AgAbstractCellEditor<ILargeTextEditorParams> {
    protected readonly eEditor: AgInputTextArea = RefPlaceholder;
    private focusAfterAttached: boolean;

    constructor() {
        super(LargeTextCellElement, [AgInputTextAreaSelector]);
    }

    public initialiseEditor(params: ILargeTextEditorParams): void {
        const { eEditor } = this;
        const { cellStartedEdit, value, maxLength, cols, rows } = params;
        this.focusAfterAttached = cellStartedEdit;

        eEditor
            .setMaxLength(maxLength || 200)
            .setCols(cols || 60)
            .setRows(rows || 10);

        if (value != null) {
            eEditor.setValue(value.toString(), true);
        }

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.activateTabIndex();
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
        const translate = this.getLocaleTextFunc();

        this.eEditor.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        if (this.focusAfterAttached) {
            this.eEditor.getFocusableElement().focus();
        }
    }

    public getValue(): any {
        const { eEditor, params } = this;
        const { value } = params;
        const editorValue = eEditor.getValue();

        if (!_exists(editorValue) && !_exists(value)) {
            return value;
        }
        return params.parseValue(editorValue!);
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

        if (typeof value === 'string' && maxLength != null && value.length > maxLength) {
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
