import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, IFilterOptionDef } from 'ag-grid-community';
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
import { getEntries } from './filterExpressionOperators';

/** A list the column author wrote, as opposed to the one its data type supplies; an empty list narrows nothing. */
function getAuthoredFilterOptions(filterParams: any): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = filterParams?.filterOptions;
    return !filterOptions?.length || _isGridSuppliedFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
export function getColumnFilterOptions(column: AgColumn): (string | IFilterOptionDef)[] | undefined {
    const filterParams = column.colDef.filterParams;
    // A Multi Filter writes `filterOptions` on a child, so its own level is read only after them.
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
    // Arity bound here rather than branched on per row; the predicate gets the raw cell value.
    let evaluator: FilterExpressionOperator<any>['evaluator'];
    let operands: OperandsKind;
    switch (_getCustomOptionNumberOfInputs(option)) {
        case 0:
            evaluator = (value) => predicate([], value);
            operands = 'none';
            break;
        case 1:
            evaluator = (value, _node, _params, operand1) => predicate([operand1], value);
            operands = 'one';
            break;
        default:
            evaluator = (value, _node, _params, operand1, operand2) => predicate([operand1, operand2], value);
            operands = 'range';
            break;
    }
    return { displayValue: _getCustomOptionDisplayName(option, localeTextFunc), evaluator, operands };
}
