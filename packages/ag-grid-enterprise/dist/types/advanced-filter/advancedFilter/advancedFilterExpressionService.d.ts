import type { AgColumn, BaseCellDataType, BeanCollection, ColumnAdvancedFilterModel, JoinAdvancedFilterModel, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type { DataTypeFilterExpressionOperators, FilterExpressionEvaluatorParams, FilterExpressionOperator, FilterExpressionOperators } from './filterExpressionOperators';
export declare class AdvancedFilterExpressionService extends BeanStub implements NamedBean {
    beanName: "advancedFilterExpressionService";
    private valueService;
    private columnModel;
    private columnNameService;
    private dataTypeService?;
    wireBeans(beans: BeanCollection): void;
    private columnNameToIdMap;
    private columnAutocompleteEntries;
    private expressionOperators;
    private expressionJoinOperators;
    private expressionEvaluatorParams;
    postConstruct(): void;
    parseJoinOperator(model: JoinAdvancedFilterModel): string;
    getColumnDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperatorDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperandModelValue(operand: string, baseCellDataType: BaseCellDataType, column: AgColumn): string | number | null;
    getOperandDisplayValue(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string;
    parseColumnFilterModel(model: ColumnAdvancedFilterModel): string;
    updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void;
    translate(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]): string;
    generateAutocompleteListParams(entries: AutocompleteEntry[], type: string, searchString: string): AutocompleteListParams;
    getColumnAutocompleteEntries(): AutocompleteEntry[];
    getOperatorAutocompleteEntries(column: AgColumn, baseCellDataType: BaseCellDataType): AutocompleteEntry[];
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
        column?: AgColumn;
        baseCellDataType: BaseCellDataType;
    };
    generateExpressionOperators(): FilterExpressionOperators;
    getColumnValue({ displayValue }: AutocompleteEntry): string;
    private generateExpressionJoinOperators;
    private getActiveOperators;
    resetColumnCaches(): void;
}
