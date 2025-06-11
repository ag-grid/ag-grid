import { KeyCode } from '../../constants/keyCode';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { ElementParams } from '../../utils/dom';
import { _missing } from '../../utils/generic';
import { _warn } from '../../validation/logging';
import type { ValueService } from '../../valueService/valueService';
import { AgAbstractCellEditor } from '../../widgets/agAbstractCellEditor';
import type { ListOption } from '../../widgets/agList';
import type { AgSelect } from '../../widgets/agSelect';
import { AgSelectSelector } from '../../widgets/agSelect';
import { RefPlaceholder } from '../../widgets/component';
import type { ISelectCellEditorParams } from './iSelectCellEditor';

interface SelectCellEditorParams<TData = any, TValue = any, TContext = any>
    extends ISelectCellEditorParams<TValue>,
        ICellEditorParams<TData, TValue, TContext> {}

const SelectCellElement: ElementParams = {
    tag: 'div',
    cls: 'ag-cell-edit-wrapper',
    children: [
        {
            tag: 'ag-select',
            ref: 'eEditor',
            cls: 'ag-cell-editor',
        },
    ],
};
export class SelectCellEditor extends AgAbstractCellEditor<SelectCellEditorParams> {
    private focusAfterAttached: boolean;
    private valueSvc: ValueService;

    public wireBeans(beans: BeanCollection): void {
        this.valueSvc = beans.valueSvc;
    }

    protected readonly eEditor: AgSelect = RefPlaceholder;
    private startedByEnter: boolean = false;

    constructor() {
        super(SelectCellElement, [AgSelectSelector]);
    }

    public initialiseEditor(params: SelectCellEditorParams): void {
        this.focusAfterAttached = params.cellStartedEdit;

        const { eEditor, valueSvc, gos } = this;
        const { values, value, eventKey } = params;

        if (_missing(values)) {
            _warn(58);
            return;
        }

        this.startedByEnter = eventKey != null ? eventKey === KeyCode.ENTER : false;

        let hasValue = false;
        values.forEach((currentValue: any) => {
            const option: ListOption = { value: currentValue };
            const valueFormatted = valueSvc.formatValue(params.column as AgColumn, null, currentValue);
            const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : currentValue;

            eEditor.addOption(option);
            hasValue = hasValue || value === currentValue;
        });

        if (hasValue) {
            eEditor.setValue(params.value, true);
        } else if (params.values.length) {
            eEditor.setValue(params.values[0], true);
        }

        const { valueListGap, valueListMaxWidth, valueListMaxHeight } = params;

        if (valueListGap != null) {
            eEditor.setPickerGap(valueListGap);
        }

        if (valueListMaxHeight != null) {
            eEditor.setPickerMaxHeight(valueListMaxHeight);
        }

        if (valueListMaxWidth != null) {
            eEditor.setPickerMaxWidth(valueListMaxWidth);
        }

        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (gos.get('editType') !== 'fullRow') {
            this.addManagedListeners(this.eEditor, { selectedItem: () => params.stopEditing() });
        }
    }

    public afterGuiAttached() {
        if (this.focusAfterAttached) {
            this.eEditor.getFocusableElement().focus();
        }

        if (this.startedByEnter) {
            setTimeout(() => {
                if (this.isAlive()) {
                    this.eEditor.showPicker();
                }
            });
        }
    }

    public focusIn(): void {
        this.eEditor.getFocusableElement().focus();
    }

    public getValue(): any {
        return this.eEditor.getValue();
    }

    public override isPopup() {
        return false;
    }

    public getValidationElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getAriaElement() as HTMLElement;
    }

    public getErrors() {
        const { params } = this;
        const { values, getErrors } = params;
        const value = this.getValue();
        let internalErrors: string[] | null = [];

        if (values && !values.includes(value)) {
            internalErrors.push(`Invalid selection.`);
        } else {
            internalErrors = null;
        }

        if (getErrors) {
            return getErrors({
                value,
                internalErrors,
                cellEditorParams: params,
            });
        }

        return internalErrors;
    }
}
