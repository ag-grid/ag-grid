import { KeyCode } from '../../agStack/constants/keyCode';
import type { LocaleTextFunc } from '../../agStack/interfaces/iLocaleService';
import { _isBrowserSafari } from '../../agStack/utils/browser';
import { _exists } from '../../agStack/utils/generic';
import { AgInputNumberFieldSelector } from '../../agStack/widgets/agInputNumberField';
import type { ElementParams } from '../../utils/element';
import type { GridInputNumberField } from '../../widgets/gridWidgetTypes';
import type { CellEditorInput } from './iCellEditorInput';
import type { INumberCellEditorParams } from './iNumberCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';

const NumberCellElement: ElementParams = {
    tag: 'ag-input-number-field',
    ref: 'eEditor',
    cls: 'ag-cell-editor',
};
class NumberCellEditorInput implements CellEditorInput<number, INumberCellEditorParams, GridInputNumberField> {
    private eEditor: GridInputNumberField;
    private params: INumberCellEditorParams;

    constructor(private readonly getLocaleTextFunc: () => LocaleTextFunc) {}

    public getTemplate(): ElementParams {
        return NumberCellElement;
    }
    public getAgComponents() {
        return [AgInputNumberFieldSelector];
    }

    public init(eEditor: GridInputNumberField, params: INumberCellEditorParams): void {
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
        const { params } = this;
        const { min, max, getValidationErrors } = params;

        const eInput = this.eEditor.getInputElement();
        const value = eInput.valueAsNumber;

        const translate = this.getLocaleTextFunc();

        let internalErrors: string[] | null = [];

        if (typeof value === 'number') {
            if (min != null && value < min) {
                internalErrors.push(
                    translate('minValueValidation', `Must be greater than or equal to ${min}.`, [String(min)])
                );
            }
            if (max != null && value > max) {
                internalErrors.push(
                    translate('maxValueValidation', `Must be less than or equal to ${max}.`, [String(max)])
                );
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

export class NumberCellEditor extends SimpleCellEditor<number, INumberCellEditorParams, GridInputNumberField> {
    constructor() {
        super(new NumberCellEditorInput(() => this.getLocaleTextFunc()));
    }
}
