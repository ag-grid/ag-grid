import { AdvancedFilterModel, AutocompleteEntry, BeanStub, IAdvancedFilterService, IRowNode } from "ag-grid-community";
import { FilterExpressionParser } from "./filterExpressionParser";
import { AdvancedFilterCtrl } from "./advancedFilterCtrl";
export declare class AdvancedFilterService extends BeanStub implements IAdvancedFilterService {
    private valueService;
    private columnModel;
    private dataTypeService;
    private rowModel;
    private advancedFilterExpressionService;
    private enabled;
    private ctrl;
    private expressionProxy;
    private appliedExpression;
    /** The value displayed in the input, which may be invalid */
    private expression;
    private expressionFunction;
    private expressionParams;
    private isValid;
    private postConstruct;
    isEnabled(): boolean;
    isFilterPresent(): boolean;
    doesFilterPass(node: IRowNode): boolean;
    getModel(): AdvancedFilterModel | null;
    setModel(model: AdvancedFilterModel | null): void;
    getExpressionDisplayValue(): string | null;
    setExpressionDisplayValue(expression: string | null): void;
    isCurrentExpressionApplied(): boolean;
    createExpressionParser(expression: string | null): FilterExpressionParser | null;
    getDefaultExpression(updateEntry: AutocompleteEntry): {
        updatedValue: string;
        updatedPosition: number;
    };
    isHeaderActive(): boolean;
    getCtrl(): AdvancedFilterCtrl;
    private setEnabled;
    applyExpression(): void;
    private applyExpressionFromParser;
    private getFunction;
    updateValidity(): boolean;
    private onNewColumnsLoaded;
}
