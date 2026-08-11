import { _removeFromParent, _toStringOrNull } from 'ag-stack';

import type { AgColumn, BaseCellDataType, BeanCollection, ColumnAdvancedFilterModel } from 'ag-grid-community';
import { Component, _translateForFilter } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import type { ColumnFilterModelOperands, PartialColumnFilterModel } from '../filterExpressionUtils';
import { getOperandRangeValidationMessage, hasOperandValue } from '../filterExpressionUtils';
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
        this.numOperands = this.getNumOperands(this.filterModel.type);

        this.eColumnPill = this.createPill({
            key: this.filterModel.colId,
            displayValue:
                this.advFilterExpSvc.getColumnDisplayValue(this.filterModel) ?? this.getDefaultColumnDisplayValue(),
            cssClass: 'ag-advanced-filter-builder-column-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.advFilterExpSvc.getColumnAutocompleteEntries() }),
            update: (key) => this.setColumnKey(key),
            pickerAriaLabelKey: 'ariaLabelAdvancedFilterBuilderColumnSelectField',
            pickerAriaLabelValue: 'Advanced Filter Builder Column Select Field',
            ariaLabel: this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderColumn'),
        });
        this.getGui().appendChild(this.eColumnPill.getGui());

        if (this.filterModel.colId) {
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
        const valueFormatter = (pillValue: string) =>
            this.advFilterExpSvc.formatOperand(this.filterModel, pillValue, true);
        const eOperandPill = this.createPill({
            key,
            // Convert from the input format to display format.
            // Input format matches model format except for numbers, but these get stringified anyway
            valueFormatter,
            // Where the stored operand is not valid input for its type, edit the displayed text instead:
            // the display value is produced by the same formatter whose output that type's parser accepts.
            editValueFormatter: this.advFilterExpSvc.isOperandModelValueEditable(this.baseCellDataType)
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

    /** Two pills both called "Value" are indistinguishable to a screen reader, so the pair is named From/To. */
    private getOperandAriaLabel(index: number): string {
        const label = this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderValue');
        if (this.numOperands < 2) {
            return label;
        }
        // The column filter's own keys, so a from/to pair reads the same wherever the user meets it.
        return `${label} ${_translateForFilter(this, index === 0 ? 'inRangeStart' : 'inRangeEnd')}`;
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

    /** The whole row is rebuilt, not just its tail: the first pill is named From only while there is a second. */
    private syncOperandPills(): void {
        const { eOperandPills, numOperands } = this;
        if (eOperandPills.length === numOperands) {
            return;
        }
        for (let i = numOperands, len = eOperandPills.length; i < len; ++i) {
            this.setOperandModelValue(i, undefined);
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
        const dataTypeChanged = this.baseCellDataType !== baseCellDataType;
        // The pill shows the name it was built with, so it is compared against the one the new column gives.
        const previousOperatorDisplayValue = this.advFilterExpSvc.getOperatorDisplayValue(this.filterModel);
        this.column = column;
        this.baseCellDataType = baseCellDataType;
        this.filterModel.colId = colId;
        this.filterModel.filterType = baseCellDataType;

        // Per-column options mean an operator can be unavailable on a column of the very same data type, or
        // offered there under a different name.
        const isOperatorOffered = this.isOperatorOffered(this.filterModel.type);
        if (!isOperatorOffered) {
            // Dropped directly: the tail of this method settles the operand count, pills and validity.
            delete (this.filterModel as PartialColumnFilterModel).type;
        }
        if (
            !isOperatorOffered ||
            this.advFilterExpSvc.getOperatorDisplayValue(this.filterModel) !== previousOperatorDisplayValue
        ) {
            _removeFromParent(this.eOperatorPill!.getGui());
            this.destroyBean(this.eOperatorPill);
            this.createOperatorPill();
        }
        if (dataTypeChanged) {
            // A value read as one data type is not a value of another, and a pill reads the type it was built with.
            this.setOperandModelValue(0, undefined);
            this.setOperandModelValue(1, undefined);
            this.destroyOperandPills();
        }
        // The kept operator can take a different number of values on this column.
        this.numOperands = this.getNumOperands(this.filterModel.type);
        this.syncOperandPills();
        this.validate();
    }

    private setOperatorKey(operator: string): void {
        const newNumOperands = this.getNumOperands(operator);
        if (newNumOperands !== this.numOperands) {
            // A value the previous option did not take is not this option's value.
            for (let i = this.numOperands; i < newNumOperands; ++i) {
                this.setOperandModelValue(i, undefined);
            }
            this.numOperands = newNumOperands;
            this.syncOperandPills();
        }
        (this.filterModel as PartialColumnFilterModel).type = operator;
        this.validate();
    }

    private setOperand(operand: string, index: number): void {
        // Number comes back as string from input, so convert. Dates are already in iso string format
        this.setOperandModelValue(index, this.baseCellDataType === 'number' && operand ? Number(operand) : operand);
        this.validate();
    }

    private isOperatorOffered(operator: string): boolean {
        return !!operator && this.getOperatorAutocompleteEntries().some(({ key }) => key === operator);
    }

    private getNumOperands(operator: string): number {
        return (
            this.advFilterExpSvc.getExpressionOperator(this.baseCellDataType, operator, this.column)?.numOperands ?? 0
        );
    }

    private validate(): void {
        const filterModel = this.filterModel;
        let validationMessage: string | null;
        if (!filterModel.colId) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationSelectColumn');
        } else if (!filterModel.type) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationSelectOption');
        } else if (!this.hasEveryOperand()) {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationEnterValue');
        } else if (this.numOperands === 2) {
            // Only the pair the option itself takes is a range; a stale `filterTo` in a loaded model is not.
            validationMessage = getOperandRangeValidationMessage(
                this.advFilterExpSvc,
                this.baseCellDataType,
                this.getOperandModelValue(0),
                this.getOperandModelValue(1)
            );
        } else {
            validationMessage = null;
        }

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

    private hasEveryOperand(): boolean {
        for (let i = 0; i < this.numOperands; ++i) {
            if (!hasOperandValue(this.getOperandModelValue(i))) {
                return false;
            }
        }
        return true;
    }
}
