import { KeyCode } from '../../constants/keyCode';
import { _isBrowserSafari } from '../../utils/browser';
import type { ElementParams } from '../../utils/dom';
import { _exists } from '../../utils/generic';
import type { AgInputNumberField } from '../../widgets/agInputNumberField';
import { AgInputNumberFieldSelector } from '../../widgets/agInputNumberField';
import type { CellEditorInput } from './iCellEditorInput';
import type { INumberCellEditorParams } from './iNumberCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const NumberCellElement: ElementParams = {
    tag: 'ag-input-number-field',
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class NumberCellEditorInput implements CellEditorInput<number, INumberCellEditorParams, AgInputNumberField> {
    private eEditor: AgInputNumberField;
    private params: INumberCellEditorParams;

    public getTemplate(): ElementParams {
        return NumberCellElement;
    }
    public getAgComponents() {
        return [AgInputNumberFieldSelector];
    }

    public init(eEditor: AgInputNumberField, params: INumberCellEditorParams): void {
        this.eEditor = eEditor;
        this.params = params;
        const { max, min, precision, step } = params;
        if (max != null) {
            eEditor.setMax(max);
        }
        if (min != null) {
            eEditor.setMin(min);
        }
        if (precision != null) {
            eEditor.setPrecision(precision);
        }
        if (step != null) {
            eEditor.setStep(step);
        }

        const editorEl = eEditor.getInputElement();
        if (params.preventStepping) {
            eEditor.addManagedElementListeners(editorEl, { keydown: this.preventStepping });
        } else if (params.showStepperButtons) {
            editorEl.classList.add('ag-number-field-input-stepper');
        }
    }

    public getValidationErrors(): string[] | null {
        const value = this.getValue();
        const { params } = this;
        const { min, max, getValidationErrors } = params;

        let internalErrors: string[] | null = [];

        if (typeof value === 'number') {
            if (min != null && value < min) {
                internalErrors.push(`Must be greater than or equal to ${min}.`);
            }
            if (max != null && value > max) {
                internalErrors.push(`Must be less than or equal to ${max}.`);
            }
        }

        if (!internalErrors.length) {
            internalErrors = null;
        }

        if (getValidationErrors) {
            return getValidationErrors({
                value,
                cellEditorParams: params,
                internalErrors,
            });
        }

        return internalErrors;
    }

    private preventStepping(e: KeyboardEvent): void {
        if (e.key === KeyCode.UP || e.key === KeyCode.DOWN) {
            e.preventDefault();
        }
    }

    public getValue(): number | null | undefined {
        const { eEditor, params } = this;
        const value = eEditor.getValue();
        if (!_exists(value) && !_exists(params.value)) {
            return params.value;
        }
        let parsedValue = params.parseValue(value!);
        if (parsedValue == null) {
            return parsedValue;
        }
        if (typeof parsedValue === 'string') {
            if (parsedValue === '') {
                return null;
            }
            parsedValue = Number(parsedValue);
        }
        return isNaN(parsedValue) ? null : parsedValue;
    }

    public getStartValue(): string | null | undefined {
        return this.params.value as any;
    }

    public setCaret(): void {
        if (_isBrowserSafari()) {
            // If not safari, input is already focused.
            // For safari we need to focus only for this use case to avoid AG-3238,
            // but still ensure the input has focus.
            this.eEditor.getInputElement().focus({ preventScroll: true });
        }
    }
}

export class NumberCellEditor extends SimpleCellEditor<number, INumberCellEditorParams, AgInputNumberField> {
    constructor() {
        super(new NumberCellEditorInput());
    }
}
