import { _removeFromParent, _toStringOrNull } from 'ag-stack';

import type {
    AgColumn,
    BaseCellDataType,
    BeanCollection,
    ColumnAdvancedFilterModel,
    SetAdvancedFilterModel,
    SetFilterModelValue,
} from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import type { FilterExpressionOperator, OperandsKind } from '../filterExpressionOperators';
import { OPERAND_COUNT } from '../filterExpressionOperators';
import type { ColumnFilterModelOperands, PartialColumnFilterModel } from '../filterExpressionUtils';
import { OPERAND_KEYS, getConditionValidationMessage, getNumberParser } from '../filterExpressionUtils';
import type {
    AdvancedFilterBuilderEvents,
    AdvancedFilterBuilderItem,
    CreatePillParams,
    Pill,
} from './iAdvancedFilterBuilder';

export class ConditionPillWrapperComp extends Component<AdvancedFilterBuilderEvents> {
    private advFilterExpSvc: AdvancedFilterExpressionService;

    public wireBeans(beans: BeanCollection) {
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
    }

    private item: AdvancedFilterBuilderItem;
    private createPill: (params: CreatePillParams) => Pill;
    private filterModel: ColumnAdvancedFilterModel;
    private baseCellDataType: BaseCellDataType;
    private column: AgColumn | undefined;
    private operands: OperandsKind;
    private eColumnPill: Pill;
    private eOperatorPill: Pill | undefined;
    private readonly eOperandPills: Pill[] = [];
    private hasSetValuesPill = false;
    private validationMessage: string | null = null;

    constructor() {
        super({ tag: 'div', cls: 'ag-advanced-filter-builder-item-condition', role: 'presentation' });
    }

    public init(params: { item: AdvancedFilterBuilderItem; createPill: (params: CreatePillParams) => Pill }): void {
        const { item, createPill } = params;
        this.item = item;
        this.createPill = createPill;
        this.filterModel = item.filterModel as ColumnAdvancedFilterModel;
        this.setupColumnCondition(this.filterModel);
        this.validate();

        this.addDestroyFunc(() => this.destroyBeans([this.eColumnPill, this.eOperatorPill, ...this.eOperandPills]));
    }

    public getDragName(): string {
        return this.filterModel.colId
            ? this.advFilterExpSvc.parseColumnFilterModel(this.filterModel)
            : this.getDefaultColumnDisplayValue();
    }

    public getAriaLabel(): string {
        return `${this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderFilterItem')} ${this.getDragName()}`;
    }

    public getValidationMessage(): string | null {
        return this.validationMessage;
    }

    public override getFocusableElement(): HTMLElement {
        return this.eColumnPill.getFocusableElement();
    }

    private setupColumnCondition(filterModel: ColumnAdvancedFilterModel): void {
        const columnDetails = this.advFilterExpSvc.getColumnDetails(filterModel.colId);
        this.baseCellDataType = columnDetails.baseCellDataType;
        this.column = columnDetails.column;
        this.setOperands(filterModel.type);

        this.eColumnPill = this.createPill({
            key: filterModel.colId,
            displayValue:
                this.advFilterExpSvc.getColumnDisplayValue(filterModel) ?? this.getDefaultColumnDisplayValue(),
            cssClass: 'ag-advanced-filter-builder-column-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.advFilterExpSvc.getColumnAutocompleteEntries() }),
            update: (key) => this.setColumnKey(key),
            pickerAriaLabelKey: 'ariaLabelAdvancedFilterBuilderColumnSelectField',
            pickerAriaLabelValue: 'Advanced Filter Builder Column Select Field',
            ariaLabel: this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderColumn'),
        });
        this.getGui().appendChild(this.eColumnPill.getGui());

        if (filterModel.colId) {
            this.createOperatorPill();
            this.syncOperandPills();
        }
    }

    private createOperatorPill(): void {
        this.eOperatorPill = this.createPill({
            key: this.filterModel.type,
            displayValue:
                this.advFilterExpSvc.getOperatorDisplayValue(this.filterModel) ??
                this.advFilterExpSvc.translate('advancedFilterBuilderSelectOption'),
            cssClass: 'ag-advanced-filter-builder-option-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.getOperatorAutocompleteEntries() }),
            update: (key) => this.setOperatorKey(key),
            pickerAriaLabelKey: 'ariaLabelAdvancedFilterBuilderOptionSelectField',
            pickerAriaLabelValue: 'Advanced Filter Builder Option Select Field',
            ariaLabel: this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderOption'),
        });
        this.eColumnPill.getGui().insertAdjacentElement('afterend', this.eOperatorPill.getGui());
    }

    private createOperandPill(index: number): void {
        // Date inputs want iso string, so read straight from model. For numbers, convert to string
        const value = this.getOperandModelValue(index);
        const key = (typeof value === 'number' || typeof value === 'bigint' ? _toStringOrNull(value) : value) ?? '';
        // Read from the model, not from the text handed in: an edit is stored through the column's own
        // parser, and the display is produced by the default one, which need not read the same syntax.
        const valueFormatter = () =>
            this.advFilterExpSvc.formatOperand(this.filterModel, this.getOperandModelValue(index), true);
        const eOperandPill = this.createPill({
            key,
            // Convert from the input format to display format.
            // Input format matches model format except for numbers, but these get stringified anyway
            valueFormatter,
            // Where the stored operand is not valid input for the column, edit the displayed text instead:
            // the column's own parser is what reads an edit back, and its grammar need not be the input's.
            editValueFormatter: this.advFilterExpSvc.isOperandModelValueEditable(this.baseCellDataType, this.column)
                ? undefined
                : valueFormatter,
            baseCellDataType: this.baseCellDataType,
            cssClass: 'ag-advanced-filter-builder-value-pill',
            isSelect: false,
            update: (key) => this.setOperand(key, index),
            ariaLabel: this.getOperandAriaLabel(index),
        });
        this.eOperandPills.push(eOperandPill);
        this.getGui().appendChild(eOperandPill.getGui());
    }

    /** Two pills both called "Value" are indistinguishable to a screen reader, hence the from/to labels. */
    private getOperandAriaLabel(index: number): string {
        if (this.operands !== 'range') {
            return this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderValue');
        }
        const translate = this.getLocaleTextFunc();
        return index === 0
            ? translate('ariaFilterFromValue', 'Filter from value')
            : translate('ariaFilterToValue', 'Filter to value');
    }

    private destroyOperandPills(): void {
        this.hasSetValuesPill = false;
        const eOperandPills = this.eOperandPills;
        for (let i = 0, len = eOperandPills.length; i < len; ++i) {
            const eOperandPill = eOperandPills[i];
            _removeFromParent(eOperandPill.getGui());
            this.destroyBean(eOperandPill);
        }
        eOperandPills.length = 0;
    }

    /** Call after every change to the count: the first pill is named From only while there is a second. */
    private syncOperandPills(): void {
        const { eOperandPills, operands } = this;
        const numOperands = OPERAND_COUNT[operands];
        for (let i = numOperands, len = OPERAND_KEYS.length; i < len; ++i) {
            this.setOperandModelValue(i, undefined);
        }
        if (operands === 'list') {
            if (!this.hasSetValuesPill) {
                this.destroyOperandPills();
                this.createSetValuesPill();
            }
            return;
        }
        // `values` is not one of `OPERAND_KEYS`, so leaving a list option has to drop it separately.
        delete (this.filterModel as PartialColumnFilterModel).values;
        if (eOperandPills.length === numOperands && !this.hasSetValuesPill) {
            return;
        }
        this.destroyOperandPills();
        for (let i = 0; i < numOperands; ++i) {
            this.createOperandPill(i);
        }
    }

    /** The whole value list is one pill, opening the column's own Set Filter to choose in. */
    private createSetValuesPill(): void {
        const column = this.column;
        if (!column) {
            return;
        }
        this.hasSetValuesPill = true;
        const filterModel = this.filterModel as SetAdvancedFilterModel;
        filterModel.values ??= [];
        const ePill = this.createPill({
            key: '',
            column,
            values: filterModel.values,
            cssClass: 'ag-advanced-filter-builder-value-pill',
            isSelect: 'set',
            update: (values: SetFilterModelValue) => {
                filterModel.values = values;
                this.validate();
            },
            ariaLabel: this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderValue'),
        });
        this.eOperandPills.push(ePill);
        this.getGui().appendChild(ePill.getGui());
    }

    private getOperandModelValue(index: number): string | number | undefined {
        const model = this.filterModel as ColumnFilterModelOperands;
        return model[OPERAND_KEYS[index]];
    }

    /** Undefined removes the slot, so the model this builds carries no key the chosen option does not use. */
    private setOperandModelValue(index: number, value: string | number | undefined): void {
        const model = this.filterModel as ColumnFilterModelOperands;
        const key = OPERAND_KEYS[index];
        if (value === undefined) {
            delete model[key];
        } else {
            model[key] = value;
        }
    }

    private getOperatorAutocompleteEntries(): AutocompleteEntry[] {
        return this.column
            ? this.advFilterExpSvc.getOperatorAutocompleteEntries(this.column, this.baseCellDataType)
            : [];
    }

    private setColumnKey(colId: string): void {
        if (!this.eOperatorPill) {
            this.createOperatorPill();
        }

        const { column, baseCellDataType } = this.advFilterExpSvc.getColumnDetails(colId);
        const previousColumn = this.column;
        const dataTypeChanged = this.baseCellDataType !== baseCellDataType;
        // Both the key and the name it resolves to, since a column can offer the same operator under another.
        const previousOperatorKey = this.filterModel.type;
        const previousOperatorDisplayValue = this.advFilterExpSvc.getOperatorDisplayValue(this.filterModel);
        this.column = column;
        this.baseCellDataType = baseCellDataType;
        this.filterModel.colId = colId;

        // A data type change takes the operator with it; within one type the column's own options decide.
        const keepOperator =
            !dataTypeChanged && this.advFilterExpSvc.isOperatorOffered(baseCellDataType, this.filterModel.type, column);
        if (!keepOperator) {
            delete (this.filterModel as PartialColumnFilterModel).type;
        }
        if (
            this.filterModel.type !== previousOperatorKey ||
            this.advFilterExpSvc.getOperatorDisplayValue(this.filterModel) !== previousOperatorDisplayValue
        ) {
            _removeFromParent(this.eOperatorPill!.getGui());
            this.destroyBean(this.eOperatorPill);
            this.createOperatorPill();
        }
        // A pill's editor and display come from the column's own parser and formatter.
        if (previousColumn !== column) {
            this.destroyOperandPills();
            // A Set Filter key names a value of one column, so it cannot follow the condition to another.
            delete (this.filterModel as PartialColumnFilterModel).values;
        }
        this.setOperands(this.filterModel.type);
        this.syncOperandPills();
        this.validate();
    }

    private setOperatorKey(operator: string): void {
        const previousOperands = this.operands;
        this.setOperands(operator);
        if (this.operands !== previousOperands) {
            this.syncOperandPills();
        }
        (this.filterModel as PartialColumnFilterModel).type = operator;
        this.validate();
    }

    /** The kind decides the member: an option taking a list writes a `set` model, not the data type's. */
    private setOperands(operator: string | undefined): void {
        const operands = this.getExpressionOperator(operator)?.operands ?? 'none';
        this.operands = operands;
        (this.filterModel as PartialColumnFilterModel).filterType = operands === 'list' ? 'set' : this.baseCellDataType;
    }

    private setOperand(operand: string, index: number): void {
        // Number comes back as string from input, so convert. Dates are already in iso string format.
        // An emptied pill holds nothing to filter on, so the slot goes rather than keeping an empty string.
        const value =
            this.baseCellDataType === 'number' && operand
                ? (getNumberParser(this.column, this.gos)(operand) ?? '')
                : operand;
        this.setOperandModelValue(index, value === '' ? undefined : value);
        this.validate();
    }

    private getExpressionOperator(operator: string | undefined): FilterExpressionOperator<any> | undefined {
        return this.advFilterExpSvc.getExpressionOperator(this.baseCellDataType, operator, this.column);
    }

    private validate(): void {
        const validationMessage = getConditionValidationMessage(
            this.advFilterExpSvc,
            this.gos,
            this.filterModel,
            this.column,
            this.baseCellDataType,
            this.getExpressionOperator(this.filterModel.type)
        );

        this.item.valid = !validationMessage;
        if (validationMessage !== this.validationMessage) {
            this.validationMessage = validationMessage;
            this.dispatchLocalEvent({
                type: 'advancedFilterBuilderValidChanged',
            });
        }
    }

    private getDefaultColumnDisplayValue(): string {
        return this.advFilterExpSvc.translate('advancedFilterBuilderSelectColumn');
    }
}
