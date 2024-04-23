import { AutocompleteEntry, AutocompleteListParams, BaseCellDataType, BeanStub, Column, ColumnAdvancedFilterModel, JoinAdvancedFilterModel } from 'ag-grid-community';
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import { DataTypeFilterExpressionOperators, FilterExpressionEvaluatorParams, FilterExpressionOperator, FilterExpressionOperators } from './filterExpressionOperators';
export declare class AdvancedFilterExpressionService extends BeanStub {
    private valueService;
    private columnModel;
    private dataTypeService;
    private columnNameToIdMap;
    private columnAutocompleteEntries;
    private expressionOperators;
    private expressionJoinOperators;
    private expressionEvaluatorParams;
    private postConstruct;
    parseJoinOperator(model: JoinAdvancedFilterModel): string;
    getColumnDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperatorDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperandModelValue(operand: string, baseCellDataType: BaseCellDataType, column: Column): string | number | null;
    getOperandDisplayValue(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string;
    parseColumnFilterModel(model: ColumnAdvancedFilterModel): string;
    updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void;
    translate(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]): string;
    generateAutocompleteListParams(entries: AutocompleteEntry[], type: string, searchString: string): AutocompleteListParams;
    getColumnAutocompleteEntries(): AutocompleteEntry[];
    getOperatorAutocompleteEntries(column: Column, baseCellDataType: BaseCellDataType): AutocompleteEntry[];
    getJoinOperatorAutocompleteEntries(): AutocompleteEntry[];
    getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams;
    getDataTypeExpressionOperator(baseCellDataType?: BaseCellDataType): DataTypeFilterExpressionOperators<any> | undefined;
    getExpressionOperator(baseCellDataType?: BaseCellDataType, operator?: string): FilterExpressionOperator<any> | undefined;
    getExpressionJoinOperators(): {
        AND: string;
        OR: string;
    };
    getColId(columnName: string): {
        colId: string;
        columnName: string;
    } | null;
    getExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue>(colId: string): FilterExpressionEvaluatorParams<ConvertedTValue, TValue>;
    getColumnDetails(colId: string): {
        column?: Column;
        baseCellDataType: BaseCellDataType;
    };
    generateExpressionOperators(): FilterExpressionOperators;
    getColumnValue({ displayValue }: AutocompleteEntry): string;
    private generateExpressionJoinOperators;
    private getActiveOperators;
    resetColumnCaches(): void;
}
