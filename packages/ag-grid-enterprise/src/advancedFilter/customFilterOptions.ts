import type { LocaleTextFunc } from 'ag-stack';

import type { FilterInputCallbackParams, IFilterOptionDef } from 'ag-grid-community';
import {
    _getCustomOptionDisplayName,
    _getCustomOptionNumberOfInputs,
    _isGridSuppliedFilterOptions,
} from 'ag-grid-community';

import type {
    DataTypeFilterExpressionOperators,
    FilterExpressionOperator,
    OperandsKind,
} from './filterExpressionOperators';
import { freshOperand, getEntries } from './filterExpressionOperators';

/** A list the column author wrote, as opposed to the one its data type supplies; an empty list narrows nothing. */
export function getAuthoredFilterOptions(filterParams: any): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = filterParams?.filterOptions;
    return !filterOptions?.length || _isGridSuppliedFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** Overlays a column's Custom Filter Options on its data type's operators, replacing a built-in of the same key. */
export function createCustomOptionOperators(
    dataTypeOperators: DataTypeFilterExpressionOperators<any>,
    customOptions: Map<string, IFilterOptionDef>,
    localeTextFunc: LocaleTextFunc,
    callbackParams: () => FilterInputCallbackParams
): DataTypeFilterExpressionOperators<any> {
    const operators: { [operator: string]: FilterExpressionOperator<any> } = Object.assign(
        Object.create(null),
        dataTypeOperators.operators
    );
    customOptions.forEach((option, key) => {
        operators[key] = createCustomOptionOperator(option, localeTextFunc, callbackParams);
    });
    return { operators, getEntries: (activeOperators) => getEntries(operators, activeOperators) };
}

function createCustomOptionOperator(
    option: IFilterOptionDef,
    localeTextFunc: LocaleTextFunc,
    callbackParams: () => FilterInputCallbackParams
): FilterExpressionOperator<any> {
    const predicate = option.predicate!;
    // Arity bound here rather than branched on per row; the predicate gets the raw cell value.
    let evaluator: FilterExpressionOperator<any>['evaluator'];
    let operands: OperandsKind;
    switch (_getCustomOptionNumberOfInputs(option)) {
        case 0:
            evaluator = (value) => predicate([], value, callbackParams());
            operands = 'none';
            break;
        case 1:
            evaluator = (value, _node, _params, operand1) =>
                predicate([freshOperand(operand1)], value, callbackParams());
            operands = 'one';
            break;
        default:
            evaluator = (value, _node, _params, operand1, operand2) =>
                predicate([freshOperand(operand1), freshOperand(operand2)], value, callbackParams());
            operands = 'range';
            break;
    }
    return { displayValue: _getCustomOptionDisplayName(option, localeTextFunc), evaluator, operands };
}
