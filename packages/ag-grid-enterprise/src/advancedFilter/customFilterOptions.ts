import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, FilterInputCallbackParams, IFilterOptionDef, IMultiFilterDef } from 'ag-grid-community';
import {
    _getCustomOptionDisplayName,
    _getCustomOptionNumberOfInputs,
    _isGridSuppliedFilterOptions,
} from 'ag-grid-community';

import { getChildFilter } from '../multiFilter/multiFilterUtil';
import type {
    DataTypeFilterExpressionOperators,
    FilterExpressionOperator,
    OperandsKind,
} from './filterExpressionOperators';
import { freshOperand, getEntries } from './filterExpressionOperators';

/** A list the column author wrote, as opposed to the one its data type supplies; an empty list narrows nothing. */
function getAuthoredFilterOptions(filterParams: any): (string | IFilterOptionDef)[] | undefined {
    const filterOptions = filterParams?.filterOptions;
    return !filterOptions?.length || _isGridSuppliedFilterOptions(filterOptions) ? undefined : filterOptions;
}

/** The child a Multi Filter wraps for `filterName`, where that filter's own parameters live. */
export function getMultiFilterChild(filterParams: any, filterName: string): IMultiFilterDef | undefined {
    const filters: IMultiFilterDef[] | undefined = filterParams?.filters;
    for (let i = 0, len = filters?.length ?? 0; i < len; ++i) {
        const child = filters![i];
        if (child && getChildFilter(child) === filterName) {
            return child;
        }
    }
    return undefined;
}

/** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
export function getColumnFilterOptions(column: AgColumn): (string | IFilterOptionDef)[] | undefined {
    const filterParams = column.colDef.filterParams;
    // A Multi Filter writes `filterOptions` on a child, so its own level is read only after them.
    const filters: IMultiFilterDef[] | undefined = filterParams?.filters;
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
