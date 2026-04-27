import type { LocaleTextFunc } from '../../agStack/interfaces/iLocaleService';
import { _isBrowserSafari } from '../../agStack/utils/browser';
import { _exists } from '../../agStack/utils/generic';
import { AgInputTextFieldSelector } from '../../agStack/widgets/agInputTextField';
import type { ElementParams } from '../../utils/element';
import type { GridInputTextField } from '../../widgets/gridWidgetTypes';
import type { CellEditorInput } from './iCellEditorInput';
import type { ITextCellEditorParams } from './iTextCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const TextCellEditorElement: ElementParams = {
    tag: 'ag-input-text-field',
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class TextCellEditorInput<TValue = any>
    implements CellEditorInput<TValue, ITextCellEditorParams<any, TValue>, GridInputTextField>
{
    private eEditor: GridInputTextField;
    private params: ITextCellEditorParams<any, TValue>;

    constructor(private readonly getLocaleTextFunc: () => LocaleTextFunc) {}

    public getTemplate(): ElementParams {
        return TextCellEditorElement;
    }

    public getAgComponents() {
        return [AgInputTextFieldSelector];
    }

    public init(eEditor: GridInputTextField, params: ITextCellEditorParams<any, TValue>): void {
        this.eEditor = eEditor;
        this.params = params;
        const maxLength = params.maxLength;
        if (maxLength != null) {
            eEditor.setMaxLength(maxLength);
        }
    }

    public getValidationErrors(): string[] | null {
        const { params } = this;
        const { maxLength, getValidationErrors } = params;
        const value = this.getValue();

        const translate = this.getLocaleTextFunc();

        let internalErrors: string[] | null = [];

        if (maxLength != null && typeof value === 'string' && value.length > maxLength) {
            internalErrors.push(
                translate('maxLengthValidation', `Must be ${maxLength} characters or fewer.`, [String(maxLength)])
            );
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getValidationErrors) {
            return getValidationErrors({ value, cellEditorParams: params, internalErrors });
        }

        return internalErrors;
    }

    public getValue(): TValue | null | undefined {
        const { eEditor, params } = this;
        const value = eEditor.getValue();
        if (!_exists(value) && !_exists(params.value)) {
            return params.value;
        }
        return params.parseValue(value!);
    }

    public getStartValue(): string | null | undefined {
        const params = this.params;
        const formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : (params.value as any);
    }

    public setCaret(): void {
        if (_isBrowserSafari()) {
            // If not safari, input is already focused.
            // For safari we need to focus only for this use case to avoid AG-3238,
            // but still ensure the input has focus.
            this.eEditor.getInputElement().focus({ preventScroll: true });
        }

        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const eInput = this.eEditor;
        const value = eInput.getValue();
        const len = (_exists(value) && value.length) || 0;

        if (len) {
            eInput.getInputElement().setSelectionRange(len, len);
        }
    }
}

export class TextCellEditor extends SimpleCellEditor<any, ITextCellEditorParams, GridInputTextField> {
    constructor() {
        super(new TextCellEditorInput(() => this.getLocaleTextFunc()));
    }
}
