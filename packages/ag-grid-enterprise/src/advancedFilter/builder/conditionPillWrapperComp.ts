import { _removeFromParent, _toStringOrNull } from 'ag-stack';

import type { AgColumn, BaseCellDataType, BeanCollection, ColumnAdvancedFilterModel } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import type { ColumnFilterModelOperands, PartialColumnFilterModel } from '../filterExpressionUtils';
import { getNumberParser } from '../filterExpressionUtils';
import type {
    AdvancedFilterBuilderEvents,
    AdvancedFilterBuilderItem,
    CreatePillParams,
} from './iAdvancedFilterBuilder';
import type { InputPillComp } from './inputPillComp';
import type { SelectPillComp } from './selectPillComp';

/** The model names its two operands rather than listing them, so an operand index maps to a key. */
const OPERAND_KEYS = ['filter', 'filterTo'] as const;

export class ConditionPillWrapperComp extends Component<AdvancedFilterBuilderEvents> {
    private advFilterExpSvc: AdvancedFilterExpressionService;

    public wireBeans(beans: BeanCollection) {
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
    }

    private item: AdvancedFilterBuilderItem;
    private createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp;
    private filterModel: ColumnAdvancedFilterModel;
    private baseCellDataType: BaseCellDataType;
    private column: AgColumn | undefined;
    private numOperands: number;
    private eColumnPill: SelectPillComp | InputPillComp;
    private eOperatorPill: SelectPillComp | InputPillComp | undefined;
    private readonly eOperandPills: (SelectPillComp | InputPillComp)[] = [];
    private validationMessage: string | null = null;

    constructor() {
        super({ tag: 'div', cls: 'ag-advanced-filter-builder-item-condition', role: 'presentation' });
    }

    public init(params: {
        item: AdvancedFilterBuilderItem;
        createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp;
    }): void {
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
        this.numOperands = this.getNumOperands(filterModel.type);

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

    /** Two pills both called "Value" are indistinguishable to a screen reader, so the pair takes the column
     * filter's own from/to labels rather than composing one, which no locale could reorder. */
    private getOperandAriaLabel(index: number): string {
        if (this.numOperands < 2) {
            return this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderValue');
        }
        const translate = this.getLocaleTextFunc();
        return index === 0
            ? translate('ariaFilterFromValue', 'Filter from value')
            : translate('ariaFilterToValue', 'Filter to value');
    }

    private destroyOperandPills(): void {
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
        const { eOperandPills, numOperands } = this;
        for (let i = numOperands, len = OPERAND_KEYS.length; i < len; ++i) {
            this.setOperandModelValue(i, undefined);
        }
        if (eOperandPills.length === numOperands) {
            return;
        }
        this.destroyOperandPills();
        for (let i = 0; i < numOperands; ++i) {
            this.createOperandPill(i);
        }
    }

    private getOperandModelValue(index: number): string | number | undefined {
        const model: ColumnFilterModelOperands = this.filterModel;
        return model[OPERAND_KEYS[index]];
    }

    /** Undefined removes the slot, so the model this builds carries no key the chosen option does not use. */
    private setOperandModelValue(index: number, value: string | number | undefined): void {
        const model: ColumnFilterModelOperands = this.filterModel;
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
        this.filterModel.filterType = baseCellDataType;

        // A data type change takes the operator with it; within one data type the column's own options decide,
        // as an operator can be unavailable on another column of the same type, or offered under another name.
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
        // A pill's editor and display come from the column's own parser and formatter. A data type change
        // has already dropped the operator, so `syncOperandPills` clears the values it took.
        if (previousColumn !== column) {
            this.destroyOperandPills();
        }
        this.numOperands = this.getNumOperands(this.filterModel.type);
        this.syncOperandPills();
        this.validate();
    }

    private setOperatorKey(operator: string): void {
        const newNumOperands = this.getNumOperands(operator);
        if (newNumOperands !== this.numOperands) {
            this.numOperands = newNumOperands;
            this.syncOperandPills();
        }
        (this.filterModel as PartialColumnFilterModel).type = operator;
        this.validate();
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

    private getNumOperands(operator: string): number {
        return (
            this.advFilterExpSvc.getExpressionOperator(this.baseCellDataType, operator, this.column)?.numOperands ?? 0
        );
    }

    private validate(): void {
        const filterModel = this.filterModel;
        let validationMessage: string | null = null;
        if (!filterModel.colId) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationSelectColumn');
        } else if (!filterModel.type) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationSelectOption');
        } else if (!this.hasEveryOperand()) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationEnterValue');
        }

        this.item.valid = !validationMessage;
        if (validationMessage !== this.validationMessage) {
            this.validationMessage = validationMessage;
            this.dispatchLocalEvent({
                type: 'advancedFilterBuilderValidChanged',
            });
        }
    }

    /** Judged on the display, not the model: what the column's formatter cannot write is not a value it holds. */
    private hasEveryOperand(): boolean {
        for (let i = 0, len = this.numOperands; i < len; ++i) {
            const displayValue = this.advFilterExpSvc.formatOperand(
                this.filterModel,
                this.getOperandModelValue(i),
                true
            );
            if (!displayValue) {
                return false;
            }
        }
        return true;
    }

    private getDefaultColumnDisplayValue(): string {
        return this.advFilterExpSvc.translate('advancedFilterBuilderSelectColumn');
    }
}
