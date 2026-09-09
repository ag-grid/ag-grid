import type { LocaleTextFunc } from 'ag-stack';

import type {
    AgColumn,
    FilterInputCallbackParams,
    FilterOptionsConfig,
    IFilterOptionDef,
    IMultiFilterDef,
} from 'ag-grid-community';
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

/** What the column author wrote, as opposed to what its data type supplies; naming nothing narrows nothing. */
function getAuthoredFilterOptions(filterParams: any): FilterOptionsConfig | undefined {
    const filterOptions = filterParams?.filterOptions;
    if (!filterOptions || _isGridSuppliedFilterOptions(filterOptions)) {
        return undefined;
    }
    const named = Array.isArray(filterOptions) ? filterOptions.length : Object.keys(filterOptions).length;
    return named ? filterOptions : undefined;
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

/**
 * What the column narrows itself to, innermost first: a Multi Filter writes on the child that owns each
 * filter, and its own level speaks for the column. Each is applied over what the ones before it left, so
 * a record adjusts them and a list states the whole of what that level offers.
 */
export function getColumnFilterOptions(column: AgColumn): FilterOptionsConfig[] {
    const filterParams = column.colDef.filterParams;
    const configs: FilterOptionsConfig[] = [];
    const filters: IMultiFilterDef[] | undefined = filterParams?.filters;
    for (let i = 0, len = filters?.length ?? 0; i < len; ++i) {
        const childOptions = getAuthoredFilterOptions(filters![i]?.filterParams);
        if (childOptions) {
            configs.push(childOptions);
        }
    }
    const ownOptions = getAuthoredFilterOptions(filterParams);
    if (ownOptions) {
        configs.push(ownOptions);
    }
    return configs;
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
