import type { AgColumn, IFilterOptionDef, IRowNode } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from '../advancedFilterLocaleText';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import { getColumnFilterOptions } from '../customFilterOptions';
import type { DataTypeFilterExpressionOperators, FilterExpressionOperator } from '../filterExpressionOperators';
import { getEntries } from '../filterExpressionOperators';

const SET_OPERATOR_KEYS = ['isAnyOf', 'isNoneOf'] as const;

/** What a column's option list says about each set operator; absent where it says nothing about that one. */
interface SetOperatorsNamed {
    isAnyOf?: boolean;
    isNoneOf?: boolean;
}

/**
 * What the column's own option list says about the set operators, per option: a column can offer one and
 * withhold the other, so they are answered apart and only combined against what the column inherits.
 * A key only, since a definition under one of these names is the author's own option rather than this one.
 */
export function namesSetOperator(column: AgColumn): SetOperatorsNamed {
    const configs = getColumnFilterOptions(column);
    // Tracked apart, since a column can offer one option without the other; the options themselves are
    // narrowed later, so what is decided here is only whether either survives to be installed at all.
    const named: SetOperatorsNamed = {};
    // The first list is the whole of what that level offers, as it is for the options themselves; a list
    // naming neither says nothing here, so the column's own filter still decides.
    const firstList = configs.find((config) => Array.isArray(config));
    for (let i = 0, len = firstList?.length ?? 0; i < len; ++i) {
        const option = (firstList as (string | IFilterOptionDef)[])[i];
        if (typeof option === 'string' && SET_OPERATOR_KEYS.includes(option as (typeof SET_OPERATOR_KEYS)[number])) {
            named[option as (typeof SET_OPERATOR_KEYS)[number]] = true;
        }
    }
    // Every record adjusts, innermost first, so the level nearest the column has the last word.
    for (let i = 0, len = configs.length; i < len; ++i) {
        const config = configs[i];
        if (Array.isArray(config)) {
            continue;
        }
        for (let j = 0, jLen = SET_OPERATOR_KEYS.length; j < jLen; ++j) {
            const key = SET_OPERATOR_KEYS[j];
            const value = config[key];
            if (typeof value === 'boolean') {
                named[key] = value;
            }
        }
    }
    return named;
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
