import type { LocaleTextFunc } from 'ag-stack';
import { _defaultComparator, _last, _toStringOrNull, _translate } from 'ag-stack';

import type { AgColumn, BeanCollection, ISetFilterParams, ValueFormatterParams } from 'ag-grid-community';
import { _isBlank } from 'ag-grid-community';

import type { SetFilterLocaleTextKey } from './localeText';
import { DEFAULT_LOCALE_TEXT } from './localeText';

export function processDataPath(
    dataPath: string[] | null,
    treeData: boolean,
    groupAllowUnbalanced: boolean
): (string | null)[] | null {
    let processedDataPath: (string | null)[] | null = dataPath;
    if (!processedDataPath) {
        return null;
    }

    processedDataPath = processedDataPath.map((treeKey) => _toStringOrNull(setFilterNullIfBlank(treeKey)));

    // leave `null`s in the path unless unbalanced groups
    if (!treeData && groupAllowUnbalanced && processedDataPath.some((treeKey) => treeKey == null)) {
        if (_last(processedDataPath) == null) {
            return null;
        }
        return processedDataPath.filter((treeKey) => treeKey != null);
    }
    return processedDataPath;
}

/**
 * The Set Filter's missing value. Whitespace counts, so a blank cannot split into several keys the list
 * then renders as separate empty rows.
 */
export function setFilterNullIfBlank<T>(value?: T): T | null {
    // `_isBlank` is not a type predicate, so the null test is what narrows `undefined` away, not redundancy.
    return value == null || _isBlank(value) ? null : value;
}

/** The Set Filter formats with its own formatter only, never the column's. */
export function setFilterFormattedValue(
    beans: BeanCollection,
    column: AgColumn,
    value: unknown,
    valueFormatter: ((params: ValueFormatterParams) => string) | undefined
): string | null {
    return beans.valueSvc.formatValue(column, null, value, valueFormatter, false);
}

export function translateForSetFilter(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    key: SetFilterLocaleTextKey,
    variableValues?: string[]
): string {
    return _translate(bean, DEFAULT_LOCALE_TEXT, key, variableValues);
}

export function applyExcelModeOptions<V>(params: ISetFilterParams<any, V>, beans: BeanCollection): void {
    // apply default options to match Excel behaviour, unless they have already been specified
    if (params.excelMode === 'windows') {
        if (!params.buttons) {
            params.buttons = ['apply', 'cancel'];
        }

        if (params.closeOnApply == null) {
            params.closeOnApply = true;
        }
    } else if (params.excelMode === 'mac') {
        if (!params.buttons) {
            params.buttons = ['reset'];
        }

        if (params.applyMiniFilterWhileTyping == null) {
            params.applyMiniFilterWhileTyping = true;
        }

        if (params.debounceMs == null) {
            params.debounceMs = 500;
        }
    }
    if (params.excelMode && params.defaultToNothingSelected) {
        params.defaultToNothingSelected = false;
        beans.log.warn(207);
    }
}

export function createTreeDataOrGroupingComparator(): (
    a: [string | null, string[] | null],
    b: [string | null, string[] | null]
) => number {
    return ([_aKey, aValue]: [string | null, string[] | null], [_bKey, bValue]: [string | null, string[] | null]) => {
        if (aValue == null) {
            return bValue == null ? 0 : -1;
        } else if (bValue == null) {
            return 1;
        }
        for (let i = 0; i < aValue.length; i++) {
            if (i >= bValue.length) {
                return 1;
            }
            const diff = _defaultComparator(aValue[i], bValue[i]);
            if (diff !== 0) {
                return diff;
            }
        }
        return 0;
    };
}
