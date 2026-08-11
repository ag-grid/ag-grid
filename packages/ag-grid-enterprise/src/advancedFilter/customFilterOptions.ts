import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, IFilterOptionDef } from 'ag-grid-community';
import { _getCustomOptionNumberOfInputs, _isDataTypeFilterOptions, _isValidFilterOptionDef } from 'ag-grid-community';

import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from './filterExpressionOperators';
import { findMatch, getEntries } from './filterExpressionOperators';

/** An option that can actually filter: nothing runs anything but `predicate`. */
export function isCustomFilterOption(option: string | IFilterOptionDef): option is IFilterOptionDef {
    return option != null && typeof option !== 'string' && _isValidFilterOptionDef(option);
}

/** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
export function getColumnFilterOptions(column: AgColumn): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = column.colDef.filterParams?.filterOptions;
    // A data type's own list is not the column authoring anything, so it contributes no options of its own.
    return !filterOptions || _isDataTypeFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** Overlays a column's Custom Filter Options on its data type's operators, replacing a built-in of the same key. */
export function createCustomOptionOperators(
    dataTypeOperators: DataTypeFilterExpressionOperators<any>,
    customOptions: IFilterOptionDef[],
    localeTextFunc: LocaleTextFunc
): DataTypeFilterExpressionOperators<any> {
    const operators: { [operator: string]: FilterExpressionOperator<any> } = Object.assign(
        Object.create(null),
        dataTypeOperators.operators
    );
    for (let i = 0, len = customOptions.length; i < len; ++i) {
        const option = customOptions[i];
        operators[option.displayKey] = createCustomOptionOperator(option, localeTextFunc);
    }

    return {
        operators,
        getEntries: (activeOperators) => getEntries(operators, activeOperators),
        findOperator: (displayValue) => {
            const byDisplayName = findMatch(displayValue, operators, (operator) => operator.displayValue);
            if (byDisplayName) {
                return byDisplayName;
            }
            // A `displayKey` stands in for the name, and the match rewrites it to the name in the expression.
            const search = displayValue.toLocaleLowerCase();
            for (let i = 0, len = customOptions.length; i < len; ++i) {
                const key = customOptions[i].displayKey;
                if (key.toLocaleLowerCase() === search) {
                    return key;
                }
            }
            // `null` is the partial-match signal, which a failed key lookup must not swallow.
            return byDisplayName;
        },
    };
}

/** Handed to every zero-operand predicate rather than allocated per row. Never mutated. */
const NO_OPERANDS: any[] = [];

function createCustomOptionOperator(
    option: IFilterOptionDef,
    localeTextFunc: LocaleTextFunc
): FilterExpressionOperator<any> {
    const { displayKey, displayName, predicate } = option;
    const numOperands = _getCustomOptionNumberOfInputs(option);
    // Arity bound here rather than branched on per row; the predicate gets the raw cell value.
    let evaluator: FilterExpressionOperator<any>['evaluator'];
    if (numOperands === 0) {
        evaluator = (value) => predicate(NO_OPERANDS, value);
    } else if (numOperands === 1) {
        evaluator = (value, _node, _params, operand1) => predicate([operand1], value);
    } else {
        evaluator = (value, _node, _params, operand1, operand2) => predicate([operand1, operand2], value);
    }
    return { displayValue: localeTextFunc(displayKey, displayName), evaluator, numOperands };
}
