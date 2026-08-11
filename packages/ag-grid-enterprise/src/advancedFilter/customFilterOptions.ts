import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, IFilterOptionDef } from 'ag-grid-community';
import { _getCustomOptionNumberOfInputs, _isGridSuppliedFilterOptions } from 'ag-grid-community';

import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from './filterExpressionOperators';
import { findMatch, getEntries } from './filterExpressionOperators';

/** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
export function getColumnFilterOptions(column: AgColumn): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = column.colDef.filterParams?.filterOptions;
    // A data type's own list is not the column authoring anything, so it contributes no options of its own.
    return !filterOptions || _isGridSuppliedFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** Overlays a column's Custom Filter Options on its data type's operators, replacing a built-in of the same key. */
export function createCustomOptionOperators(
    dataTypeOperators: DataTypeFilterExpressionOperators<any>,
    customOptions: Map<string, IFilterOptionDef>,
    localeTextFunc: LocaleTextFunc
): DataTypeFilterExpressionOperators<any> {
    const operators: { [operator: string]: FilterExpressionOperator<any> } = Object.assign(
        Object.create(null),
        dataTypeOperators.operators
    );
    const customKeys: string[] = [];
    customOptions.forEach((option, key) => {
        customKeys.push(key);
        operators[key] = createCustomOptionOperator(option, localeTextFunc);
    });

    return {
        operators,
        getEntries: (activeOperators) => getEntries(operators, activeOperators),
        findOperator: (displayValue) => {
            const search = displayValue.toLocaleLowerCase();
            // The column's own option owns the name it is offered under: a built-in written the same way is
            // not what the column offers, and matching it would run the wrong evaluator under that name.
            for (let i = 0, len = customKeys.length; i < len; ++i) {
                const key = customKeys[i];
                if (operators[key].displayValue.toLocaleLowerCase() === search) {
                    return key;
                }
            }
            const byDisplayName = findMatch(displayValue, operators, (operator) => operator.displayValue);
            if (byDisplayName) {
                return byDisplayName;
            }
            // A `displayKey` stands in for the name, and the match rewrites it to the name in the expression.
            for (let i = 0, len = customKeys.length; i < len; ++i) {
                const key = customKeys[i];
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
