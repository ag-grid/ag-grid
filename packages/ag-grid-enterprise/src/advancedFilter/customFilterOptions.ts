import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, IFilterOptionDef } from 'ag-grid-community';
import {
    _getCustomOptionDisplayName,
    _getCustomOptionNumberOfInputs,
    _isGridSuppliedFilterOptions,
} from 'ag-grid-community';

import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from './filterExpressionOperators';
import { getEntries } from './filterExpressionOperators';

/**
 * A list the column author wrote, as opposed to the one a data type supplies for every column of its kind.
 * An empty list narrows to nothing, so it is not a list this column offers anything from.
 */
function getAuthoredFilterOptions(filterParams: any): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = filterParams?.filterOptions;
    return !filterOptions?.length || _isGridSuppliedFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
export function getColumnFilterOptions(column: AgColumn): (string | IFilterOptionDef)[] | undefined {
    const filterParams = column.colDef.filterParams;
    // A Multi Filter's own params carry its children, and `filterOptions` is written on a child rather than
    // on them. Its own level is read after the children, for a list written there.
    const filters: { filterParams?: any }[] | undefined = filterParams?.filters;
    for (let i = 0, len = filters?.length ?? 0; i < len; ++i) {
        const childOptions = getAuthoredFilterOptions(filters![i]?.filterParams);
        if (childOptions) {
            return childOptions;
        }
    }
    return getAuthoredFilterOptions(filterParams);
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
    customOptions.forEach((option, key) => {
        operators[key] = createCustomOptionOperator(option, localeTextFunc);
    });
    return { operators, getEntries: (activeOperators) => getEntries(operators, activeOperators) };
}

function createCustomOptionOperator(
    option: IFilterOptionDef,
    localeTextFunc: LocaleTextFunc
): FilterExpressionOperator<any> {
    const predicate = option.predicate!;
    const numOperands = _getCustomOptionNumberOfInputs(option);
    // Arity bound here rather than branched on per row; the predicate gets the raw cell value, as it does
    // in the column filter.
    let evaluator: FilterExpressionOperator<any>['evaluator'];
    if (numOperands === 0) {
        evaluator = (value) => predicate([], value);
    } else if (numOperands === 1) {
        evaluator = (value, _node, _params, operand1) => predicate([operand1], value);
    } else {
        evaluator = (value, _node, _params, operand1, operand2) => predicate([operand1, operand2], value);
    }
    return { displayValue: _getCustomOptionDisplayName(option, localeTextFunc), evaluator, numOperands };
}
