import type { IRowNode } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from '../advancedFilterLocaleText';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from '../filterExpressionOperators';
import { getEntries } from '../filterExpressionOperators';

const SET_OPERATOR_KEYS = ['isAnyOf', 'isNoneOf'] as const;

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
