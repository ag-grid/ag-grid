import { AutocompleteEntry, Autowired, BaseCellDataType, Column, ColumnAdvancedFilterModel, Component, _ } from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "../advancedFilterExpressionService";
import { AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem, CreatePillParams } from "./iAdvancedFilterBuilder";
import { InputPillComp } from "./inputPillComp";
import { SelectPillComp } from "./selectPillComp";

export class ConditionPillWrapperComp extends Component {
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private item: AdvancedFilterBuilderItem;
    private createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp;
    private filterModel: ColumnAdvancedFilterModel;
    private baseCellDataType: BaseCellDataType;
    private column: Column | undefined;
    private numOperands: number;
    private eColumnPill: SelectPillComp | InputPillComp;
    private eOperatorPill: SelectPillComp | InputPillComp | undefined;
    private eOperandPill: SelectPillComp | InputPillComp | undefined;

    constructor() {
        super(/* html */`
            <div class="ag-advanced-filter-builder-item-condition"></div>
        `);
    }

    public init(params: {
        item: AdvancedFilterBuilderItem,
        createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp
    }): void {
        const { item, createPill } = params;
        this.item = item;
        this.createPill = createPill;
        this.filterModel = item.filterModel as ColumnAdvancedFilterModel;
        this.setupColumnCondition(this.filterModel);
    }

    public getDragName(): string {
        return this.filterModel.colId ? this.advancedFilterExpressionService.parseColumnFilterModel(this.filterModel) : 'Select a column';
    }

    private setupColumnCondition(filterModel: ColumnAdvancedFilterModel): void {
        const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
        this.baseCellDataType = columnDetails?.baseCellDataType ?? 'text';
        this.column = columnDetails?.column;
        this.numOperands = this.getNumOperands(this.getOperatorKey());
        this.render();
    }
    
    private render(): void {
        this.eColumnPill = this.createPill({
            key: this.getColumnKey(),
            displayValue: this.getColumnDisplayValue() ?? 'Select a column',
            cssClass: 'ag-advanced-filter-builder-column-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.advancedFilterExpressionService.getColumnAutocompleteEntries() }),
            update: (key) => this.setColumnKey(key)
        });
        this.getGui().appendChild(this.eColumnPill.getGui());

        if (_.exists(this.getColumnKey())) {
            this.createOperatorPill();
            if (this.hasOperand()) {
                this.createOperandPill();
            }
        }
    }

    private createOperatorPill(): void {
        this.eOperatorPill = this.createPill({
            key: this.getOperatorKey(),
            displayValue: this.getOperatorDisplayValue() ?? 'Select an option',
            cssClass: 'ag-advanced-filter-builder-option-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.getOperatorAutocompleteEntries() }),
            update: (key) => this.setOperatorKey(key),
        });
        this.eColumnPill.getGui().insertAdjacentElement('afterend', this.eOperatorPill.getGui());
    }

    private createOperandPill(): void {
        const key = this.getOperandDisplayValue() ?? '';
        this.eOperandPill = this.createPill({
            key,
            displayValue: key,
            baseCellDataType: this.baseCellDataType,
            cssClass: 'ag-advanced-filter-builder-value-pill',
            isSelect: false,
            update: (key) => this.setOperand(key)
        });
        this.getGui().appendChild(this.eOperandPill.getGui());
    }

    private getColumnKey(): string {
        return this.filterModel.colId;
    }

    private getColumnDisplayValue(): string {
        return this.advancedFilterExpressionService.parseColumnName(this.filterModel);
    }

    private getOperatorKey(): string {
        return this.filterModel.type;
    }

    private getOperatorDisplayValue(): string {
        return this.advancedFilterExpressionService.parseOperator(this.filterModel);
    }

    private getOperandDisplayValue(): string {
        return this.advancedFilterExpressionService.parseOperand(this.filterModel, true);
    }

    private hasOperand(): boolean {
        return this.numOperands > 0;
    }

    private getOperatorAutocompleteEntries(): AutocompleteEntry[] {
        return this.column
            ? this.advancedFilterExpressionService.getOperatorAutocompleteEntries(
                this.column,
                this.baseCellDataType
            )
            : [];
    }

    private setColumnKey(colId: string): void {
        if (!this.eOperatorPill) {
            this.createOperatorPill();
        }

        const newColumnDetails = this.advancedFilterExpressionService.getColumnDetails(colId);
        this.column = newColumnDetails?.column;
        const newBaseCellDataType = newColumnDetails?.baseCellDataType ?? 'text';
        if (this.baseCellDataType !== newBaseCellDataType) {
            this.baseCellDataType = newBaseCellDataType;

            this.setOperatorKey(undefined as any);
            if (this.eOperatorPill) {
                _.removeFromParent(this.eOperatorPill.getGui());
                this.createOperatorPill();
            }
            this.validate();
        }
        this.filterModel.colId = colId;
        this.filterModel.filterType = this.baseCellDataType;
    }

    private setOperatorKey(operator: string): void {
        const newNumOperands = this.getNumOperands(operator);
        if (newNumOperands !== this.numOperands) {
            this.numOperands = newNumOperands;
            if (newNumOperands === 0) {
                this.destroyOperandPill();
            } else {
                this.createOperandPill();
                if (this.baseCellDataType !== 'number') {
                    this.setOperand('');
                }
            }

        }
        this.filterModel.type = operator as any;
        this.validate();
    }

    private setOperand(operand: string): void {
        let parsedOperand: string | number = operand;
        // TODO - need to use parser here
        if (this.baseCellDataType === 'number') {
            parsedOperand = parseFloat(operand);
        }
        (this.filterModel as any).filter = parsedOperand;
        this.validate();
    }

    private getNumOperands(operator: string): number {
        return this.advancedFilterExpressionService.getExpressionOperator(this.baseCellDataType, operator)?.numOperands ?? 0;
    }

    private destroyOperandPill(): void {
        delete (this.filterModel as any).filter;
        this.getGui().removeChild(this.eOperandPill!.getGui());
        this.eOperandPill = undefined;
    }

    private validate(): void {
        const valid = _.exists(this.getColumnKey()) &&
            _.exists(this.getOperatorKey()) &&
            (
                this.numOperands === 0 ||
                !(this.baseCellDataType === 'number' && !_.exists(this.getOperandDisplayValue()))
            );

        if (valid !== this.item.valid) {
            this.item.valid = valid;
            this.dispatchEvent({
                type: AdvancedFilterBuilderEvents.VALID_CHANGED_EVENT
            });
        }
    }
}
