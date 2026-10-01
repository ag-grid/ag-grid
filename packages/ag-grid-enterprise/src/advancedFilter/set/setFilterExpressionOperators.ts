import type { AgColumn, IRowNode } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from '../advancedFilterLocaleText';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import { getColumnFilterOptions } from '../customFilterOptions';
import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from '../filterExpressionOperators';
import { getEntries } from '../filterExpressionOperators';

const SET_OPERATOR_KEYS = ['isAnyOf', 'isNoneOf'] as const;

/** Whether the column's own option list names a set operator, which is how any filter asks for them. */
export function namesSetOperator(column: AgColumn): boolean {
    const options = getColumnFilterOptions(column);
    for (let i = 0, len = options?.length ?? 0; i < len; ++i) {
        const option = options![i];
        // A key only: a definition under one of these names is the author's own option, not this one.
        if (option === 'isAnyOf' || option === 'isNoneOf') {
            return true;
        }
    }
    return false;
}

/**
 * The operand a set option is evaluated against: the row test its written values resolve to.
 * `undefined` is a row with no key to test, which excludes it from both options rather than either.
 */
type SetOperandMatcher = (node: IRowNode) => boolean | undefined;

/**
 * Overlays `is any of` / `is none of` on a column's data type operators. A Set Filter column keeps every
 * option its data type offers, so the set options are added to them rather than replacing them.
 */
export function addSetOperators(
    dataTypeOperators: DataTypeFilterExpressionOperators<any>,
    translate: (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT) => string
): DataTypeFilterExpressionOperators<any> {
    const setOperators: Record<(typeof SET_OPERATOR_KEYS)[number], FilterExpressionOperator<SetOperandMatcher>> = {
        isAnyOf: {
            displayValue: translate('advancedFilterIsAnyOf'),
            // The kind guarantees the operand: a list option is only evaluated once its values resolved.
            evaluator: (_value, node, _params, matcher) => matcher!(node) === true,
            operands: 'list',
        },
        isNoneOf: {
            displayValue: translate('advancedFilterIsNoneOf'),
            evaluator: (_value, node, _params, matcher) => matcher!(node) === false,
            operands: 'list',
        },
    };
    const operators: { [operator: string]: FilterExpressionOperator<any> } = Object.assign(
        Object.create(null),
        dataTypeOperators.operators,
        setOperators
    );
    return {
        operators,
        getEntries: (activeOperators?: string[]): AutocompleteEntry[] => getEntries(operators, activeOperators),
    };
}

/** Adds the set options to a list a data type narrowed, which cannot know about the column's filter. */
export function withSetOperators(activeOperators: string[]): string[] {
    return [...activeOperators, ...SET_OPERATOR_KEYS];
}
